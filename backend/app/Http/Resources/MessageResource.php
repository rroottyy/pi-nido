<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'body'       => $this->body,
            'is_read'    => $this->is_read,
            'created_at' => $this->created_at->toDateTimeString(),
            'sender'     => $this->whenLoaded('sender', fn() => [
                'id'    => $this->sender->id,
                'name'  => $this->sender->name,
                'email' => $this->sender->email,
            ]),
            'property'   => $this->whenLoaded('property', fn() => [
                'id'    => $this->property->id,
                'title' => $this->property->title,
            ]),
        ];
    }
}