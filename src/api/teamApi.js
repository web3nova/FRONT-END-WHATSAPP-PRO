import api from './axios';

export const getTeamMembers = () => api.get('/team/members').then(r => r.data);

export const inviteMember = (email, role = 'member') =>
  api.post('/team/invites', { email, role }).then(r => r.data);

export const cancelInvite = (inviteId) =>
  api.delete(`/team/invites/${inviteId}`).then(r => r.data);

export const removeMember = (userId) =>
  api.delete(`/team/members/${userId}`).then(r => r.data);

export const acceptInvite = (token, name, password) =>
  api.post('/team/accept-invite', { token, name, password }).then(r => r.data);
