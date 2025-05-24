<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
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

    public function update(Request $request)
    {
        $user = User::findOrFail(Auth::id());

        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Update only if filled
        if ($request->filled('name')) {
            $user->name = $request->input('name');
        }

        if ($request->filled('email')) {
            $user->email = $request->input('email');
        }

        if ($request->filled('bio')) {
            $user->bio = $request->input('bio');
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar && str_contains($user->avatar, '.amazonaws.com')) {
                $oldAvatarPath = parse_url($user->avatar, PHP_URL_PATH);
                $oldAvatarKey = ltrim($oldAvatarPath, '/');
                Storage::disk('s3')->delete($oldAvatarKey);
            }

            $file = $request->file('avatar');
            $fileKey = 'avatars/' . time() . '-' . $file->getClientOriginalName();
            Storage::disk('s3')->put($fileKey, file_get_contents($file));

            $user->avatar = 'https://'
                . config('filesystems.disks.s3.bucket')
                . '.s3.'
                . config('filesystems.disks.s3.region')
                . '.amazonaws.com/'
                . $fileKey;
        }

        $user->save();

        return redirect()->route('profile.show', ['id' => $user->id])->with('success', 'Profile updated!');
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
