<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class PropertyImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'path',
        'is_main',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'is_main' => 'boolean',
        ];
    }

    // ── Relaciones ──────────────────────────────

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    // Helpers
public function getImageUrl(): string
{
    return 'http://localhost:8080/storage/' . $this->path;
}
}