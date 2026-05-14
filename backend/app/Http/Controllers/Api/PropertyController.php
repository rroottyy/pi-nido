<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use App\Models\Message;

class PropertyController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $query = Property::with(['user', 'mainImage'])
            ->where('status', 'active');

        if ($request->type)      $query->where('type', $request->type);
        if ($request->operation) $query->where('operation', $request->operation);
        if ($request->city)      $query->where('city', 'like', "%{$request->city}%");
        if ($request->min_price) $query->where('price', '>=', $request->min_price);
        if ($request->max_price) $query->where('price', '<=', $request->max_price);
        // Habitaciones — multielección con exacto o 5+
        if ($request->has('bedrooms') && !empty($request->bedrooms)) {
            $bedrooms = (array) $request->bedrooms;
            $hasPlus  = in_array('5+', $bedrooms);
            $exact    = array_filter($bedrooms, fn($b) => $b !== '5+');

            $query->where(function($q) use ($exact, $hasPlus) {
                if (!empty($exact)) {
                    $q->whereIn('bedrooms', $exact);
                }
                if ($hasPlus) {
                    $q->orWhere('bedrooms', '>=', 5);
                }
            });
        }

        // Baños — multielección con exacto o 3+
        if ($request->has('bathrooms') && !empty($request->bathrooms)) {
            $bathrooms = (array) $request->bathrooms;
            $hasPlus   = in_array('3+', $bathrooms);
            $exact     = array_filter($bathrooms, fn($b) => $b !== '3+');

            $query->where(function($q) use ($exact, $hasPlus) {
                if (!empty($exact)) {
                    $q->whereIn('bathrooms', $exact);
                }
                if ($hasPlus) {
                    $q->orWhere('bathrooms', '>=', 3);
                }
            });
        }
        if ($request->min_area)  $query->where('area', '>=', $request->min_area);

        $properties = $request->min_area
            ? $query->orderBy('area', 'asc')->paginate(12)
            : $query->latest()->paginate(12);

        return PropertyResource::collection($properties);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'              => 'required|string|max:60',
            'description'        => 'required|string|max:2000',
            'type'               => 'required|in:apartment,house,land,commercial,garage',
            'operation'          => 'required|in:sale,rent',
            'price'              => 'required|numeric|min:0',
            'address'            => 'required|string|max:60',
            'city'               => 'required|string|max:30',
            'province'           => 'required|string|max:30',
            'postal_code'        => 'required|string|max:10',
            'latitude'           => 'nullable|numeric',
            'longitude'          => 'nullable|numeric',
            'bedrooms'           => 'nullable|integer|min:0',
            'bathrooms'          => 'nullable|integer|min:0',
            'area'               => 'required|numeric|min:0',
            'has_garage'         => 'boolean',
            'has_elevator'       => 'boolean',
            'has_pool'           => 'boolean',
            'has_garden'         => 'boolean',
            'is_furnished'       => 'boolean',
            'construction_year'  => 'nullable|integer|min:1000|max:' . date('Y'),
            'energy_certificate' => 'nullable|in:A,B,C,D,E,F,G',
        ]);

        $data['bedrooms']  = $data['bedrooms'] ?? 0;
        $data['bathrooms'] = $data['bathrooms'] ?? 0;
        $data['status']    = 'draft';

        if ($data['type'] === 'garage') {
            $data['bedrooms']     = 0;
            $data['bathrooms']    = 0;
            $data['has_elevator'] = false;
            $data['has_pool']     = false;
            $data['has_garden']   = false;
            $data['is_furnished'] = false;
        }

        $property = $request->user()->properties()->create($data);

        return new PropertyResource($property->load('user'));
    }

    public function show(Property $property)
    {
        return new PropertyResource(
            $property->load(['user', 'images'])
        );
    }

    public function update(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $data = $request->validate([
            'title'        => 'required|string|max:100',
            'description'  => 'required|string|max:2000',
            'type'         => 'in:apartment,house,land,commercial,garage',
            'operation'    => 'in:sale,rent',
            'price'        => 'numeric|min:0',
            'address'      => 'required|string|max:60',
            'city'         => 'required|string|max:30',
            'province'     => 'required|string|max:30',
            'postal_code'  => 'required|string|max:10',
            'latitude'     => 'nullable|numeric',
            'longitude'    => 'nullable|numeric',
            'bedrooms'     => 'nullable|integer|min:0',
            'bathrooms'    => 'nullable|integer|min:0',
            'area'         => 'numeric|min:0',
            'has_garage'   => 'boolean',
            'has_elevator' => 'boolean',
            'has_pool'     => 'boolean',
            'has_garden'   => 'boolean',
            'is_furnished' => 'boolean',
            'construction_year'  => 'nullable|integer|min:1000|max:' . date('Y'),
            'energy_certificate' => 'nullable|in:A,B,C,D,E,F,G',
        ]);

        if (isset($data['type']) && $data['type'] === 'garage') {
            $data['bedrooms']     = 0;
            $data['bathrooms']    = 0;
            $data['has_elevator'] = false;
            $data['has_pool']     = false;
            $data['has_garden']   = false;
            $data['is_furnished'] = false;
        }

        // Si el propietario edita un anuncio ya enviado, vuelve a pending
        if ($request->user()->id === $property->user_id && $property->status !== 'draft') {
            $data['status']           = 'pending';
            $data['rejection_reason'] = null;
            $data['reviewed_at']      = null;

            Message::create([
                'sender_id'   => $request->user()->id,
                'receiver_id' => $request->user()->id,
                'property_id' => $property->id,
                'body'        => "⏳ Tu anuncio \"{$property->title}\" ha sido modificado y está pendiente de revisión de nuevo. No será visible hasta que un administrador lo apruebe.",
                'is_read'     => false,
            ]);
        }

        $property->update($data);

        return new PropertyResource($property->load(['user', 'images']));
    }

    public function destroy(Property $property)
    {
        $this->authorize('delete', $property);
        $property->delete();

        return response()->json(['message' => 'Inmueble eliminado correctamente.']);
    }

    public function myProperties(Request $request)
    {
        $properties = $request->user()
            ->properties()
            ->with(['mainImage'])
            ->latest()
            ->get();

        return PropertyResource::collection($properties);
    }

    public function updateDetails(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $data = $request->validate([
            'has_garage'         => 'boolean',
            'has_elevator'       => 'boolean',
            'has_pool'           => 'boolean',
            'has_garden'         => 'boolean',
            'is_furnished'       => 'boolean',
            'construction_year'  => 'nullable|integer|min:1000|max:' . date('Y'),
            'energy_certificate' => 'nullable|in:A,B,C,D,E,F,G',
        ]);

        $property->update($data);

        // Cambiar a pending y notificar solo si venía de draft
        if ($property->status === 'draft') {
            $property->update(['status' => 'pending']);

            if (!$request->user()->isAdmin()) {
                Message::create([
                    'sender_id'   => $request->user()->id,
                    'receiver_id' => $request->user()->id,
                    'property_id' => $property->id,
                    'body'        => "⏳ Tu anuncio \"{$property->title}\" ha sido enviado y está pendiente de revisión por un administrador. Te notificaremos cuando sea revisado.",
                    'is_read'     => false,
                ]);
            }
        }

        return new PropertyResource($property->load(['user', 'images']));
    }

    public function updateStatus(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $request->validate([
            'status' => 'required|in:paused,sold,rented,pending',
        ]);

        $property->update(['status' => $request->status]);

        return new PropertyResource($property->load(['user', 'images']));
    }
}