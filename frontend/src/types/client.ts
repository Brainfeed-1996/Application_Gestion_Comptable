export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  siren?: string;
  naf?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortalData {
  clientId: string;
  clientName: string;
  portalUrl: string;
  token: string;
  expiresAt: string;
}
