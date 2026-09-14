# Architecture Frontend — Next.js + TypeScript + Tailwind

> Application comptable complète : dashboard 360, transactions, factures, clients, rapports, paramètres RBAC.

---

## 1. Arborescence complète

```
frontend/
├── .next/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   ├── icons/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── two-factor/
│   │   │   │   └── page.tsx
│   │   │   ├── oauth/
│   │   │   │   └── callback/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx
│   │   │   ├── cash-flow/
│   │   │   │   └── page.tsx
│   │   │   ├── alerts/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (transactions)/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── categories/
│   │   │       └── page.tsx
│   │   ├── (invoices)/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── quotes/
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── (clients)/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── portal/
│   │   │       └── page.tsx
│   │   ├── (reports)/
│   │   │   ├── bilan/
│   │   │   │   └── page.tsx
│   │   │   ├── compte-rendu/
│   │   │   │   └── page.tsx
│   │   │   ├── tva/
│   │   │   │   └── page.tsx
│   │   │   └── fec/
│   │   │       └── page.tsx
│   │   ├── (settings)/
│   │   │   ├── organization/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── rbac/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── health/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── RadioButton.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Accordion.tsx
│   │   │   └── Chart.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ResponsiveWrapper.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── TwoFactorForm.tsx
│   │   │   └── OAuthCallback.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard360.tsx
│   │   │   ├── CashFlowChart.tsx
│   │   │   ├── MetricsCards.tsx
│   │   │   └── AlertsList.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionsTable.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   └── CategoryManager.tsx
│   │   ├── invoices/
│   │   │   ├── InvoicesTable.tsx
│   │   │   ├── InvoiceEditor.tsx
│   │   │   ├── InvoiceDetail.tsx
│   │   │   └── QuoteEditor.tsx
│   │   ├── clients/
│   │   │   ├── ClientsTable.tsx
│   │   │   ├── ClientDetail.tsx
│   │   │   └── ClientPortal.tsx
│   │   └── reports/
│   │       ├── BilanReport.tsx
│   │       ├── CRReport.tsx
│   │       ├── TVAReport.tsx
│   │       └── FECReport.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useTransactions.ts
│   │   ├── useInvoices.ts
│   │   ├── useClients.ts
│   │   ├── useReports.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── transactions.service.ts
│   │   ├── invoices.service.ts
│   │   ├── clients.service.ts
│   │   └── reports.service.ts
│   ├── store/
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   ├── uiSlice.ts
│   │   └── types.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── validations.ts
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   ├── theme.ts
│   │   └── permissions.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── transaction.types.ts
│   │   ├── invoice.types.ts
│   │   ├── client.types.ts
│   │   ├── report.types.ts
│   │   └── index.ts
│   ├── middleware.ts
│   └── styles/
│       └── globals.css
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
├── package.json
├── postcss.config.js
└── .eslintrc.json
```

---

## 2. package.json

