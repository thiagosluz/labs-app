'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, HardDrive, MonitorSmartphone, Package, Wrench, FileText, ChevronLeft, Bot, Settings, ClipboardType } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: MonitorSmartphone, label: 'Laboratórios', href: '/laboratorios' },
  { icon: HardDrive, label: 'Equipamentos', href: '/equipamentos' },
  { icon: Package, label: 'Softwares', href: '/softwares' },
  { icon: Wrench, label: 'Manutenções', href: '/manutencoes' },
  { icon: Bot, label: 'Agentes', href: '/agentes' },
  { icon: FileText, label: 'Relatórios', href: '/relatorios' },
  { icon: ClipboardType, label: 'Templates Etiquetas', href: '/templates-etiquetas' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "relative border-r bg-muted/40 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <span className="text-lg font-semibold">Menu</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )} />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className={cn(
            "text-xs text-muted-foreground",
            isCollapsed && "text-center"
          )}>
            {isCollapsed ? "©" : "© 2025 IFG Câmpus Jataí"}
          </div>
        </div>
      </div>
    </div>
  );
}

