<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Booking;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use App\Models\Review;

class NotificationController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $buyerNotifications = Booking::with(['product', 'seller'])
            ->where('buyeruser_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) use ($userId) {
                // ✅ Define $hasReview inside the map function
                $hasReview = Review::where('product_id', $booking->product_id)
                    ->where('buyeruser_id', $userId)
                    ->exists();

                return [
                    'id' => $booking->booking_id,
                    'status' => $booking->status,
                    'product' => [
                        'product_id' => $booking->product->product_id,
                        'product_name' => $booking->product->product_name,
                        'product_price' => $booking->product->product_price,
                    ],
                    'seller' => $booking->seller ? [
                        'name' => $booking->seller->name,
                        'id' => $booking->seller->id,
                    ] : null,

                    // ✅ Include the result in your returned array
                    'has_review' => $hasReview,
                ];
            });

        $sellerNotifications = Booking::with(['product', 'buyer'])
            ->where('selleruser_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                $review = Review::where('product_id', $booking->product_id)
                    ->where('buyeruser_id', $booking->buyeruser_id)
                    ->first();

                return [
                    'id' => $booking->booking_id,
                    'status' => $booking->status,
                    'product' => [
                        'product_id' => $booking->product->product_id,
                        'product_name' => $booking->product->product_name,
                        'product_price' => $booking->product->product_price,
                    ],
                    'buyer' => $booking->buyer ? [
                        'name' => $booking->buyer->name,
                        'id' => $booking->buyer->id,
                    ] : null,
                    'has_review' => !!$review,
                    //'review_product_id' => $review?->product_id,
                ];
            });


        // Rejected products
        $rejectedProducts = Product::where('is_approved', 0)
            ->where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->product_id, // map product_id to id
                    'title' => $product->product_name,
                    'price' => $product->product_price,
                ];
            });

        return Inertia::render('Notifications', [
            'buyerNotifications' => $buyerNotifications,
            'sellerNotifications' => $sellerNotifications,
            'rejectedProducts' => $rejectedProducts,
            'csrf_token' => csrf_token(),
            'authUserId' => Auth::id() // ✅ Add this

        ]);
    }

    public function updateStatus(Request $request, $id, $status)
    {
        $allowedStatuses = ['pending', 'approved', 'rejected', 'sold'];

        if (!in_array($status, $allowedStatuses)) {
            return back()->with('error', 'Invalid status.');
        }

        $booking = Booking::findOrFail($id);

        if ($booking->selleruser_id !== Auth::id()) {
            return back()->with('error', 'You are not the seller of this product.');
        }

        $booking->status = $status;
        $booking->save();

        return redirect()->route('notifications.index')->with('success', 'Booking status updated.');
    }
}
