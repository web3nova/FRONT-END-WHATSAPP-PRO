// Role hierarchy: owner > admin > member
const RANK = { owner: 3, admin: 2, member: 1 };

export const hasRole = (user, minRole) =>
  (RANK[user?.teamRole] ?? 3) >= (RANK[minRole] ?? 1);

export const isOwner = (user) => user?.teamRole === 'owner' || !user?.teamRole;
export const isAdmin = (user) => hasRole(user, 'admin');
export const isMember = (user) => hasRole(user, 'member');
