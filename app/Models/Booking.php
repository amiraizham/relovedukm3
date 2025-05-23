<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $primaryKey = 'booking_id'; // if your primary key is booking_id

    protected $fillable = [
        'product_id',
        'buyeruser_id',
        'selleruser_id',
        'status',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyeruser_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'selleruser_id');
    }
}
