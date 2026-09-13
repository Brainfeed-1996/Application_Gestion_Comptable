export interface Organization {
  id: string;
  name: string;
  siret: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  currency: string;
  logoUrl?: string;
  vatNumber: string;
}
