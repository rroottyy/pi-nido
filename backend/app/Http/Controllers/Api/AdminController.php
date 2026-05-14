<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\UserResource;
use App\Models\Message;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    use AuthorizesRequests;

    // Middleware de admin en cada método
    private function requireAdmin(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            abort(403, 'Acceso denegado.');
        }
    }

    // Dashboard — stats + anuncios pendientes
    public function dashboard(Request $request)
    {
        $this->requireAdmin($request);

        return response()->json([
            'stats' => [
                'total_properties' => Property::count(),
                'pending'          => Property::where('status', 'pending')->count(),
                'active'           => Property::where('status', 'active')->count(),
                'rejected'         => Property::where('status', 'rejected')->count(),
                'total_users'      => User::count(),
            ],
            'pending_properties' => PropertyResource::collection(
                Property::with(['user', 'mainImage'])
                    ->where('status', 'pending')
                    ->latest()
                    ->get()
            ),
        ]);
    }

    // Listar todos los anuncios con filtros
    public function properties(Request $request)
    {
        $this->requireAdmin($request);

        $query = Property::with(['user', 'mainImage'])
                            ->where('status', '!=', 'draft');

        if ($request->status) $query->where('status', $request->status);
        if ($request->search) $query->where('title', 'like', "%{$request->search}%");

        $properties = $query->latest()->paginate(20);

        return PropertyResource::collection($properties);
    }

    // Ver anuncio completo
    public function showProperty(Request $request, Property $property)
    {
        $this->requireAdmin($request);

        return new PropertyResource($property->load(['user', 'images']));
    }

    // Admitir anuncio
    public function approveProperty(Request $request, Property $property)
    {
        $this->requireAdmin($request);

        $property->update([
            'status'           => 'active',
            'rejection_reason' => null,
            'reviewed_at'      => now(),
        ]);

        // Notificar al propietario
        Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $property->user_id,
            'property_id' => $property->id,
            'body'        => "✅ Tu anuncio \"{$property->title}\" ha sido aprobado y ya está publicado en Nido.",
            'is_read'     => false,
        ]);

        return new PropertyResource($property->load(['user', 'images']));
    }

    // Rechazar anuncio
    public function rejectProperty(Request $request, Property $property)
    {
        $this->requireAdmin($request);

        $request->validate([
            'reason' => 'required|string|min:10',
        ]);

        $property->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
            'reviewed_at'      => now(),
        ]);

        // Notificar al propietario
        Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $property->user_id,
            'property_id' => $property->id,
            'body'        => "❌ Tu anuncio \"{$property->title}\" ha sido rechazado.\n\nMotivo: {$request->reason}",
            'is_read'     => false,
        ]);

        return new PropertyResource($property->load(['user', 'images']));
    }

    // Eliminar anuncio (admin)
    public function destroyProperty(Request $request, Property $property)
    {
        $this->requireAdmin($request);

        $property->delete();

        return response()->json(['message' => 'Anuncio eliminado.']);
    }

    // Listar usuarios
    public function users(Request $request)
    {
        $this->requireAdmin($request);

        $users = User::withCount('properties')->latest()->paginate(20);

        return UserResource::collection($users);
    }

    public function pendingCount(Request $request)
    {
        $this->requireAdmin($request);

        return response()->json([
            'count' => Property::where('status', 'pending')->count()
        ]);
    }

    public function notifyUser(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'body'        => 'required|string',
        ]);

        Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'property_id' => null,
            'body'        => $request->body,
            'is_read'     => false,
        ]);

        return response()->json(['message' => 'Notificación enviada.']);
    }
}