export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'tecnico' | 'visualizador';
  permissions?: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user?: User;
  action: string;
  model_type: string;
  model_id: number;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface Laboratorio {
  id: number;
  nome: string;
  localizacao: string;
  responsavel_id?: number;
  responsavel?: User;
  quantidade_maquinas?: number; // Deprecated - usar quantidade_equipamentos
  quantidade_equipamentos?: number;
  status: 'ativo' | 'inativo' | 'manutencao';
  descricao?: string;
  equipamentos?: Equipamento[];
  softwares?: Software[]; // Softwares da tabela pivot (deprecated)
  softwares_equipamentos?: any[]; // Softwares dos equipamentos do laboratório
  created_at: string;
  updated_at: string;
}

export interface Equipamento {
  id: number;
  nome: string;
  tipo: 'computador' | 'projetor' | 'roteador' | 'switch' | 'impressora' | 'scanner' | 'outro';
  fabricante?: string;
  modelo?: string;
  numero_serie?: string;
  patrimonio?: string;
  data_aquisicao?: string;
  estado: 'em_uso' | 'reserva' | 'manutencao' | 'descartado';
  laboratorio_id?: number;
  laboratorio?: Laboratorio;
  especificacoes?: string;
  foto?: string;
  anexos?: string[];
  softwares?: Software[];
  manutencoes?: Manutencao[];
  movimentacoes?: HistoricoMovimentacao[];
  qr_code_path?: string;
  qr_code_url?: string;
  public_url?: string;
  // Campos do agente
  hostname?: string;
  processador?: string;
  memoria_ram?: string;
  disco?: string;
  ip_local?: string;
  mac_address?: string;
  gateway?: string;
  dns_servers?: string[];
  gerenciado_por_agente?: boolean;
  agent_version?: string;
  ultima_sincronizacao?: string;
  dados_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface HistoricoMovimentacao {
  id: number;
  equipamento_id: number;
  equipamento?: Equipamento;
  laboratorio_origem_id?: number;
  laboratorio_origem?: Laboratorio;
  laboratorio_destino_id?: number;
  laboratorio_destino?: Laboratorio;
  data_movimentacao: string;
  motivo?: string;
  usuario_id?: number;
  usuario?: User;
  created_at: string;
  updated_at: string;
}

export interface Software {
  id: number;
  nome: string;
  versao?: string;
  fabricante?: string;
  tipo_licenca: 'livre' | 'educacional' | 'proprietario';
  quantidade_licencas?: number;
  data_expiracao?: string;
  descricao?: string;
  equipamentos?: Equipamento[];
  equipamentos_count?: number;
  laboratorios?: Laboratorio[];
  laboratorios_equipamentos?: any[];
  created_at: string;
  updated_at: string;
}

export interface Manutencao {
  id: number;
  equipamento_id: number;
  equipamento?: Equipamento;
  data: string;
  tipo: 'corretiva' | 'preventiva';
  descricao: string;
  tecnico_id?: number;
  tecnico?: User;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  anexos?: string[];
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  stats: {
    total_laboratorios: number;
    laboratorios_ativos: number;
    total_equipamentos: number;
    equipamentos_em_uso: number;
    equipamentos_manutencao: number;
    equipamentos_reserva: number;
    total_softwares: number;
    softwares_expirando: number;
    manutencoes_pendentes: number;
    manutencoes_mes: number;
  };
  charts: {
    equipamentos_por_tipo: Record<string, number>;
    equipamentos_por_estado: Record<string, number>;
    manutencoes_por_mes: Array<{ mes: number; total: number }>;
  };
  alerts: {
    licencas_expirando: Software[];
    equipamentos_manutencao: Equipamento[];
  };
  top_laboratorios: Laboratorio[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

