<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language', 'es');

        // Aceptamos solo los idiomas soportados
        $supported = ['es', 'ca', 'en'];
        
        // Coger solo los dos primeros caracteres (es-ES → es)
        $locale = substr($locale, 0, 2);

        if (!in_array($locale, $supported)) {
            $locale = 'es';
        }

        app()->setLocale($locale);

        return $next($request);
    }
}