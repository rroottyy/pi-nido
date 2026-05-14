<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('properties', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('title');
        $table->text('description');
        $table->enum('type', ['apartment', 'house', 'land', 'commercial', 'garage']);
        $table->enum('operation', ['sale', 'rent']);
        $table->decimal('price', 12, 2);
        $table->string('address');
        $table->string('city');
        $table->string('province');
        $table->string('postal_code', 10);
        $table->decimal('latitude', 10, 7)->nullable();
        $table->decimal('longitude', 10, 7)->nullable();
        $table->integer('bedrooms')->default(0);
        $table->integer('bathrooms')->default(0);
        $table->decimal('area', 8, 2);
        $table->boolean('has_garage')->default(false);
        $table->boolean('has_elevator')->default(false);
        $table->boolean('has_pool')->default(false);
        $table->boolean('has_garden')->default(false);
        $table->boolean('is_furnished')->default(false);
        $table->enum('status', ['active', 'sold', 'rented', 'paused'])->default('active');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
