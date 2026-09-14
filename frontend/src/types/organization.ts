export interface Organization {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  vatNumber?: string;
  siren?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  currency: string;
  industry?: string;
  logoUrl?: string;
  isActive: boolean;
  ownerId: string;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlan = "free" | "starter" | "pro" | "business" | "enterprise";

export interface OrganizationCreate {
  name: string;
  legalName?: string;
  vatNumber?: string;
  siren?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  currency?: string;
  industry?: string;
  subscriptionPlan?: SubscriptionPlan;
}
