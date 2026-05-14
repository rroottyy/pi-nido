<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
            $table->text('rejection_reason')->nullable()->after('status');
            $table->timestamp('reviewed_at')->nullable()->after('rejection_reason');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['rejection_reason', 'reviewed_at']);
        });
    }
};