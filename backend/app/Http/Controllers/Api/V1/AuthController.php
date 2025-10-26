<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login do usuário (SPA Authentication)
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');

        // Tentar autenticar usando o guard web (session-based)
        if (!\Illuminate\Support\Facades\Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        $user = \Illuminate\Support\Facades\Auth::user();

        if (!$user->active) {
            \Illuminate\Support\Facades\Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['Esta conta está inativa.'],
            ]);
        }

        // Regenerar a sessão para prevenir session fixation
        $request->session()->regenerate();

        return response()->json([
            'user' => $user,
            'message' => 'Login realizado com sucesso.',
        ]);
    }

    /**
     * Logout do usuário (SPA Authentication)
     */
    public function logout(Request $request): JsonResponse
    {
        \Illuminate\Support\Facades\Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout realizado com sucesso.',
        ]);
    }

    /**
     * Obter usuário autenticado (SPA Authentication)
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(\Illuminate\Support\Facades\Auth::user());
    }

    /**
     * Atualizar perfil do usuário
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
            'password' => 'sometimes|min:8|confirmed',
        ]);

        $user = $request->user();
        
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json($user);
    }
}

