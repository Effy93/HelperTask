import { useCallback, useEffect, useState } from "react";
import type { ITask, TaskStatus } from "../../../server/src/types/ITask";
import type { Assignee } from "../services/taskService";
import {
  assignUser,
  createTask,
  deleteTask,
  fetchAssignees,
  fetchTasks,
  reorderTasks,
  unassignUser,
  updateTask,
} from "../services/taskService";

export function useTasks(projectId: number) {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [taskAssignees, setTaskAssignees] = useState<
    Record<number, Assignee[]>
  >({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await fetchTasks(projectId);
      setTasks(loaded);

      const results = await Promise.all(
        loaded.map(async (task) => {
          try {
            const assignees = await fetchAssignees(task.id);
            return { taskId: task.id, assignees };
          } catch {
            return { taskId: task.id, assignees: [] as Assignee[] };
          }
        }),
      );

      const map: Record<number, Assignee[]> = {};
      for (const { taskId, assignees } of results) map[taskId] = assignees;
      setTaskAssignees(map);
    } catch {
      setTasks([]);
      setTaskAssignees({});
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) refresh();
  }, [projectId, refresh]);

  const create = async (payload: Omit<ITask, "id">, assigneeIds: number[]) => {
    const created = await createTask(payload);
    if (assigneeIds.length > 0) {
      await Promise.all(assigneeIds.map((uid) => assignUser(created.id, uid)));
    }
    await refresh();
  };

  const update = async (
    task: ITask,
    updates: Partial<Omit<ITask, "id">>,
    newAssigneeIds: number[],
  ) => {
    await updateTask(task.id, { ...updates });

    const original = (taskAssignees[task.id] ?? []).map((a) => a.id);
    const toAdd = newAssigneeIds.filter((id) => !original.includes(id));
    const toRemove = original.filter((id) => !newAssigneeIds.includes(id));

    await Promise.all([
      ...toAdd.map((uid) => assignUser(task.id, uid)),
      ...toRemove.map((uid) => unassignUser(task.id, uid)),
    ]);

    await refresh();
  };

  const remove = async (id: number) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const reorder = async (
    updates: Array<{ id: number; status: TaskStatus; position: number }>,
  ) => {
    if (updates.length === 0) return;

    setTasks((prev) => {
      const next = [...prev];
      for (const u of updates) {
        const idx = next.findIndex((t) => t.id === u.id);
        if (idx !== -1) {
          next[idx] = { ...next[idx], status: u.status, position: u.position };
        }
      }
      return next;
    });

    try {
      await reorderTasks(updates);
    } catch {
      await refresh();
    }
  };

  return {
    tasks,
    taskAssignees,
    loading,
    refresh,
    create,
    update,
    remove,
    reorder,
  };
}
