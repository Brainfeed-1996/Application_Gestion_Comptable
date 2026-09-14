export type Resource = 'transactions' | 'invoices' | 'clients' | 'accounts' | 'reports' | 'settings' | 'users';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'export';

export type Permission = `${Resource}:${Action}`;

export const PERMISSION_MATRIX: Record<string, Action[]> = {
  admin: ['create', 'read', 'update', 'delete', 'export'],
  accountant: ['create', 'read', 'update', 'export'],
  viewer: ['read'],
  invoicing: ['create', 'read', 'update'],
};

export function hasPermission(
  userPermissions: string[],
  resource: Resource,
  action: Action,
): boolean {
  const required: Permission = `${resource}:${action}`;
  return userPermissions.includes(required) || userPermissions.includes('*');
}

export function getPermissionsForRole(role: string): string[] {
  const actions = PERMISSION_MATRIX[role] || PERMISSION_MATRIX.viewer;
  const resources: Resource[] = ['transactions', 'invoices', 'clients', 'accounts', 'reports', 'settings', 'users'];
  return resources.flatMap((r) => actions.map((a) => `${r}:${a}`));
}
