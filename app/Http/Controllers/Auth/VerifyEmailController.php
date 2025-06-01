<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\URL;
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
            // Already verified, redirect to login or dashboard
            return redirect()->route('login')->with('verified', 'Email already verified, please log in.');
        }

        // Mark email as verified
        $user->markEmailAsVerified();
        event(new Verified($user));

        // Redirect to login page with success message
        return redirect()->route('login')->with('verified', 'Your email has been verified! You may now log in.');
    }
}
