import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useAuthStore } from '@/store/authSlice';

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/dashboard', icon: '📊', sections: ['/dashboard'] },
  { label: 'Transactions', href: '/transactions', icon: '💰', sections: ['/transactions'] },
  { label: 'Factures', href: '/invoices', icon: '📄', sections: ['/invoices'] },
  { label: 'Clients', href: '/clients', icon: '👥', sections: ['/clients'] },
  { label: 'Rapports', href: '/reports/bilan', icon: '📈', sections: ['/reports'] },
  { label: 'Paramètres', href: '/settings/organization', icon: '⚙️', sections: ['/settings'] },
];

interface SidebarProps {
  pathname: string;
  onNavigate?: (path: string) => void;
}

export function Sidebar({ pathname, onNavigate }: SidebarProps) {
  const { user } = useAuthStore();

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background flex flex-col"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="text-xl font-bold" aria-hidden="true">💼</span>
        <span className="font-semibold">Application Comptable</span>
      </div>

      <nav className="flex-1 overflow-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(item.href);
                }
              }}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true">👤</span>
          <div>
            <p className="text-sm font-medium">{user?.name || 'Utilisateur'}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
