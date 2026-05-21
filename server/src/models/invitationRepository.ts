import databaseClient from "../../database/client";
import type { Result, Rows } from "../../database/client";

export class InvitationRepository {
  async create(data: {
    token: string;
    projectId: number;
    inviterId: number;
    email: string;
    role: string;
    expiresAt: Date;
  }) {
    await databaseClient.query(
      `INSERT INTO invitation (token, project_id, inviter_id, email, role, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.token,
        data.projectId,
        data.inviterId,
        data.email,
        data.role,
        data.expiresAt,
      ],
    );
  }

  async findByToken(token: string) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT i.*, p.title AS project_title, u.name AS inviter_name
       FROM invitation i
       JOIN project p ON i.project_id = p.id_project
       JOIN user u ON i.inviter_id = u.id
       WHERE i.token = ?`,
      [token],
    );
    return rows[0] || null;
  }

  async findPendingByProjectAndEmail(projectId: number, email: string) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT * FROM invitation
       WHERE project_id = ? AND email = ? AND status = 'pending'`,
      [projectId, email],
    );
    return rows[0] || null;
  }

  async accept(token: string) {
    const [result] = await databaseClient.query<Result>(
      "UPDATE invitation SET status = 'accepted' WHERE token = ?",
      [token],
    );
    return result.affectedRows;
  }

  async expire(token: string) {
    const [result] = await databaseClient.query<Result>(
      "UPDATE invitation SET status = 'expired' WHERE token = ?",
      [token],
    );
    return result.affectedRows;
  }
}

export default new InvitationRepository();
