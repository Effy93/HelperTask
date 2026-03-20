import databaseClient from "../../database/client";
import type { Result, Rows } from "../../database/client";
import type { IProject } from "../types/IProject";

export class ProjectRepository {
  async create(project: Omit<IProject, "id">, userId: number) {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO project (title, description, status, position) VALUES (?, ?, ?, ?)",
      [project.title, project.description, project.status, project.position],
    );

    const projectId = result.insertId;

    await databaseClient.query(
      "INSERT INTO project_user (project_id, user_id, role) VALUES (?, ?, 'product_owner')",
      [projectId, userId],
    );

    return projectId;
  }
  async readAll() {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM project ORDER BY position ASC",
    );
    return rows;
  }

  async readAllByUser(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT p.*
       FROM project p
       JOIN project_user pu ON p.id_project = pu.project_id
       WHERE pu.user_id = ?
       ORDER BY p.position ASC`,
      [userId],
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
