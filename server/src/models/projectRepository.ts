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
      `SELECT p.*, pu.role AS user_role
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

  // COALESCE : si un champ n'est pas envoyé (NULL), on conserve la valeur existante en base.
  // => si aucune valeur envoyé par le front = prends l'ancienne valeur
  // (controller doit protégé des valeurs vide ou null)
  async update(id: number, project: Partial<Omit<IProject, "id">>) {
    const [result] = await databaseClient.query<Result>(
      `
      UPDATE project
      SET
        title = COALESCE(?, title),
        description = COALESCE(?, description)
      WHERE id_project = ?
      `,
      [project.title, project.description, id],
    );

    return result.affectedRows;
  }
  // async update(id: number, project: Partial<Omit<IProject, "id">>) {
  //   const [result] = await databaseClient.query<Result>(
  //     "UPDATE project SET title = ?, description = ? WHERE id_project = ?",
  //     [project.title, project.description, id],
  //   );

  //   return result.affectedRows;
  // }

  async getCollaborators(projectId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT u.id, u.name, u.email, pu.role
       FROM user u
       JOIN project_user pu ON u.id = pu.user_id
       WHERE pu.project_id = ?`,
      [projectId],
    );
    return rows;
  }

  async addCollaborator(
    projectId: number,
    userId: number,
    role = "collaborator",
  ) {
    await databaseClient.query(
      "INSERT IGNORE INTO project_user (project_id, user_id, role) VALUES (?, ?, ?)",
      [projectId, userId, role],
    );
  }

  async updateCollaboratorRole(
    projectId: number,
    userId: number,
    role: string,
  ) {
    const [result] = await databaseClient.query<Result>(
      "UPDATE project_user SET role = ? WHERE project_id = ? AND user_id = ?",
      [role, projectId, userId],
    );
    return result.affectedRows;
  }

  async removeCollaborator(projectId: number, userId: number) {
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM project_user WHERE project_id = ? AND user_id = ? AND role != 'product_owner'",
      [projectId, userId],
    );
    return result.affectedRows;
  }

  async isOwner(projectId: number, userId: number): Promise<boolean> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT 1 FROM project_user WHERE project_id = ? AND user_id = ? AND role = 'product_owner'",
      [projectId, userId],
    );
    return rows.length > 0;
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
