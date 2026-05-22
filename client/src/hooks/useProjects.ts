import { useCallback, useEffect, useState } from "react";
import { fetchCollaborators } from "../services/collaboratorService";
import type { Collaborator } from "../services/collaboratorService";
import {
  type Project,
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
} from "../services/projectService";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectCollaborators, setProjectCollaborators] = useState<
    Record<number, Collaborator[]>
  >({});

  const refresh = useCallback(async () => {
    const list = await fetchProjects();
    setProjects(list);

    const results = await Promise.all(
      list.map(async (p) => {
        try {
          const collabs = await fetchCollaborators(p.id);
          return { id: p.id, collabs };
        } catch {
          return { id: p.id, collabs: [] as Collaborator[] };
        }
      }),
    );

    const map: Record<number, Collaborator[]> = {};
    for (const { id, collabs } of results) map[id] = collabs;
    setProjectCollaborators(map);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (title: string, description: string) => {
    await createProject(title, description);
    await refresh();
  };

  const update = async (id: number, title: string, description: string) => {
    await updateProject(id, title, description);
    await refresh();
  };

  const remove = async (id: number) => {
    await deleteProject(id);
    await refresh();
  };

  return { projects, projectCollaborators, refresh, create, update, remove };
}
