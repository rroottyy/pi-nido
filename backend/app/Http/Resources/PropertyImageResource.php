<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'      => $this->id,
            'path'    => $this->path,
            'url' => 'http://localhost:8080/storage/' . $this->resource->path,
            'is_main' => $this->is_main,
            'order'   => $this->order,
        ];
    }
}