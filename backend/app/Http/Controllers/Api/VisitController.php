<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VisitResource;
use App\Models\Visit;
use App\Models\Property;
use Illuminate\Http\Request;

class VisitController extends Controller
{
    public function index(Request $request)
    {
        $visits = Visit::with(['property.mainImage', 'user'])
            ->where('user_id', $request->user()->id)
            ->latest('scheduled_at')
            ->get();

        return VisitResource::collection($visits);
    }

    public function store(Request $request, Property $property)
    {
        $data = $request->validate([
            'scheduled_at' => 'required|date|after:now',
            'notes'        => 'nullable|string|max:500',
        ]);

        $visit = Visit::create([
            'property_id'  => $property->id,
            'user_id'      => $request->user()->id,
            'scheduled_at' => $data['scheduled_at'],
            'notes'        => $data['notes'] ?? null,
        ]);

        return new VisitResource($visit->load(['property', 'user']));
    }

    public function update(Request $request, Visit $visit)
    {
        $data = $request->validate([
            'status' => 'required|in:confirmed,cancelled',
        ]);

        $visit->update($data);

        return new VisitResource($visit->load(['property', 'user']));
    }
}