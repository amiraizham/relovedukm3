<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = ['selleruser_id', 'buyeruser_id'];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'selleruser_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyeruser_id');
    }

    protected static function booted()
    {
        static::deleting(function ($conversation) {
            $conversation->messages()->delete();
        });
    }
}
