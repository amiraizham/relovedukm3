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
use Illuminate\Support\Facades\DB;

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

        $request->validate([
            'product_name' => 'required|string|max:255',
            'product_desc' => 'required|string',
            'product_price' => 'required|numeric|min:0',
            'product_category' => 'required|string|max:255',
            'product_img' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // // ✅ Debug point 1: check entire request content
        // dd($request->all());

        // // ✅ Debug point 2 (optional): explicitly check for file
        // if (!$request->hasFile('product_img')) {
        //     Log::error('Image not received.');
        //     return back()->with('error', 'Image file missing from request.');
        // }

        try {
            $file = $request->file('product_img');
            $fileKey = 'products/' . time() . '-' . $file->getClientOriginalName();
            $uploaded = Storage::disk('s3')->put($fileKey, fopen($file->getPathname(), 'r+'));

            if (!$uploaded) {
                return back()->with('error', 'Image upload failed.');
            }

            $imageUrl = 'https://' . config('filesystems.disks.s3.bucket') .
                '.s3.' . config('filesystems.disks.s3.region') . '.amazonaws.com/' . $fileKey;

            Product::create([
                'user_id' => Auth::id(),
                'product_name' => $request->product_name,
                'product_desc' => $request->product_desc,
                'product_price' => $request->product_price,
                'product_category' => $request->product_category,
                'product_img' => $imageUrl,
                'is_approved' => 0,
                'product_status' => 'available',
            ]);

            return redirect()->route('dashboard')->with('success', 'Product submitted for approval.');
        } catch (\Exception $e) {
            Log::error('S3 Upload Error', ['message' => $e->getMessage()]);
            return back()->with('error', 'Upload failed: ' . $e->getMessage());
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


    // ✅ Update product
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        if ($product->user_id !== Auth::id()) {
            abort(403);
        }

        // Only update fields that are filled (not null or empty string)
        $data = collect($request->only([
            'product_name',
            'product_desc',
            'product_price',
            'product_category',
        ]))->filter(function ($value) {
            return !is_null($value) && $value !== '';
        })->toArray();


        $product->update($data);


        if ($request->hasFile('product_img')) {
            $file = $request->file('product_img');
            $fileKey = 'products/' . time() . '-' . $file->getClientOriginalName();
            Storage::disk('s3')->put($fileKey, fopen($file->getPathname(), 'r+'));

            $product->product_img = 'https://' . config('filesystems.disks.s3.bucket') .
                '.s3.' . config('filesystems.disks.s3.region') . '.amazonaws.com/' . $fileKey;
            $product->save();
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

        return redirect()->route('products.index')->with('success', 'Product deleted.');
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        $alreadyBooked = Booking::where('product_id', $product->product_id)
            ->where('buyeruser_id', Auth::id())
            ->exists();

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
                'alreadyBooked' => $alreadyBooked,
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
