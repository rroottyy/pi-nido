<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
{
    User::firstOrCreate(
        ['email' => 'admin@nido.com'],
        ['name' => 'Admin', 'password' => Hash::make('admin1234'), 'role' => 'admin']
    );

    User::firstOrCreate(
        ['email' => 'ana@nido.com'],
        ['name' => 'Ana García', 'password' => Hash::make('password123'), 'role' => 'seller']
    );

    User::firstOrCreate(
        ['email' => 'juan@nido.com'],
        ['name' => 'Juan López', 'password' => Hash::make('password123'), 'role' => 'buyer']
    );
}
}