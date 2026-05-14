<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'type',
        'operation',
        'price',
        'address',
        'city',
        'province',
        'postal_code',
        'latitude',
        'longitude',
        'bedrooms',
        'bathrooms',
        'area',
        'has_garage',
        'has_elevator',
        'has_pool',
        'has_garden',
        'is_furnished',
        'status',
        'rejection_reason',
        'reviewed_at',
        'construction_year',
        'energy_certificate',
    ];

    protected function casts(): array
    {
        return [
            'price'       => 'decimal:2',
            'area'        => 'decimal:2',
            'latitude'    => 'decimal:7',
            'longitude'   => 'decimal:7',
            'has_garage'  => 'boolean',
            'has_elevator'=> 'boolean',
            'has_pool'    => 'boolean',
            'has_garden'  => 'boolean',
            'is_furnished'=> 'boolean',
            'reviewed_at' => 'datetime',
        ];
    }

    // Relaciones

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function mainImage()
    {
        return $this->hasOne(PropertyImage::class)->where('is_main', true);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    // Helpers

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function formattedPrice(): string
    {
        return number_format($this->price, 0, ',', '.') . ' €';
    }
}