<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Listar atividades
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user')->latest();

        // Filtrar por usuário
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filtrar por ação
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Filtrar por modelo
        if ($request->has('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        // Filtrar por data
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $activities = $query->paginate(20);

        return response()->json($activities);
    }

    /**
     * Exibir atividade específica
     */
    public function show(ActivityLog $activityLog): JsonResponse
    {
        $activityLog->load('user');

        return response()->json($activityLog);
    }

    /**
     * Atividades de um usuário específico
     */
    public function userActivities(User $user, Request $request): JsonResponse
    {
        $query = $user->activityLogs()->latest();

        // Filtrar por ação
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Filtrar por modelo
        if ($request->has('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        // Filtrar por data
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $activities = $query->paginate(20);

        return response()->json($activities);
    }
}
