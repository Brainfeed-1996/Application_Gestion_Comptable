export interface Organization {
  id: string;
  name: string;
  description: string | null;
  business_type: string;
  is_active: boolean;
  is_default: boolean;
}