import type { ITask, TaskStatus } from "../../../server/src/types/ITask";
import { apiFetch } from "./api";

export type Assignee = { id: number; name: string; email: string };

type TaskOrder = { id: number; status: TaskStatus; position: number };

export const fetchTasks = async (projectId: number): Promise<ITask[]> => {
  const data = await apiFetch<unknown[]>(`/api/tasks?project_id=${projectId}`);
  return Array.isArray(data) ? data.map(normalizeTask) : [];
};

export const createTask = (payload: {
  title: string;
  content: string;
  status: TaskStatus;
  position: number;
  deadline: string | null;
  project_id: number;
}): Promise<{ id: number }> =>
  apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(payload) });

export const updateTask = (
  id: number,
  payload: Partial<Omit<ITask, "id">>,
): Promise<void> =>
  apiFetch(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteTask = (id: number): Promise<void> =>
  apiFetch(`/api/tasks/${id}`, { method: "DELETE" });

export const reorderTasks = (tasks: TaskOrder[]): Promise<void> =>
  apiFetch("/api/tasks/order", {
    method: "PUT",
    body: JSON.stringify({ tasks }),
  });

export const fetchAssignees = async (taskId: number): Promise<Assignee[]> => {
  const data = await apiFetch<Assignee[]>(`/api/tasks/${taskId}/assignees`);
  return Array.isArray(data) ? data : [];
};

export const assignUser = (taskId: number, userId: number): Promise<void> =>
  apiFetch(`/api/tasks/${taskId}/assignees`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });

export const unassignUser = (taskId: number, userId: number): Promise<void> =>
  apiFetch(`/api/tasks/${taskId}/assignees/${userId}`, { method: "DELETE" });

const normalizeTask = (raw: unknown): ITask => {
  const t = raw as Record<string, unknown>;
  return {
    id: typeof t.id === "number" ? t.id : Number(t.id_task ?? t.id),
    title: String(t.title ?? ""),
    content: String(t.content ?? ""),
    status: (t.status as TaskStatus) ?? "todo",
    position: Number(t.position ?? 0),
    deadline: t.deadline ? String(t.deadline) : null,
    project_id: Number(t.project_id ?? t.projectId ?? 0),
  };
};
