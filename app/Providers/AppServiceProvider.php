<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

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
        ]);
    }
}
