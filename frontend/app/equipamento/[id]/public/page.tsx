'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Package, Hash, Cpu, HardDrive, MemoryStick, Network, Search } from 'lucide-react';

interface PublicEquipamento {
  id: number;
  nome: string;
  tipo: string;
  patrimonio?: string;
  numero_serie?: string;
  estado: string;
  laboratorio?: {
    nome: string;
    localizacao: string;
  };
  foto_url?: string;
  gerenciado_por_agente?: boolean;
  hostname?: string;
  processador?: string;
  memoria_ram?: string;
  disco?: string;
  ip_local?: string;
  mac_address?: string;
  gateway?: string;
  dns_servers?: string[];
  agent_version?: string;
  ultima_sincronizacao?: string;
  softwares?: Array<{
    id: number;
    nome: string;
    versao?: string;
    fabricante?: string;
    data_instalacao?: string;
  }>;
}

export default function PublicEquipamentoPage() {
  const params = useParams();
  const [equipamento, setEquipamento] = useState<PublicEquipamento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchSoftware, setSearchSoftware] = useState('');

  useEffect(() => {
    loadEquipamento();
  }, [params.id]);

  const loadEquipamento = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/public/equipamentos/${params.id}`
      );
      setEquipamento(response.data);
    } catch (error) {
      console.error('Erro ao carregar equipamento:', error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      em_uso: { variant: 'default', label: 'Em Uso' },
      reserva: { variant: 'secondary', label: 'Reserva' },
      manutencao: { variant: 'destructive', label: 'Manutenção' },
      descartado: { variant: 'outline', label: 'Descartado' },
    };
    const config = variants[estado] || { variant: 'default' as const, label: estado };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      computador: 'Computador',
      projetor: 'Projetor',
      roteador: 'Roteador',
      switch: 'Switch',
      impressora: 'Impressora',
      scanner: 'Scanner',
      outro: 'Outro',
    };
    return tipos[tipo] || tipo;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (error || !equipamento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Equipamento não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            IFG - Câmpus Jataí
          </h1>
          <p className="text-sm text-muted-foreground">
            Informações do Equipamento
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{equipamento.nome}</span>
              <Badge>{getTipoLabel(equipamento.tipo)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipamento.foto_url && (
              <div className="flex justify-center">
                <img 
                  src={equipamento.foto_url} 
                  alt={equipamento.nome}
                  className="w-full max-w-sm rounded-lg"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {equipamento.patrimonio && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Patrimônio</p>
                    <p className="font-medium">{equipamento.patrimonio}</p>
                  </div>
                </div>
              )}

              {equipamento.numero_serie && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Número de Série</p>
                    <p className="font-medium">{equipamento.numero_serie}</p>
                  </div>
                </div>
              )}

             {/* <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 flex items-center justify-center">
                    {getEstadoBadge(equipamento.estado)}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estado</p>
                  </div>
                </div>
              </div>*/}

              {equipamento.laboratorio && (
                <div className="col-span-2 flex items-start gap-2 pt-2 border-t">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Localização</p>
                    <p className="font-medium">{equipamento.laboratorio.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {equipamento.laboratorio.localizacao}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Informações Técnicas (Agente) */}
            {equipamento.gerenciado_por_agente && (
              <div className="pt-4 border-t space-y-3">
                <h3 className="font-semibold text-sm text-green-700 mb-3">Informações Técnicas (Agente)</h3>
                <div className="grid grid-cols-2 gap-4">
                  {equipamento.hostname && (
                    <div>
                      <p className="text-xs text-muted-foreground">Hostname</p>
                      <p className="font-medium text-sm">{equipamento.hostname}</p>
                    </div>
                  )}
                  {equipamento.processador && (
                    <div>
                      <p className="text-xs text-muted-foreground">Processador</p>
                      <p className="font-medium text-sm">{equipamento.processador}</p>
                    </div>
                  )}
                  {equipamento.memoria_ram && (
                    <div>
                      <p className="text-xs text-muted-foreground">Memória RAM</p>
                      <p className="font-medium text-sm">{equipamento.memoria_ram}</p>
                    </div>
                  )}
                  {equipamento.disco && (
                    <div>
                      <p className="text-xs text-muted-foreground">Disco</p>
                      <p className="font-medium text-sm">{equipamento.disco}</p>
                    </div>
                  )}
                  {equipamento.ip_local && (
                    <div>
                      <p className="text-xs text-muted-foreground">IP Local</p>
                      <p className="font-medium text-sm">{equipamento.ip_local}</p>
                    </div>
                  )}
                  {equipamento.mac_address && (
                    <div>
                      <p className="text-xs text-muted-foreground">MAC Address</p>
                      <p className="font-medium text-sm">{equipamento.mac_address}</p>
                    </div>
                  )}
                  {equipamento.gateway && (
                    <div>
                      <p className="text-xs text-muted-foreground">Gateway</p>
                      <p className="font-medium text-sm">{equipamento.gateway}</p>
                    </div>
                  )}
                  {equipamento.dns_servers && equipamento.dns_servers.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">DNS Servers</p>
                      <p className="font-medium text-sm">{equipamento.dns_servers.join(', ')}</p>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {equipamento.agent_version && <p>Versão do Agente: {equipamento.agent_version}</p>}
                  {equipamento.ultima_sincronizacao && (
                    <p>Última Sincronização: {new Date(equipamento.ultima_sincronizacao).toLocaleString('pt-BR')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Softwares Instalados */}
            {equipamento.softwares && equipamento.softwares.length > 0 && (
              <div className="pt-4 border-t space-y-3">
                <h3 className="font-semibold text-sm text-green-700 mb-3">
                  Softwares Instalados ({equipamento.softwares.length})
                </h3>
                
                {/* Campo de busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar software..."
                    value={searchSoftware}
                    onChange={(e) => setSearchSoftware(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Lista filtrada de softwares */}
                {equipamento.softwares
                  .filter((software) => 
                    software.nome.toLowerCase().includes(searchSoftware.toLowerCase()) ||
                    software.fabricante?.toLowerCase().includes(searchSoftware.toLowerCase()) ||
                    software.versao?.toLowerCase().includes(searchSoftware.toLowerCase())
                  )
                  .length > 0 ? (
                  <div className="space-y-2">
                    {equipamento.softwares
                      .filter((software) => 
                        software.nome.toLowerCase().includes(searchSoftware.toLowerCase()) ||
                        software.fabricante?.toLowerCase().includes(searchSoftware.toLowerCase()) ||
                        software.versao?.toLowerCase().includes(searchSoftware.toLowerCase())
                      )
                      .map((software) => (
                        <div key={software.id} className="p-2 bg-muted rounded">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{software.nome}</p>
                            {software.versao && <Badge variant="secondary" className="text-xs">{software.versao}</Badge>}
                          </div>
                          {software.fabricante && (
                            <p className="text-xs text-muted-foreground">{software.fabricante}</p>
                          )}
                          {software.data_instalacao && (
                            <p className="text-xs text-muted-foreground">
                              Instalado em: {new Date(software.data_instalacao).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Nenhum software encontrado para "{searchSoftware}"
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                Sistema de Gestão de Laboratórios - IFG Jataí
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


