import databaseClient from "../../database/client";
import type { Result, Rows } from "../../database/client";
import type { IUser } from "../types/IUser";

class UserRepository {
  async create(user: Omit<IUser, "id">) {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO user (name, email, password) VALUES (?,?,?)",
      [user.name, user.email, user.password],
    );
    return result.insertId;
  }

  async readAll() {
    const [rows] = await databaseClient.query<Rows>("SELECT * FROM user");
    return rows;
  }

  async update(id: number, user: Partial<Omit<IUser, "id">>) {
    const result = await databaseClient.query<Rows>(
      "UPDATE user SET name =?, email =?, password =?, WHERE id =? ",
      [user.name, user.email, user.password, id],
    );
    return result;
  }

  // getbymail
  async getByEmail(email: string) {
    const [rows] = await databaseClient.query<Rows & IUser[]>(
      "SELECT * FROM user WHERE email = ?",
      [email],
    );
    return rows;
  }

  async delete(id: number) {
    const result = await databaseClient.query<Result>(
      "DELETE from user WHERE id = ?",
      [id],
    );
    return result;
  }
}

export default new UserRepository();
