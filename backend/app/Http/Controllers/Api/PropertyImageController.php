<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyImageResource;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PropertyImageController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $currentCount = $property->images()->count();
        $newCount     = count($request->file('images') ?? []);

        if ($currentCount + $newCount > 20) {
            return response()->json([
                'message' => "No puedes subir más de 20 fotos por anuncio. Ya tienes {$currentCount} foto(s)."
            ], 422);
        }

        $request->validate([
            'images'   => 'required|array|max:20',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $uploaded = [];

        foreach ($request->file('images') as $file) {
            $path = $file->storeAs(
                'properties',
                uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension(),
                'public'
            );

            if (!$path) {
                return response()->json(['message' => 'Error al guardar la imagen.'], 500);
            }

            $isMain = $currentCount === 0 && count($uploaded) === 0;

            $image = $property->images()->create([
                'path'    => $path,
                'is_main' => $isMain,
                'order'   => $currentCount + count($uploaded),
            ]);

            $uploaded[] = $image;
        }

        return PropertyImageResource::collection(collect($uploaded));
    }

    public function setMain(Request $request, Property $property, PropertyImage $image)
    {
        $this->authorize('update', $property);

        $property->images()->update(['is_main' => false]);
        $image->update(['is_main' => true]);

        return new PropertyImageResource($image);
    }

    public function destroy(Property $property, PropertyImage $image)
    {
        $this->authorize('update', $property);

        Storage::disk('public')->delete($image->path);
        $image->delete();

        if ($image->is_main) {
            $next = $property->images()->first();
            $next?->update(['is_main' => true]);
        }

        return response()->json(['message' => 'Imagen eliminada.']);
    }
}