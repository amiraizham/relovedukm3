<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\ReviewController;


Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});



Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::post('/admin/products/{id}/approve', [AdminController::class, 'approveProduct'])->name('admin.products.approve');
    Route::post('/admin/products/{id}/reject', [AdminController::class, 'rejectProduct'])->name('admin.products.reject');
    Route::get('/admin/products/{id}/preview', [AdminController::class, 'preview'])->name('admin.products.preview');
});


Route::get('/dashboard', [ProductController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/profile/show/{id}', [ProfileController::class, 'show'])->name('profile.show');



    Route::get('/products/sellform', [ProductController::class, 'showSellForm'])->name('products.sellform');
    Route::post('/products/store', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show');
    Route::get('/products/{id}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{id}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{id}', [ProductController::class, 'delete'])->name('products.delete');

    Route::post('/favorites/{product}', [FavoriteController::class, 'store'])->name('favorites.store');
    Route::delete('/favorites/{product}', [FavoriteController::class, 'destroy'])->name('favorites.destroy');
    Route::get('/favourites', [FavoriteController::class, 'index'])->name('favorites.index');

    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{selleruser_id}', [ChatController::class, 'start'])->name('chat.seller');
    Route::post('/chat/send', [ChatController::class, 'sendMessage'])->name('chat.send');
    Route::delete('/chat/{id}/delete', [ChatController::class, 'destroy'])->name('chat.delete');
    Route::get('/chat/conversation/{id}', [ChatController::class, 'showConversation'])->name('chat.conversation');


    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/{status}', [NotificationController::class, 'updateStatus'])->name('notifications.updateStatus');

    Route::get('/seller/bookings', [BookingController::class, 'sellerBookings'])->name('bookings.seller');
    Route::post('/bookings/{product}', [BookingController::class, 'store'])->name('bookings.store');
    Route::post('/bookings/{id}/approve', [BookingController::class, 'approve'])->name('bookings.approve');
    Route::post('/bookings/{id}/reject', [BookingController::class, 'reject'])->name('bookings.reject');
    Route::post('/bookings/{id}/sold', [BookingController::class, 'markSold'])->name('bookings.sold');

    Route::get('/review/create/{product}', [ReviewController::class, 'create'])->name('review.create');
    Route::post('/review/store/{product}', [ReviewController::class, 'store'])->name('review.store');
    Route::get('/review/view/{product}', [ReviewController::class, 'view'])->name('review.view');
});

Route::post('/logout', function (Request $request) {
    Auth::logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/');
})->name('logout');



Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['signed'])  // no 'auth' here
    ->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');

require __DIR__ . '/auth.php';
