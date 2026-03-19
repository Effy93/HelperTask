export type TaskStatus = "todo" | "doing" | "done";

export interface ITask {
  id: number;
  title: string;
  content: string;
  status: TaskStatus;
  position: number;
  deadline: string | null; // DATETIME → string côté JS
  project_id: number;
}
