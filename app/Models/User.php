<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\CustomVerifyEmail; // Import the custom notification

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'bio',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Override the method to send the custom verification email.
     */
    public function sendEmailVerificationNotification()
    {
        // Send the custom verification email notification
        $this->notify(new CustomVerifyEmail());
    }

    // Relationships
    public function favorites()
    {
        return $this->belongsToMany(Product::class, 'favorites', 'user_id', 'product_id')->withTimestamps();
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'user_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'buyeruser_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'selleruser_id');
    }
}
