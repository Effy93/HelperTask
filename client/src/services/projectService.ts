import { apiFetch } from "./api";

export type ApiProject = {
  id_project: number;
  title: string;
  description: string;
  user_role: string;
};

export type Project = {
  id: number;
  title: string;
  description: string;
  userRole: string;
};

const normalize = (p: ApiProject): Project => ({
  id: p.id_project,
  title: p.title,
  description: p.description,
  userRole: p.user_role,
});

export const fetchProjects = async (): Promise<Project[]> => {
  const data = await apiFetch<ApiProject[]>("/api/projects");
  return Array.isArray(data) ? data.map(normalize) : [];
};

export const fetchProject = (id: number): Promise<ApiProject> =>
  apiFetch(`/api/projects/${id}`);

export const createProject = (
  title: string,
  description: string,
): Promise<void> =>
  apiFetch("/api/projects", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });

export const updateProject = (
  id: number,
  title: string,
  description: string,
): Promise<void> =>
  apiFetch(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, description }),
  });

export const deleteProject = (id: number): Promise<void> =>
  apiFetch(`/api/projects/${id}`, { method: "DELETE" });
