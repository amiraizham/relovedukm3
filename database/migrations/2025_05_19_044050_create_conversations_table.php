<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('selleruser_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('buyeruser_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['selleruser_id', 'buyeruser_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
