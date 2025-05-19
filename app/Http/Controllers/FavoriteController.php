<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FavoriteController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $favorites = Favorite::with('product')
            ->where('user_id', $user->id)
            ->get();

        return Inertia::render('Favourites', [
            'favorites' => $favorites->filter(fn($fav) => $fav->product !== null)  // only keep valid products
                ->map(fn($fav) => [
                    'id' => $fav->product->product_id,
                    'title' => $fav->product->product_name,
                    'image' => $fav->product->product_img,
                    'price' => $fav->product->product_price,
                    'category' => $fav->product->product_category,
                    'created_at' => $fav->product->created_at,
                ]),
        ]);
    }

    public function store(Product $product)
    {
        if (!$product) {
            return back()->with('error', 'Product not found.');
        }

        $user = Auth::user();

        Favorite::firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $product->product_id,
        ]);

        return back()->with('success', 'Product added to favorites.');
    }


    public function destroy(Product $product)
    {
        $user = Auth::user();

        Favorite::where([
            ['user_id', $user->id],
            ['product_id', $product->product_id],
        ])->delete();

        return back()->with('success', 'Product removed from favorites.');
    }
}
