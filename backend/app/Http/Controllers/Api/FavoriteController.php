<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Favorite;
use App\Models\Property;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = $request->user()
            ->favorites()
            ->with(['property.mainImage'])
            ->latest()
            ->get()
            ->pluck('property');

        return PropertyResource::collection($favorites);
    }

    public function store(Request $request, Property $property)
    {
        Favorite::firstOrCreate([
            'user_id'     => $request->user()->id,
            'property_id' => $property->id,
        ]);

        return response()->json(['message' => 'Añadido a favoritos.']);
    }

    public function destroy(Request $request, Property $property)
    {
        Favorite::where('user_id', $request->user()->id)
            ->where('property_id', $property->id)
            ->delete();

        return response()->json(['message' => 'Eliminado de favoritos.']);
    }
    public function check(Request $request, Property $property)
    {
        $isFavorite = $request->user()
            ->favorites()
            ->where('property_id', $property->id)
            ->exists();

        return response()->json(['is_favorite' => $isFavorite]);
    }
}