import databaseClient from "../../database/client";
import type { Result, Rows } from "../../database/client";
import type { ITask } from "../types/ITask";

export class TaskRepository {
  async create(task: Omit<ITask, "id">) {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO task (title, content, status, position, deadline, project_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        task.title,
        task.content,
        task.status,
        task.position,
        task.deadline,
        task.project_id,
      ],
    );

    return result.insertId;
  }

  async readAll() {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM task ORDER BY position ASC",
    );
    return rows;
  }

  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM task WHERE id_task = ?",
      [id],
    );

    return rows[0] || null;
  }

  async update(id: number, task: Partial<Omit<ITask, "id">>) {
    const [result] = await databaseClient.query<Result>(
      `UPDATE task 
       SET title = ?, content = ?, status = ?, position = ?, deadline = ?, project_id = ?
       WHERE id_task = ?`,
      [
        task.title,
        task.content,
        task.status,
        task.position,
        task.deadline,
        task.project_id,
        id,
      ],
    );

    return result.affectedRows;
  }

  async delete(id: number) {
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM task WHERE id_task = ?",
      [id],
    );

    return result.affectedRows;
  }
}

export default new TaskRepository();
