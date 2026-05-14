<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Admin',
            'email'    => 'admin@nido.com',
            'password' => Hash::make('admin1234'),
            'role'     => 'admin',
        ]);

        User::create([
            'name'     => 'Ana García',
            'email'    => 'ana@nido.com',
            'password' => Hash::make('password123'),
            'role'     => 'seller',
        ]);

        User::create([
            'name'     => 'Juan López',
            'email'    => 'juan@nido.com',
            'password' => Hash::make('password123'),
            'role'     => 'buyer',
        ]);
    }
}