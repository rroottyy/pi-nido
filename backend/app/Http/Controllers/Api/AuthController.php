<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone'    => 'nullable|string|max:20',
            'role'     => 'in:buyer,seller',
        ]);

        $user  = User::create($data);
        $token = $user->createToken('nido_token')->plainTextToken;

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        $token = $user->createToken('nido_token')->plainTextToken;

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    public function updateProfile(Request $request)
{
    $data = $request->validate([
        'name'  => 'required|string|max:255',
        'phone' => 'nullable|string|max:20',
    ]);

    $request->user()->update($data);

    return new UserResource($request->user());
}

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($request->current_password, $request->user()->password)) {
            return response()->json([
                'errors' => ['current_password' => ['La contraseña actual no es correcta.']]
            ], 422);
        }

        $request->user()->update([
            'password' => $request->password,
        ]);

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }
}