<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function create($productId)
    {
        $user = Auth::user();

        $canReview = Booking::where('product_id', $productId)
            ->where('buyeruser_id', $user->id)
            ->where('status', 'sold')
            ->exists();

        if (!$canReview) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('Review/Create', [
            'productId' => $productId,
            'user' => $user,
        ]);
    }

    public function store(Request $request, $productId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'required|string',
        ]);

        $product = Product::findOrFail($productId);

        Review::create([
            'product_id' => $productId,
            'buyeruser_id' => Auth::id(),
            'selleruser_id' => $product->user_id,
            'rating' => $request->rating,
            'feedback' => $request->feedback,
        ]);

        return redirect()->route('notifications.index')->with('success', 'Review submitted!');
    }

    public function view($productId)
    {
        $product = Product::findOrFail($productId);
        $review = Review::with('buyer')->where('product_id', $product->product_id)->firstOrFail();

        $user = Auth::user();

        // Make sure the current user is either the buyer or seller
        $isBuyer = $user->id === $review->buyeruser_id;
        $isSeller = $user->id === $review->selleruser_id;

        if (!$isBuyer && !$isSeller) {
            abort(403, 'Unauthorized access to review.');
        }

        return Inertia::render('Review/View', [
            'product' => [
                'id' => $product->product_id,
                'product_name' => $product->product_name,
                'product_price' => $product->product_price,
                'product_description' => $product->product_desc,
                'image_url' => $product->product_img,
                'category' => $product->product_category,
            ],
            'review' => [
                'buyer_name' => $review->buyer->name,
                'rating' => $review->rating,
                'feedback' => $review->feedback,
                'created_at' => $review->created_at,
            ],
        ]);
    }
}
