import { apiFetch } from "./api";

export type Collaborator = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export const fetchCollaborators = (
  projectId: number,
): Promise<Collaborator[]> =>
  apiFetch(`/api/projects/${projectId}/collaborators`);

export const addCollaborator = (
  projectId: number,
  email: string,
): Promise<void> =>
  apiFetch(`/api/projects/${projectId}/collaborators`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const updateCollaboratorRole = (
  projectId: number,
  userId: number,
  role: string,
): Promise<void> =>
  apiFetch(`/api/projects/${projectId}/collaborators/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });

export const removeCollaborator = (
  projectId: number,
  userId: number,
): Promise<void> =>
  apiFetch(`/api/projects/${projectId}/collaborators/${userId}`, {
    method: "DELETE",
  });

export const sendInvitation = (
  projectId: number,
  email: string,
): Promise<void> =>
  apiFetch(`/api/projects/${projectId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
