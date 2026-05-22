import type { TaskStatus } from "../../../server/src/types/ITask";

export const TASK_STATUSES: TaskStatus[] = ["todo", "doing", "done"];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "À faire",
  doing: "En cours",
  done: "Terminé",
};
