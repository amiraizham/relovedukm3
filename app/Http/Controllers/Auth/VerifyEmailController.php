<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL; // Add this line

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        // Explicitly check for the signature (additional layer of security)
        if (! $request->hasValidSignature()) {
            abort(403, 'Invalid or expired verification link.');
        }

        // Re-authenticate the user if they were logged out during the redirect.
        if (! Auth::check() || Auth::id() !== $request->user()->id) {
            Auth::login($request->user());
        }

        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard') . '?verified=1');
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return redirect()->intended(route('dashboard') . '?verified=1');
    }
}
