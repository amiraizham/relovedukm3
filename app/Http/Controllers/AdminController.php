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
            ->where('is_approved', 0)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->product_id,
                    'name' => $product->product_name,
                    'created_at' => $product->created_at->toDateTimeString(),
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

    public function rejectProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->is_approved = 0;
        $product->save();

        return redirect()->route('admin.dashboard')->with('info', 'Product rejected.');
    }
}
