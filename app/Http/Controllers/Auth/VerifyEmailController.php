<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class VerifyEmailController extends Controller
{
    public function __invoke($id, $hash): RedirectResponse
    {
        // Find user by id
        $user = User::findOrFail($id);

        // Verify the signature matches
        if (! URL::hasValidSignature(request())) {
            abort(403);
        }

        if ($user->hasVerifiedEmail()) {
            // Already verified, log in and redirect to dashboard
            Auth::login($user);
            return redirect()->route('dashboard')->with('verified', 'Email already verified. Welcome back!');
        }

        // Mark email as verified
        $user->markEmailAsVerified();
        event(new Verified($user));

        // Log in the user automatically
        Auth::login($user);

        // Redirect to dashboard with success message
        return redirect()->route('dashboard')->with('verified', 'Your email has been verified! You are now logged in.');
    }
}
