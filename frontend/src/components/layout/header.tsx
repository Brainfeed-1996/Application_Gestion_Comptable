import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6" role="banner">
      <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Ouvrir le menu">
        <Menu className="h-5 w-5" />
      </Button>

      {title && <h1 className="text-lg font-semibold">{title}</h1>}

      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            placeholder="Rechercher..."
            className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Rechercher"
          />
        </div>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
