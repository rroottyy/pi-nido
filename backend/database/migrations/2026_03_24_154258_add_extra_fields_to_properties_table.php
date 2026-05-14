<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->integer('construction_year')->nullable()->after('is_furnished');
            $table->string('energy_certificate')->nullable()->after('construction_year'); // A, B, C, D, E, F, G
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['construction_year', 'energy_certificate']);
        });
    }
};