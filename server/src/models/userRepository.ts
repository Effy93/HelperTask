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
      "UPDATE user SET name =?, email =?, password =? WHERE id =? ",
      [user.name, user.email, user.password, id],
    );
    return result;
  }

  // getbymail
  async getByEmail(email: string) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM user WHERE email = ?",
      [email],
    );
    return rows as IUser[];
  }
  async getById(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM user WHERE id = ?",
      [id],
    );
    return rows as IUser[];
  }

  async delete(id: number) {
    // mysql retourne un "tuple" = tableau avec plusieurs élèments strictement définis
    //  [result, fields] où
    // - result =  objet qui contient les propriétés affectedRows, insertId ...
    // - et fields = tableau d'objets décrivant les colonnes de la requête
    const [result] = await databaseClient.query<Result>(
      "DELETE from user WHERE id = ?",
      [id],
    );
    // renvoi UNIQUEMENT la propriété de l'élèment result
    return result.affectedRows;
  }
}

export default new UserRepository();
