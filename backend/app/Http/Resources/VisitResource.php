<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'scheduled_at' => $this->scheduled_at->toDateTimeString(),
            'status'       => $this->status,
            'notes'        => $this->notes,
            'property'     => new PropertyResource($this->whenLoaded('property')),
            'user'         => new UserResource($this->whenLoaded('user')),
        ];
    }
}