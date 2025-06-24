<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;
use App\Models\Product;
use App\Mail\BookingRequestMail;
use App\Mail\BookingStatusMail;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function store($productId, Request $request)
    {
        set_time_limit(60);
        $user = Auth::user();
        $product = Product::findOrFail($productId);

        Booking::where('status', 'pending')
            ->where('created_at', '<', Carbon::now()->subSeconds(7200)->toDateTimeString())
            ->delete();

        if ($product->user_id === $user->id) {
            return back()->with('error', 'You cannot book your own product.');
        }

        if ($product->product_status === 'sold') {
            return back()->with('error', 'This product is already sold.');
        }

        $userAlreadyBooked = Booking::where('product_id', $productId)
            ->where('buyeruser_id', $user->id)
            ->whereNotIn('status', ['rejected'])
            ->exists();

        if ($userAlreadyBooked) {
            return back()->with('error', 'You have already booked this item.');
        }

        $activeBooking = Booking::where('product_id', $productId)
            ->whereNotIn('status', ['rejected', 'sold'])
            ->latest()
            ->first();

        if ($activeBooking && Carbon::parse($activeBooking->created_at)->diffInMinutes(now()) < 1) {
            return back()->with('error', 'This product is temporarily booked. Try again later.');
        }

        $booking = Booking::create([
            'product_id' => $product->product_id,
            'buyeruser_id' => $user->id,
            'selleruser_id' => $product->user_id,
            'status' => 'pending',
        ]);

        // ✉️ Notify the seller
        Mail::to($booking->product->user->email)->send(new BookingRequestMail($booking));

        return back()->with('success', 'You have booked this item. Your booking is valid for 2 hours.');
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

        $booking->load(['product', 'buyer']);

        Mail::to($booking->buyer->email)->send(new BookingStatusMail($booking));

        return back()->with('success', 'Booking approved.');
    }

    // ❌ Reject booking
    public function reject($id)
    {
        $booking = Booking::findOrFail($id);
        $this->authorizeSeller($booking);

        $booking->status = 'rejected';
        $booking->save();

        $booking->load(['product', 'buyer']);

        Mail::to($booking->buyer->email)->send(new BookingStatusMail($booking));

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
