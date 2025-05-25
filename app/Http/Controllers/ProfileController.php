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
use Illuminate\Support\Facades\Log;









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


        if ($request->has('name')) {
            $user->name = $request->input('name');
        }

        if ($request->has('email')) {
            $user->email = $request->input('email');
        }

        if ($request->has('bio')) {
            $user->bio = $request->input('bio');
        }
        Log::info('User bio now set to:', [$user->bio]);

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
            'reviews.buyer',
            'reviews.product'
        ])->findOrFail($id);

        // ✅ Only fetch this user's approved products and paginate them
        $products = $user->products()
            ->where('is_approved', '!=', 0)
            ->orderBy('created_at', 'desc')
            ->paginate(4)
            ->through(fn($p) => [
                'id' => $p->product_id,
                'title' => $p->product_name,
                'price' => $p->product_price,
                'image' => $p->product_img,
                'status' => $p->product_status,
            ]);

        return Inertia::render('Profile/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'matricnum' => $this->extractMatricNumberFromEmail($user->email),
                'phone' => $user->phone,
                'bio' => $user->bio,
                'avatar' => $user->avatar,
                'average_rating' => round($user->reviews->avg('rating'), 1),
                'total_reviews' => $user->reviews->count(),

                'reviews' => $user->reviews->map(fn($r) => [
                    'id' => $r->review_id,
                    'rating' => $r->rating,
                    'feedback' => $r->feedback,
                    'created_at' => $r->created_at->toDateTimeString(),
                    'reviewer' => [
                        'name' => $r->buyer->name ?? 'Unknown',
                    ],
                    'product' => $r->product ? [
                        'name' => $r->product->product_name,
                        'price' => $r->product->product_price,
                        'image' => $r->product->product_img,
                        'id' => $r->product->product_id,
                    ] : null,
                ]),
            ],
            'products' => $products, // ✅ paginated result sent separately
        ]);
    }

    private function extractMatricNumberFromEmail($email)
    {
        if (preg_match('/^([a-zA-Z]\d{6})@siswa\.ukm\.edu\.my$/', $email, $matches)) {
            return strtoupper($matches[1]);
        }
        return 'N/A';
    }
}
