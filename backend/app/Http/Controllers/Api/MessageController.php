<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\Property;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request, Property $property)
    {
        $messages = Message::with(['sender', 'receiver'])
            ->where('property_id', $property->id)
            ->where(function ($q) use ($request) {
                $q->where('sender_id', $request->user()->id)
                  ->orWhere('receiver_id', $request->user()->id);
            })
            ->oldest()
            ->get();

        // Marcar como leídos
        Message::where('property_id', $property->id)
            ->where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return MessageResource::collection($messages);
    }

    public function store(Request $request, Property $property)
    {
        $data = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $message = Message::create([
            'property_id' => $property->id,
            'sender_id'   => $request->user()->id,
            'receiver_id' => $property->user_id,
            'body'        => $data['body'],
        ]);

        return new MessageResource($message->load(['sender', 'receiver']));
    }
    public function notifications(Request $request)
    {
        $messages = $request->user()
            ->receivedMessages()
            ->with(['sender', 'property'])
            ->latest()
            ->get();

        return MessageResource::collection($messages);
    }

    public function markRead(Request $request, Message $message)
    {
        // Solo puede marcar como leído el receptor
        if ($message->receiver_id !== $request->user()->id) {
            abort(403);
        }

        $message->update(['is_read' => true]);

        return new MessageResource($message);
    }

    public function unreadCount(Request $request)
    {
    $count = $request->user()
        ->receivedMessages()
        ->where('is_read', false)
        ->count();

    return response()->json(['count' => $count]);
    }

    public function deleteNotification(Request $request, Message $message)
{
    if ($message->receiver_id !== $request->user()->id) {
        abort(403);
    }

    $message->delete();

    return response()->json(['message' => 'Notificación eliminada.']);
}

public function deleteAllNotifications(Request $request)
    {
        $request->user()->receivedMessages()->delete();

        return response()->json(['message' => 'Todas las notificaciones eliminadas.']);
    }

public function inbox(Request $request)
    {
        $messages = $request->user()
            ->receivedMessages()
            ->with(['sender', 'property'])
            ->whereNotNull('sender_id')
            ->whereColumn('sender_id', '!=', 'receiver_id') // excluir auto-notificaciones
            ->latest()
            ->get();

        return MessageResource::collection($messages);
    }
}