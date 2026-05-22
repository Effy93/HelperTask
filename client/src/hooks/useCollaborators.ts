import { useCallback, useEffect, useState } from "react";
import {
  type Collaborator,
  fetchCollaborators,
} from "../services/collaboratorService";

export function useCollaborators(projectId: number) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchCollaborators(projectId);
      setCollaborators(data);
    } catch {
      setCollaborators([]);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) refresh();
  }, [projectId, refresh]);

  return { collaborators, refresh };
}
