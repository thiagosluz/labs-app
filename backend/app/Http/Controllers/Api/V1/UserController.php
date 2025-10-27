<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Listar usuários (incluindo inativos para admin)
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $query = User::query();

        // Filtrar apenas ativos se não for admin
        if (!auth()->user()->isAdmin()) {
            $query->where('active', true);
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('active', $request->status === 'ativo');
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->get();

        return response()->json($users);
    }

    /**
     * Exibir usuário
     */
    public function show(User $user): JsonResponse
    {
        Gate::authorize('view', $user);

        $user->load(['laboratorios', 'manutencoes', 'activityLogs' => function ($query) {
            $query->latest()->limit(10);
        }]);

        return response()->json($user);
    }

    /**
     * Criar usuário
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        Gate::authorize('create', User::class);

        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $data['active'] = $data['active'] ?? true;

        $user = User::create($data);

        Log::info("Usuário criado", [
            'user_id' => $user->id,
            'created_by' => auth()->id(),
        ]);

        return response()->json($user, 201);
    }

    /**
     * Atualizar usuário
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        Gate::authorize('update', $user);

        $data = $request->validated();

        // Se senha foi informada, fazer hash
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        Log::info("Usuário atualizado", [
            'user_id' => $user->id,
            'updated_by' => auth()->id(),
        ]);

        return response()->json($user);
    }

    /**
     * Deletar usuário (soft delete)
     */
    public function destroy(User $user): JsonResponse
    {
        Gate::authorize('delete', $user);

        $user->delete();

        Log::info("Usuário deletado", [
            'user_id' => $user->id,
            'deleted_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Usuário deletado com sucesso']);
    }

    /**
     * Ativar/Desativar usuário
     */
    public function toggleStatus(User $user): JsonResponse
    {
        Gate::authorize('update', $user);

        $user->active = !$user->active;
        $user->save();

        Log::info("Status do usuário alterado", [
            'user_id' => $user->id,
            'status' => $user->active ? 'ativado' : 'desativado',
            'changed_by' => auth()->id(),
        ]);

        return response()->json($user);
    }

    /**
     * Redefinir senha
     */
    public function resetPassword(Request $request, User $user): JsonResponse
    {
        Gate::authorize('update', $user);

        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->password = Hash::make($request->password);
        $user->save();

        Log::info("Senha do usuário redefinida", [
            'user_id' => $user->id,
            'reset_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Senha redefinida com sucesso']);
    }

    /**
     * Atualizar permissões
     */
    public function updatePermissions(Request $request, User $user): JsonResponse
    {
        Gate::authorize('update', $user);

        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string',
        ]);

        $user->permissions = $request->permissions;
        $user->save();

        Log::info("Permissões do usuário atualizadas", [
            'user_id' => $user->id,
            'updated_by' => auth()->id(),
            'permissions' => $request->permissions,
        ]);

        return response()->json(['message' => 'Permissões atualizadas com sucesso', 'user' => $user]);
    }
}

