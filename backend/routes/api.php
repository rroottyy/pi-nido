<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\VisitController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PropertyImageController;
use App\Http\Controllers\Api\AdminController;

// ─ Auth (pública)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ─ Propiedades públicas
Route::get('/properties',        [PropertyController::class, 'index']);
Route::get('/properties/{property}', [PropertyController::class, 'show']);

// ─ Rutas protegidas (requieren token)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Propiedades
    Route::post('/properties',                [PropertyController::class, 'store']);
    Route::put('/properties/{property}',      [PropertyController::class, 'update']);
    Route::delete('/properties/{property}',   [PropertyController::class, 'destroy']);
    Route::put('/properties/{property}/details', [PropertyController::class, 'updateDetails']);

    // Favoritos
    Route::get('/favorites',                          [FavoriteController::class, 'index']);
    Route::post('/favorites/{property}',              [FavoriteController::class, 'store']);
    Route::delete('/favorites/{property}',            [FavoriteController::class, 'destroy']);
    Route::get('/favorites/{property}',               [FavoriteController::class, 'check']);

    // Mensajes
    Route::get('/properties/{property}/messages',     [MessageController::class, 'index']);
    Route::post('/properties/{property}/messages',    [MessageController::class, 'store']);
    Route::get('/messages',                           [MessageController::class, 'inbox']);

    // Visitas
    Route::get('/visits',                             [VisitController::class, 'index']);
    Route::post('/properties/{property}/visits',      [VisitController::class, 'store']);
    Route::put('/visits/{visit}',                     [VisitController::class, 'update']);

    // Perfil
    Route::put('/me',          [AuthController::class, 'updateProfile']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);

    // Imágenes
    Route::post('/properties/{property}/images',                   [PropertyImageController::class, 'store']);
    Route::put('/properties/{property}/images/{image}/set-main',   [PropertyImageController::class, 'setMain']);
    Route::delete('/properties/{property}/images/{image}',         [PropertyImageController::class, 'destroy']);

    // Admin
    Route::prefix('admin')->group(function () {
    Route::get('/dashboard',                        [AdminController::class, 'dashboard']);
    Route::get('/pending-count',                    [AdminController::class, 'pendingCount']);
    Route::get('/properties',                       [AdminController::class, 'properties']);
    Route::get('/properties/{property}',            [AdminController::class, 'showProperty']);
    Route::put('/properties/{property}/approve',    [AdminController::class, 'approveProperty']);
    Route::put('/properties/{property}/reject',     [AdminController::class, 'rejectProperty']);
    Route::delete('/properties/{property}',         [AdminController::class, 'destroyProperty']);
    Route::get('/users',                            [AdminController::class, 'users']);
    Route::post('/admin/notify-user', [AdminController::class, 'notifyUser']);
});

    // Usuarios
    Route::get('/my-properties', [PropertyController::class, 'myProperties']);
    Route::put('/properties/{property}/status', [PropertyController::class, 'updateStatus']);
    Route::get('/notifications',          [MessageController::class, 'notifications']);
    Route::put('/notifications/{message}/read', [MessageController::class, 'markRead']);
    Route::get('/notifications/unread-count', [MessageController::class, 'unreadCount']);
    Route::delete('/notifications/{message}',  [MessageController::class, 'deleteNotification']);
    Route::delete('/notifications',            [MessageController::class, 'deleteAllNotifications']);
});