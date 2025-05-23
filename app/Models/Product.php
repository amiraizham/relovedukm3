<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Review;


class Product extends Model
{
    use HasFactory;
    protected $table = 'products';

    protected $primaryKey = 'product_id';

    protected $fillable = [
        'user_id',
        'product_name',
        'product_price',
        'product_desc',
        'product_category',
        'product_img',
        'is_approved',
        'product_status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'product_id', 'product_id');
    }
    public function reviews()
    {
        return $this->hasMany(Review::class, 'product_id', 'product_id');
    }
}
