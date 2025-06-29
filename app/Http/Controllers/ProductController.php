<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ProductApprovalMail;
use Carbon\Carbon;


class ProductController extends Controller
{

    public function index(Request $request)
    {
        $search = $request->query('search');
        $category = $request->query('category');
        $sort = $request->query('sort');

        $products = Product::with('user')
            ->where('is_approved', 1)
            ->where('product_status', '!=', 'sold')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($subQuery) use ($search) {
                    $subQuery->where('product_name', 'like', "%$search%")
                        ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%$search%"));
                });
            })
            ->when($category, fn($q) => $q->where('product_category', $category))
            ->when($sort, function ($q) use ($sort) {
                return match ($sort) {
                    'latest' => $q->orderBy('created_at', 'desc'),
                    'oldest' => $q->orderBy('created_at', 'asc'),
                    'price_low_high' => $q->orderBy('product_price', 'asc'),
                    'price_high_low' => $q->orderBy('product_price', 'desc'),
                    default => $q,
                };
            }, fn($q) => $q->orderBy('created_at', 'desc'))
            ->paginate(8)
            ->withQueryString();

        return Inertia::render('Dashboard', [
            'products' => $products->through(fn($product) => [
                'id' => $product->product_id,
                'title' => $product->product_name,
                'price' => $product->product_price,
                'image' => $product->product_img,
                'category' => $product->product_category,
                'created_at' => $product->created_at,
                'user_id' => $product->user_id,
                'user' => [
                    'id' => $product->user->id,
                    'name' => $product->user->name,
                ],
            ]),
            'search' => $search,
            'category' => $category,
            'sort' => $sort,
        ]);
    }



    // ✅ Show the product sell form
    public function showSellForm()
    {
        return Inertia::render('products/sellform');
    }

    // ✅ Store new product with image
    public function store(Request $request)
    {
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'Please log in to sell products.');
        }

        try {
            $request->validate([
                'product_name' => 'required|string|max:255',
                'product_desc' => 'required|string',
                'product_price' => 'required|numeric|min:0',
                'product_category' => 'required|string|max:255',
                'product_img' => 'required|image|mimes:jpeg,png,jpg,gif|max:8192', // Increased to 8MB
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->validator)->withInput();
        }

        try {
            $file = $request->file('product_img');

            if (!$file) {
                return back()->with('error', 'No image was uploaded. Please try again.');
            }

            $fileKey = 'products/' . time() . '-' . $file->getClientOriginalName();
            $uploaded = Storage::disk('s3')->put($fileKey, fopen($file->getPathname(), 'r+'));

            if (!$uploaded) {
                return back()->with('error', 'Image upload to S3 failed. Please try again.');
            }

            $imageUrl = 'https://' . config('filesystems.disks.s3.bucket') .
                '.s3.' . config('filesystems.disks.s3.region') . '.amazonaws.com/' . $fileKey;

            $product = Product::create([
                'user_id' => Auth::id(),
                'product_name' => $request->product_name,
                'product_desc' => $request->product_desc,
                'product_price' => $request->product_price,
                'product_category' => $request->product_category,
                'product_img' => $imageUrl,
                'product_status' => 'available',
            ]);

            if ($product->is_approved === null) {
                $adminUsers = User::where('role', 'admin')->pluck('email');

                foreach ($adminUsers as $adminEmail) {
                    Mail::to($adminEmail)->send(new ProductApprovalMail($product));
                }
            }

            return redirect()->route('dashboard')->with('success', 'Product submitted for approval.');
        } catch (\Exception $e) {
            Log::error('Product Upload Error', ['message' => $e->getMessage()]);
            return back()->with('error', 'Upload failed: ' . $e->getMessage())->withInput();
        }
    }


    //✅ Edit product
    public function edit($id)
    {
        $product = Product::findOrFail($id);

        if ($product->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('EditProduct', [
            'product' => $product,
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        if ($product->user_id !== Auth::id()) {
            abort(403);
        }

        // ✅ Validate fields and image (max 8MB)
        $request->validate([
            'product_name' => 'nullable|string|max:255',
            'product_desc' => 'nullable|string',
            'product_price' => 'nullable|numeric|min:0',
            'product_category' => 'nullable|string|max:255',
            'product_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:8192',
        ]);

        // ✅ Only update filled fields
        $data = collect($request->only([
            'product_name',
            'product_desc',
            'product_price',
            'product_category',
        ]))->filter(function ($value) {
            return !is_null($value) && $value !== '';
        })->toArray();

        $product->update($data);

        // ✅ Handle new image upload and delete old one
        if ($request->hasFile('product_img')) {
            try {
                // Extract old S3 path from full URL
                $oldImageUrl = $product->product_img;
                $bucket = config('filesystems.disks.s3.bucket');
                $region = config('filesystems.disks.s3.region');
                $baseUrl = "https://{$bucket}.s3.{$region}.amazonaws.com/";
                $oldFileKey = str_replace($baseUrl, '', $oldImageUrl);

                // ✅ Delete old image from S3
                if ($oldFileKey && Storage::disk('s3')->exists($oldFileKey)) {
                    Storage::disk('s3')->delete($oldFileKey);
                }

                // ✅ Upload new image
                $file = $request->file('product_img');
                $fileKey = 'products/' . time() . '-' . $file->getClientOriginalName();
                Storage::disk('s3')->put($fileKey, fopen($file->getPathname(), 'r+'));

                // ✅ Update DB with new image URL
                $product->product_img = 'https://' . $bucket . '.s3.' . $region . '.amazonaws.com/' . $fileKey;
                $product->save();
            } catch (\Exception $e) {
                Log::error('Product image update failed', ['message' => $e->getMessage()]);
                return back()->with('error', 'Image upload failed. Please try again.');
            }
        }

        return redirect()->route('products.show', $product->product_id)->with('success', 'Product updated!');
    }



    // ✅ Delete product
    public function delete($id)
    {
        $product = Product::findOrFail($id);

        if ($product->user_id !== Auth::id()) {
            abort(403);
        }

        $product->delete();

        return redirect()->route('profile.show', Auth::id())->with('success', 'Product deleted.');
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        $activeBooking = Booking::where('product_id', $product->product_id)
            ->whereNotIn('status', ['rejected', 'sold'])
            ->latest()
            ->first();

        $alreadyBooked = false;
        $approvedBooking = false;

        if ($activeBooking) {
            $bookingTime = Carbon::parse($activeBooking->created_at);
            if ($bookingTime->diffInMinutes(now()) < 120) {
                $alreadyBooked = true;
            }

            // Check if this booking is approved for the current user
            if (Auth::id() === $activeBooking->buyeruser_id && $activeBooking->status === 'approved') {
                $approvedBooking = true;
            }
        }

        return Inertia::render('ProductDetail', [
            'product' => [
                'id' => $product->product_id,
                'title' => $product->product_name,
                'price' => $product->product_price,
                'description' => $product->product_desc,
                'category' => $product->product_category,
                'image' => $product->product_img,
                'status' => $product->product_status,
                'created_at' => $product->created_at,
                'user_id' => $product->user_id,
                'user' => [
                    'name' => $product->user->name,
                    'avatar' => $product->user->avatar ?? null, // optional fallback
                ],
                'alreadyBooked' => $alreadyBooked, // Specific to this product
                'approvedBooking' => $approvedBooking, // Specific to this product
            ],
        ]);
    }




    // ✅ Search by name or description
    public function search(Request $request)
    {
        $query = $request->input('query');

        $products = Product::where('is_approved', 1)
            ->where(function ($q) use ($query) {
                $q->where('product_name', 'like', "%$query%")
                    ->orWhere('product_desc', 'like', "%$query%");
            })
            ->paginate(12);

        return Inertia::render('ProductList', [
            'products' => $products,
        ]);
    }

    // ✅ Mark as sold
    public function markAsSold($id)
    {
        $product = Product::findOrFail($id);

        if ($product->user_id !== Auth::id()) {
            return back()->with('error', 'You are not the owner of this product.');
        }

        $product->product_status = 'sold';
        $product->save();

        return back()->with('success', 'Product marked as sold.');
    }
}
