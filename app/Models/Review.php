<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $primaryKey = 'review_id';

    protected $fillable = [
        'product_id',
        'buyeruser_id',
        'selleruser_id',
        'rating',
        'feedback',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyeruser_id', 'id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'selleruser_id');
    }
}
