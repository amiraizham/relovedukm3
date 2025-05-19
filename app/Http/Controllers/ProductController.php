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

class ProductController extends Controller
{
    // ✅ Show paginated list of approved + available products
    public function index(Request $request)
    {
        $category = $request->query('category');
        $sort = $request->query('sort');

        $products = Product::where('is_approved', 1)
            ->where('product_status', '!=', 'sold')
            ->when($category, fn($q) => $q->where('product_category', $category))
            ->when($sort, function ($q) use ($sort) {
                return match ($sort) {
                    'latest' => $q->orderBy('created_at', 'desc'),
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
                'image' => $product->product_img ?? null,
                'price' => $product->product_price,
                'category' => $product->product_category,
                'created_at' => $product->created_at,
            ]),
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

    // ✅ Edit product
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

        $request->validate([
            'product_name' => 'required|string|max:255',
            'product_desc' => 'required|string',
            'product_price' => 'required|numeric|min:0',
            'product_category' => 'required|string|max:255',
            'product_img' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $product->update([
            'product_name' => $request->product_name,
            'product_desc' => $request->product_desc,
            'product_price' => $request->product_price,
            'product_category' => $request->product_category,
        ]);

        if ($request->hasFile('product_img')) {
            $file = $request->file('product_img');
            $fileKey = 'products/' . time() . '-' . $file->getClientOriginalName();
            Storage::disk('s3')->put($fileKey, fopen($file->getPathname(), 'r+'));

            $product->product_img = 'https://' . config('filesystems.disks.s3.bucket') .
                '.s3.' . config('filesystems.disks.s3.region') . '.amazonaws.com/' . $fileKey;
            $product->save();
        }

        return redirect()->route('products.details', $product->product_id)->with('success', 'Product updated!');
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
