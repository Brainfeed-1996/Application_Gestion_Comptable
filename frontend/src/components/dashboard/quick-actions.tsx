'use client';

import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const ACTIONS: QuickAction[] = [
  {
    label: 'Ajouter transaction',
    href: '/transactions/new',
    color: 'blue',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4v16m8-8H4"
        />
      </svg>
    ),
  },
  {
    label: 'Créer facture',
    href: '/invoices/new',
    color: 'green',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    label: 'Nouveau bilan',
    href: '/bilan/new',
    color: 'purple',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    label: 'Voir rapports',
    href: '/reports',
    color: 'orange',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 3.05A2 2 0 0113 5v6a2 2 0 01-2 2 2 2 0 01-2-2V5a2 2 0 012-2 .99.99 0 01.99 1.05zm7 9A2 2 0 0119 13v6a2 2 0 01-2 2h-6a2 2 0 01-2-2v-6a2 2 0 012-2h6zm-14 0A2 2 0 015 13v6a2 2 0 01-2 2H3a2 2 0 01-2-2v-6a2 2 0 012-2h2z"
        />
      </svg>
    ),
  },
];

const COLOR_CLASSES: Record<QuickAction['color'], string> = {
  blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
  green: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white',
  purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
  orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
};

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="region" aria-label="Actions rapides">
      {ACTIONS.map((action) => (
        <a
          key={action.label}
          href={action.href}
          aria-label={action.label}
          className={cn(
            'group flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 text-center transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
              COLOR_CLASSES[action.color]
            )}
          >
            {action.icon}
          </span>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            {action.label}
          </span>
        </a>
      ))}
    </div>
  );
}

export default QuickActions;