```json
{
  "name": "comptabilite-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "dependencies": {
    "axios": "^1.6.0",
    "clsx": "^2.1.0",
    "chart.js": "^4.4.0",
    "date-fns": "^2.30.0",
    "js-cookie": "^3.0.5",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.0",
    "react-icons": "^5.0.0",
    "zod": "^3.22.0",
    "@tanstack/react-query": "^5.10.0",
    "@hookform/resolvers": "^3.3.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/js-cookie": "^3.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "postcss": "^8.4.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^3.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 3. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "incremental": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": ["jest", "@testing-library/jest-dom", "js-cookie"],
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components": ["src/components"],
      "@/hooks": ["src/hooks"],
      "@/services": ["src/services"],
      "@/store": ["src/store"],
      "@/types": ["src/types"],
      "@/lib": ["src/lib"],
      "@/styles": ["src/styles"]
    }
  },
  "include": [
    "next-env.d.ts",
    "/**/*.ts",
    "/**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

---

## 4. next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost", "127.0.0.1", "cdn.example.com"],
    formats: ["image/avif", "image/webp"]
  },
  experimental: {
    serverActions: true,
    turbo: {
      rules: {
        "*.svg": { sideEffects: true }
      }
    }
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

---

## 5. tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81"
        },
        success: { 500: "#10b981" },
        warning: { 500: "#f59e0b" },
        danger: { 500: "#ef4444" }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"]
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

---

## 6. Structure des composants

### 6.1 Layout

**`src/components/layout/Header.tsx`**
- Navigation principale, menu mobile, toggle sidebar, user dropdown (profil, paramètres, déconnexion).

**`src/components/layout/Sidebar.tsx`**
- Navigation arborée par modules : Dashboard, Transactions, Factures, Clients, Rapports, Paramètres.
- Accordéon responsive avec icônes `react-icons`.
- RBAC : masquage dynamique des entrées selon les permissions.

**`src/components/layout/Footer.tsx`**
- Copyright, version, liens juridiques.

**`src/components/layout/ResponsiveWrapper.tsx`**
- Conteneur flexbox avec breakpoints Tailwind, gestion du gap et padding.

### 6.2 Auth

**`src/components/auth/LoginForm.tsx`**
- Formulaire avec `react-hook-form` + `@hookform/resolvers/zod`.
- Validation email/password via Zod.
- Toggle mot de passe, lien réinitialisation, bouton OAuth.

**`src/components/auth/RegisterForm.tsx`**
- Champs : nom, email, entreprise, mot de passe, confirmation.
- Validation forte (majuscule, chiffre, caractère spécial).

**`src/components/auth/TwoFactorForm.tsx`**
- Saisie code 6 chiffres, auto-focus, timer de 30s pour renvoi.

**`src/components/auth/OAuthCallback.tsx`**
- Gestion redirection provider, échange token, stockage cookie HttpOnly.

### 6.3 Dashboard

**`src/components/dashboard/Dashboard360.tsx`**
- Vue d'ensemble : graphique trésorerie, cartes métriques, alertes récentes.

**`src/components/dashboard/CashFlowChart.tsx`**
- Chart.js line chart : entrées/sorties sur 30 jours, couleurs différenciées.

**`src/components/dashboard/MetricsCards.tsx`**
- 4 cartes : chiffre d'affaires, dettes, marge, comptes clients.

**`src/components/dashboard/AlertsList.tsx`**
- Liste d'alertes (factures à échéance, seuils de stock, régularité fiscal).

### 6.4 Transactions

**`src/components/transactions/TransactionsTable.tsx`**
- Table paginée, filtres (date, catégorie, type, tiers), tri, export CSV.
- Actions : édition, suppression, duplication.

**`src/components/transactions/TransactionForm.tsx`**
- Formulaire riche : date, libellé, montant, catégorie, tiers, pièce jointe.
- Validation Zod, mode répétition (récurrent).

**`src/components/transactions/CategoryManager.tsx`**
- CRUD catégories dépenses/recettes, couleur, icône, parentée.

### 6.5 Invoices

**`src/components/invoices/InvoicesTable.tsx`**
- Statuts (brouillon, envoyée, payée, impayée, annulée), filtres, recherche.

**`src/components/invoices/InvoiceEditor.tsx`**
- Éditeur de facture : lignes de produits, TVA, remise, notes, termes.
- Génération PDF, envoi email.

**`src/components/invoices/InvoiceDetail.tsx`**
- Vue en lecture, téléchargement PDF, historique des paiements.

**`src/components/invoices/QuoteEditor.tsx`**
- Devis similaire facture, conversion en facture.

### 6.6 Clients

**`src/components/clients/ClientsTable.tsx`**
- Liste clients avec solde, dernière transaction, statut.

**`src/components/clients/ClientDetail.tsx`**
- Profil, coordonnées, historique transactions, pièces jointes.

**`src/components/clients/ClientPortal.tsx`**
- Espace client : consultation factures, paiement en ligne.

### 6.7 Reports

**`src/components/reports/BilanReport.tsx`**
- Actif / Passif, graphique en barres, export Excel/PDF.

**`src/components/reports/CRReport.tsx`**
- Compte de résultat : produits, charges, résultat net.

**`src/components/reports/TVAReport.tsx`**
- Déclaration TVA, calcul du report, base taxable.

**`src/components/reports/FECReport.tsx`**
- Export au format FEC (fichier .txt), validation format banque de France.

### 6.8 Settings

**`src/components/settings/OrganizationSettings.tsx`**
- Nom, SIRET, adresse, devise, timezone, plan d'abonnement.

**`src/components/settings/UsersManager.tsx`**
- Liste utilisateurs, invitation, rôles, statut actif/inactif.

**`src/components/settings/RBAC.tsx`**
- Gestion des rôles et permissions par resource + action (CRUD matrix).

---

## 7. Hooks personnalisés

### `src/hooks/useAuth.ts`
```ts
interface UseAuthReturn {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}
```

### `src/hooks/useApi.ts`
```ts
interface UseApiOptions<T> {
  queryKey: readonly unknown[]
  queryFn: () => Promise<T>
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}
// Wrapper autour de @tanstack/react-query avec gestion erreurs axios.
```

### `src/hooks/useTransactions.ts`
- `useTransactions()` — paginated list with filters
- `useTransaction(id)` — single fetch
- `useCreateTransaction()` — mutation
- `useUpdateTransaction(id)` — mutation
- `useDeleteTransaction(id)` — mutation

### `src/hooks/useInvoices.ts`
- `useInvoices(params)` — list with status filter
- `useInvoice(id)` — single
- `useCreateInvoice()`, `useUpdateInvoice(id)`, `useDeleteInvoice(id)`
- `useGeneratePdf(id)` — trigger PDF download

---

## 8. Services API

### `src/services/api.ts`
```ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    })
    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('access_token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.get<T>(url, config)
    return res.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.post<T>(url, data, config)
    return res.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.put<T>(url, data, config)
    return res.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.delete<T>(url, config)
    return res.data
  }
}

