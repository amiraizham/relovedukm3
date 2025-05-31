<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Booking;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use App\Models\Review;
use App\Mail\BookingStatusMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon; // ⬅ make sure this is imported



class NotificationController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        $now = Carbon::now();

        if (!$userId) {
            return redirect()->route('login')->with('error', 'Please log in to access your notifications.');
        }

        $buyerNotifications = Booking::with(['product', 'seller'])
            ->where('buyeruser_id', $userId)
            ->where(function ($query) use ($now) {
                $query->where('status', '!=', 'pending') // show non-pending bookings
                    ->orWhere(function ($q) use ($now) {
                        $q->where('status', 'pending')
                            ->where('created_at', '>=', $now->copy()->subMinute()); // only pending within 2 hours
                    });
            })
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
            ->where(function ($query) use ($now) {
                $query->where('status', '!=', 'pending') // keep sold/approved
                    ->orWhere(function ($q) use ($now) {
                        $q->where('status', 'pending')
                            ->where('created_at', '>=', $now->copy()->subMinute()); // only pending within 2 hours
                    });
            })
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

        $recentCutoff = now()->subMinutes(2);

        // Rejected products
        $rejectedProducts = Product::where('is_approved', 0)
            ->where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($product) {
                return [
                    'product_id' => $product->product_id,
                    'product_name' => $product->product_name,
                    'product_price' => $product->product_price,
                    'rejection_reason' => $product->rejection_reason,
                    'updated_at' => $product->updated_at, // ✅ ADD THIS LINE
                ];
            });

        $hasNewRejected = Product::where('user_id', $userId)
            ->where('is_approved', 0)
            ->where('updated_at', '>=', $recentCutoff)
            ->exists();

        $hasNewRequests = Booking::where('selleruser_id', $userId)
            ->where('status', 'pending')
            ->where('created_at', '>=', now()->subMinute())
            ->exists();

        $hasBookingUpdates = Booking::where('buyeruser_id', $userId)
            ->whereIn('status', ['approved', 'rejected'])
            ->where('updated_at', '>=', now()->subMinute())
            ->exists();


        return Inertia::render('Notifications', [
            'buyerNotifications' => $buyerNotifications,
            'sellerNotifications' => $sellerNotifications,
            'rejectedProducts' => $rejectedProducts,
            'csrf_token' => csrf_token(),
            'authUserId' => Auth::id(), // ✅ Add this
            'hasNewRequests' => $hasNewRequests,         // 🔴 for seller tab
            'hasBookingUpdates' => $hasBookingUpdates,
            'hasNewRejected' => $hasNewRejected,

        ]);
    }

    public function updateStatus(Request $request, $id, $status)
    {
        $allowedStatuses = ['pending', 'approved', 'rejected', 'sold'];

        if (!in_array($status, $allowedStatuses)) {
            return back()->with('error', 'Invalid status.');
        }

        $booking = Booking::with(['buyer', 'product'])->findOrFail($id);

        if ($booking->selleruser_id !== Auth::id()) {
            return back()->with('error', 'You are not the seller of this product.');
        }

        $booking->status = $status;
        $booking->save();

        // ✅ Send email to buyer if status is approved or rejected
        if (in_array($status, ['approved', 'rejected'])) {
            Mail::to($booking->buyer->email)->send(new BookingStatusMail($booking));
        }

        return redirect()->route('notifications.index')->with('success', 'Booking status updated.');
    }
}
