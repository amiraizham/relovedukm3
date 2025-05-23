<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function show($id)
    {
        $user = User::with([
            'products',
            'reviews.buyer' // This ensures you can access review.reviewer.name
        ])->findOrFail($id);

        return Inertia::render('Profile/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'matricnum' => $user->matricnum,
                'phone' => $user->phone,
                'bio' => $user->bio,
                'avatar' => $user->avatar,
                'average_rating' => round($user->reviews->avg('rating'), 1),
                'total_reviews' => $user->reviews->count(),
                'products' => $user->products->map(fn($p) => [
                    'id' => $p->product_id,
                    'title' => $p->product_name,
                    'price' => $p->product_price,
                    'image' => $p->product_img,
                ]),
                'reviews' => $user->reviews->map(
                    fn($r) => [
                        'id' => $r->review_id,
                        'rating' => $r->rating,
                        'feedback' => $r->feedback,
                        'created_at' => $r->created_at->toDateTimeString(),
                        'reviewer' => [
                            'name' => $r->buyer->name ?? 'Unknown',
                        ]
                    ]
                ),
            ],
        ]);
    }
}
