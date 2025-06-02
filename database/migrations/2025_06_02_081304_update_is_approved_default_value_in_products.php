<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateIsApprovedDefaultValueInProducts extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Ensure the 'is_approved' column is nullable and has a default of null
            $table->boolean('is_approved')->nullable()->default(null)->change();
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            // Revert the column change if needed
            $table->boolean('is_approved')->default(0)->change();
        });
    }
}
