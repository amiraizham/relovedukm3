<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->bigIncrements('booking_id'); // Primary key

            // Foreign keys
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('selleruser_id');
            $table->unsignedBigInteger('buyeruser_id');

            $table->string('status')->default('pending');
            $table->timestamps();

            // Constraints
            $table->foreign('product_id')
                ->references('product_id')
                ->on('products')
                ->onDelete('cascade');

            $table->foreign('selleruser_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('buyeruser_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
