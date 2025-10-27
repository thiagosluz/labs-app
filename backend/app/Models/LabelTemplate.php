<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabelTemplate extends Model
{
    protected $fillable = [
        'name',
        'width',
        'height',
        'qr_size',
        'qr_position',
        'show_logo',
        'logo_position',
        'fields',
        'styles',
        'is_default',
        'is_active',
    ];

    protected $casts = [
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'qr_size' => 'decimal:2',
        'show_logo' => 'boolean',
        'fields' => 'array',
        'styles' => 'array',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Obter template padrão
     */
    public static function getDefaultTemplate()
    {
        return self::where('is_default', true)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Definir como template padrão
     */
    public function setAsDefault()
    {
        // Remover padrão de outros templates
        self::where('id', '!=', $this->id)->update(['is_default' => false]);
        
        $this->update(['is_default' => true]);
    }
}


