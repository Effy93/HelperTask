export type ProjectStatus = "todo" | "in_progress" | "done";

export interface IProject {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  position: number;
}
