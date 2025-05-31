<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;

class AdminController extends Controller
{
    public function dashboard()
    {
        $pendingProducts = \App\Models\Product::with('user')
            ->whereNull('is_approved')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->product_id,
                    'name' => $product->product_name,
                    'created_at' => $product->created_at->toDateTimeString(),
                    'user' => [
                        'email' => $product->user->email,
                    ],
                ];
            });


        return Inertia::render('Admin/Dashboard', [
            'pendingProducts' => $pendingProducts,
        ]);
    }

    public function approveProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->is_approved = 1;
        $product->save();

        return redirect()->route('admin.dashboard')->with('success', 'Product approved.');
    }

    public function rejectProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->is_approved = 0;
        $product->rejection_reason = $request->input('reason');
        $product->save();

        return redirect()->route('admin.dashboard')->with('info', 'Product rejected.');
    }



    public function preview($id)
    {
        $product = \App\Models\Product::with('user')->findOrFail($id);

        return Inertia::render('Admin/ProductPreview', [
            'product' => [
                'id' => $product->product_id,
                'name' => $product->product_name,
                'description' => $product->product_desc,
                'price' => $product->product_price,
                'category' => $product->product_category,
                'image' => $product->product_img,
                'created_at' => $product->created_at->toDateTimeString(),
                'user' => [
                    'name' => $product->user->name,
                    'email' => $product->user->email,
                ]
            ]
        ]);
    }
}
