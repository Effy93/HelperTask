import databaseClient from "../../database/client";
import type { Result, Rows } from "../../database/client";
import type { IProject } from "../types/IProject";

export class ProjectRepository {
  async create(project: Omit<IProject, "id">) {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO project (title, description, status, position) VALUES (?, ?, ?, ?)",
      [project.title, project.description, project.status, project.position],
    );

    return result.insertId;
  }

  async readAll() {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM project ORDER BY position ASC",
    );
    return rows;
  }

  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM project WHERE id_project = ?",
      [id],
    );

    return rows[0] || null;
  }

  async update(id: number, project: Partial<Omit<IProject, "id">>) {
    const [result] = await databaseClient.query<Result>(
      "UPDATE project SET title = ?, description = ?, status = ?, position = ? WHERE id_project = ?",
      [
        project.title,
        project.description,
        project.status,
        project.position,
        id,
      ],
    );

    return result.affectedRows;
  }

  async delete(id: number) {
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM project WHERE id_project = ?",
      [id],
    );

    return result.affectedRows;
  }
}

export default new ProjectRepository();
