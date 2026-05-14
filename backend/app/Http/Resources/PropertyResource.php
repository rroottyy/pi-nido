<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'description'   => $this->description,
            'type'          => $this->type,
            'operation'     => $this->operation,
            'price'         => $this->price,
            'formatted_price' => $this->formattedPrice(),
            'address'       => $this->address,
            'city'          => $this->city,
            'province'      => $this->province,
            'postal_code'   => $this->postal_code,
            'latitude'      => $this->latitude,
            'longitude'     => $this->longitude,
            'bedrooms'      => $this->bedrooms,
            'bathrooms'     => $this->bathrooms,
            'area'          => $this->area,
            'has_garage'    => $this->has_garage,
            'has_elevator'  => $this->has_elevator,
            'has_pool'      => $this->has_pool,
            'has_garden'    => $this->has_garden,
            'is_furnished'  => $this->is_furnished,
            'status'        => $this->status,
            'created_at'    => $this->created_at->toDateString(),
            'seller'        => new UserResource($this->whenLoaded('user')),
            'images'        => PropertyImageResource::collection($this->whenLoaded('images')),
            'main_image'    => new PropertyImageResource($this->whenLoaded('mainImage')),
            'status'           => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'reviewed_at'      => $this->reviewed_at,
            'construction_year'  => $this->construction_year,
            'energy_certificate' => $this->energy_certificate,
        ];
    }
}