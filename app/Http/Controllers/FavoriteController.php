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
            ->whereHas('product') // ensures only valid products are paginated
            ->paginate(8)
            ->through(function ($fav) {
                $product = $fav->product;

                return [
                    'id' => $product->product_id,
                    'title' => $product->product_name,
                    'image' => $product->product_img,
                    'price' => $product->product_price,
                    'category' => $product->product_category,
                    'created_at' => $product->created_at,
                    'user_id' => $product->user_id,
                ];
            });

        return Inertia::render('Favourites', [
            'favorites' => $favorites,
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
