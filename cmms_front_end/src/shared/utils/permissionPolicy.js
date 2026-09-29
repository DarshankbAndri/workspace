const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'ADMIN']);

export const hasEffectivePermission = ({ roles = [], permissions = [], legacyRole } = {}, permissionCode) => {
  if (!permissionCode) return true;
  if (roles.some((role) => ADMIN_ROLES.has(role)) || legacyRole === 'ADMIN') return true;
  return permissions.includes(permissionCode);
};

export const hasAnyEffectivePermission = (access, permissionCodes = []) => (
  permissionCodes.length === 0
  || permissionCodes.some((permissionCode) => hasEffectivePermission(access, permissionCode))
);
