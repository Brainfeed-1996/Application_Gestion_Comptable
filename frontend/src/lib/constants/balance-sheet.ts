// Balance sheet (Bilan) constants and template structures.
// French accounting plan (Plan Comptable Général) conventions are used.

export type BalanceSheetCategory = 'actif' | 'passif' | 'capitaux_propres';

export interface BalanceSheetSection {
  code: string;
  label: string;
  category: BalanceSheetCategory;
  accountCodes: string[];
}

export interface BalanceSheetTemplate {
  id: string;
  name: string;
  sections: BalanceSheetSection[];
}

export interface BusinessTypeConfig {
  id: string;
  label: string;
  template: BalanceSheetTemplate;
}

// Default account code ranges used to classify ledger accounts.
export const BALANCE_SHEET_ACCOUNT_RANGES: Record<BalanceSheetCategory, { start: string; end: string }> = {
  actif: { start: '1', end: '5' },
  passif: { start: '3', end: '4' },
  capitaux_propres: { start: '5', end: '5' },
};

// Default bilan template structure.
export const DEFAULT_BILAN_TEMPLATE: BalanceSheetTemplate = {
  id: 'default-bilan',
  name: 'Bilan standard',
  sections: [
    {
      code: 'A',
      label: 'Actif',
      category: 'actif',
      accountCodes: [
        '1', // Immobilisations incorporelles
        '2', // Immobilisations corporelles
        '3', // Immobilisations financières
        '4', // Stocks
        '5', // Créances
        '6', // Valeurs mobilières de placement
        '7', // Disponibilités
      ],
    },
    {
      code: 'P',
      label: 'Passif',
      category: 'passif',
      accountCodes: [
        '3', // Dettes à court terme
        '4', // Dettes à long terme
        '5', // Provisions
        '6', // Autres dettes
      ],
    },
    {
      code: 'CP',
      label: 'Capitaux propres',
      category: 'capitaux_propres',
      accountCodes: [
        '10', // Capital social
        '11', // Réserves
        '12', // Report à nouveau
        '13', // Résultat de l'exercice
        '14', // Subventions d\'investissement
        '15', // Provisions pour risques
      ],
    },
  ],
};

// Business type configurations with tailored bilan templates.
export const BUSINESS_TYPE_CONFIGS: BusinessTypeConfig[] = [
  {
    id: 'service',
    label: 'Prestation de services',
    template: {
      id: 'service-bilan',
      name: 'Bilan prestations de services',
      sections: [
        {
          code: 'A',
          label: 'Actif',
          category: 'actif',
          accountCodes: ['1', '2', '5', '6', '7'],
        },
        {
          code: 'P',
          label: 'Passif',
          category: 'passif',
          accountCodes: ['3', '4', '5', '6'],
        },
        {
          code: 'CP',
          label: 'Capitaux propres',
          category: 'capitaux_propres',
          accountCodes: ['10', '11', '12', '13'],
        },
      ],
    },
  },
  {
    id: 'commerce',
    label: 'Commerce de détail',
    template: {
      id: 'commerce-bilan',
      name: 'Bilan commerce de détail',
      sections: [
        {
          code: 'A',
          label: 'Actif',
          category: 'actif',
          accountCodes: ['1', '2', '3', '4', '5', '6', '7'],
        },
        {
          code: 'P',
          label: 'Passif',
          category: 'passif',
          accountCodes: ['3', '4', '5', '6'],
        },
        {
          code: 'CP',
          label: 'Capitaux propres',
          category: 'capitaux_propres',
          accountCodes: ['10', '11', '12', '13'],
        },
      ],
    },
  },
  {
    id: 'production',
    label: 'Production de biens',
    template: {
      id: 'production-bilan',
      name: 'Bilan production de biens',
      sections: [
        {
          code: 'A',
          label: 'Actif',
          category: 'actif',
          accountCodes: ['1', '2', '3', '4', '5', '6', '7'],
        },
        {
          code: 'P',
          label: 'Passif',
          category: 'passif',
          accountCodes: ['3', '4', '5', '6'],
        },
        {
          code: 'CP',
          label: 'Capitaux propres',
          category: 'capitaux_propres',
          accountCodes: ['10', '11', '12', '13', '14'],
        },
      ],
    },
  },
];

// Default account codes per balance sheet category.
export const DEFAULT_ACCOUNT_CODES: Record<BalanceSheetCategory, string[]> = {
  actif: ['1', '2', '3', '4', '5', '6', '7'],
  passif: ['3', '4', '5', '6'],
  capitaux_propres: ['10', '11', '12', '13', '14', '15'],
};

// Human-readable labels for each category.
export const CATEGORY_LABELS: Record<BalanceSheetCategory, string> = {
  actif: 'Actif total',
  passif: 'Passif total',
  capitaux_propres: 'Capitaux propres',
};

// Helper to get a business type config by id.
export function getBusinessTypeConfig(id: string): BusinessTypeConfig | undefined {
  return BUSINESS_TYPE_CONFIGS.find((config) => config.id === id);
}

// Helper to get the default bilan template.
export function getDefaultBilanTemplate(): BalanceSheetTemplate {
  return DEFAULT_BILAN_TEMPLATE;
}