export const apiService = new ApiService()
export default apiService
```

### `src/services/auth.service.ts`
```ts
export const authService = {
  login: (credentials: LoginRequest) => apiService.post('/auth/login', credentials),
  register: (data: RegisterRequest) => apiService.post('/auth/register', data),
  logout: () => apiService.post('/auth/logout'),
  refreshToken: (refreshToken: string) => apiService.post('/auth/refresh', { refreshToken }),
  verify2FA: (code: string) => apiService.post('/auth/verify-2fa', { code }),
  getMe: () => apiService.get('/auth/me')
}
```

---

## 9. Store global (Zustand)

### `src/store/index.ts`
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { authStore } from './authSlice'
import { uiStore } from './uiSlice'

export interface RootState {
  auth: ReturnType<typeof authStore>
  ui: ReturnType<typeof uiStore>
}

export const useStore = create<RootState>()(
  (set, get) => ({
    auth: authStore(set, get),
    ui: uiStore(set, get)
  })
)
```

### `src/store/authSlice.ts`
```ts
export interface AuthSlice {
  user: User | null
  session: Session | null
  accessToken: string | null
  refreshToken: string | null
  permissions: string[]
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setTokens: (access: string, refresh: string) => void
  setPermissions: (perms: string[]) => void
  clearAuth: () => void
}

export const authSlice = (set): AuthSlice => ({
  user: null,
  session: null,
  accessToken: null,
  refreshToken: null,
  permissions: [],
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
  setPermissions: (perms) => set({ permissions: perms }),
  clearAuth: () => set({ user: null, session: null, accessToken: null, refreshToken: null, permissions: [] })
})
```

### `src/store/uiSlice.ts`
```ts
export interface UISlice {
  sidebarOpen: boolean
  darkMode: boolean
  notifications: Notification[]
  toggleSidebar: () => void
  setDarkMode: (enabled: boolean) => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
}
```

---

## 10. Protection des routes (middleware Next.js)

### `src/middleware.ts`
```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_ROUTES = ['/login', '/register', '/oauth/callback']
const AUTH_ROUTES = ['/(auth)']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  if (isPublic) return NextResponse.next()

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    const hasPermission = checkPermission(pathname, payload.permissions)

    if (!hasPermission) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.sub)
    return response
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

function checkPermission(pathname: string, permissions: string[]): boolean {
  const routePermissions: Record<string, string> = {
    '/transactions': 'transactions:read',
    '/invoices': 'invoices:read',
    '/clients': 'clients:read',
    '/reports': 'reports:read',
    '/settings': 'settings:read'
  }

  for (const [route, permission] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      return permissions.includes(permission)
    }
  }
  return true
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

---

## 11. Composants de base (UI)

### `src/components/ui/Button.tsx`
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', isLoading, icon, children, ...props }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none'
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-gray-300 hover:bg-gray-50',
    danger: 'bg-danger-500 text-white hover:bg-danger-600',
    ghost: 'hover:bg-gray-100'
  }
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button className={cn(baseClasses, variantClasses[variant], sizeClasses[size], props.disabled && 'opacity-50')} {...props}>
      {isLoading && <Spinner className="mr-2" />}
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}
```

### `src/components/ui/Input.tsx`
- Props : `label`, `error`, `helperText`, `icon`, `type`, validation RHF.
- Variant outline/ghost, focus ring primary.

### `src/components/ui/Table.tsx`
```tsx
interface Column<T> {
  key: string
  header: string
  accessor: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  actions?: (row: T) => React.ReactNode
  pagination?: {
    current: number
    total: number
    pageSize: number
    onPageChange: (page: number) => void
  }
}

export function Table<T>({ data, columns, loading, onSort, actions, pagination }: TableProps<T>) {
  // Rendu du tableau avec en-tête triable, lignes cliquables, skeleton loading.
}
```

### `src/components/ui/Modal.tsx`
- Tailwind portal, escape key, click outside, animations CSS.
- Variants : alert, confirm, form.

### `src/components/ui/Card.tsx`
- Wrapper avec header, body, footer, shadow, border-radius personnalisable.

### `src/components/ui/Chart.tsx`
- Wrapper React Chart.js 2, types de graphiques : line, bar, pie, doughnut, area.
- Props : `type`, `data`, `options`, `loading` (skeleton).

---

## 12. Bibliothèques & conventions

| Concern | Tech | Raison |
|---|---|---|
| Routing | Next.js App Router | SSR + ISR natif |
| Styles | Tailwind CSS | Utility-first, rapide |
| Formulaires | React Hook Form + Zod | Performances + validation |
| Requêtes | @tanstack/react-query | Cache, retry, background refetch |
| HTTP | Axios | Interceptors, types |
| Store | Zustand | Léger, hooks idiomatiques |
| Graphismes | Chart.js + react-chartjs-2 | Richesse, interactions |
| Dates | date-fns | Fonctionnel pur, tree-shakeable |
| Icônes | react-icons | Couleur + taille flexibles |
| Auth | jose (JWT) | Vérification côté serveur middleware |
| Tests | Jest + React Testing Library | Couverture composants/hooks |
| Build | Webpack/Turbopack | Optimisations CSS/JS |
| CI/CD | GitHub Actions | Lint, typecheck, tests, build |
| Formatage | Prettier + ESLint | Code cohérent |
