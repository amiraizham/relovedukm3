<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;
use App\Models\Product;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Inertia::share([
            'auth' => fn() => [
                'user' => Auth::user(),
            ],

            // ✅ Add unread chat notification status
            'unreadChats' => fn() => Auth::check()
                ? \App\Models\Message::where('receiver_id', Auth::id())
                ->where('is_read', false)
                ->exists()
                : false,

            'hasNewRequests' => fn() => Auth::check()
                ? Booking::where('selleruser_id', Auth::id())
                ->where('status', 'pending')
                ->where('created_at', '>=', now()->subMinutes(2)) // ⏱️ Adjust time as needed
                ->exists()
                : false,

            'hasBookingUpdates' => fn() => Auth::check()
                ? Booking::where('buyeruser_id', Auth::id())
                ->whereIn('status', ['approved', 'rejected'])
                ->where('updated_at', '>=', now()->subMinutes(2))
                ->exists()
                : false,

            'hasRejectedProducts' => fn() => Auth::check()
                ? Product::where('user_id', Auth::id())
                ->where('is_approved', 0)
                ->where('updated_at', '>=', now()->subMinutes(1)) // ⏱️ Only show for last 2 mins
                ->exists()
                : false,

        ]);
    }
}
