<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id('product_id'); // Primary key
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // FK to users table
            $table->string('product_name');
            $table->decimal('product_price', 10, 2);
            $table->text('product_desc')->nullable();
            $table->string('product_category');
            $table->boolean('is_approved')->default(false);
            $table->enum('product_status', ['available', 'reserved', 'sold'])->default('available');
            $table->timestamps(); // created_at and updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
