export type ProjectStatus = "todo" | "doing" | "done";

export interface IProject {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  position: number;
}
