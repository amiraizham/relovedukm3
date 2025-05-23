<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;
use App\Models\Product;
use Inertia\Inertia;

class BookingController extends Controller
{
    // 🟩 Store new booking
    public function store($productId, Request $request)
    {
        $user = Auth::user();
        $product = Product::findOrFail($productId);

        if ($product->user_id === $user->id) {
            return back()->with('error', 'You cannot book your own product.');
        }

        if ($product->product_status === 'sold') {
            return back()->with('error', 'This product is already sold.');
        }

        Booking::create([
            'product_id' => $product->product_id,
            'buyeruser_id' => $user->id,
            'selleruser_id' => $product->user_id,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Booking request sent to the seller.');
    }

    // 🟨 View bookings for the seller
    public function sellerBookings()
    {
        $sellerId = Auth::id();

        $bookings = Booking::with(['product', 'buyer'])
            ->where('selleruser_id', $sellerId)
            ->get();

        return Inertia::render('Bookings/SellerBookings', [
            'bookings' => $bookings,
        ]);
    }

    // ✅ Approve booking
    public function approve($id)
    {
        $booking = Booking::findOrFail($id);
        $this->authorizeSeller($booking);

        $booking->status = 'approved';
        $booking->save();

        return back()->with('success', 'Booking approved.');
    }

    // ❌ Reject booking
    public function reject($id)
    {
        $booking = Booking::findOrFail($id);
        $this->authorizeSeller($booking);

        $booking->status = 'rejected';
        $booking->save();

        return back()->with('info', 'Booking rejected.');
    }

    // ✅ Mark product as sold by seller
    public function markSold($bookingId)
    {
        $booking = Booking::with('product')->findOrFail($bookingId);
        $this->authorizeSeller($booking);

        $booking->status = 'sold';
        $booking->save();

        $booking->product->product_status = 'sold';
        $booking->product->save();

        return back()->with('success', 'Booking and product marked as sold.');
    }

    // 🔐 Ensure the user is the seller
    private function authorizeSeller(Booking $booking)
    {
        if ($booking->selleruser_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
    }
}
