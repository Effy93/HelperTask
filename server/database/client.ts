import mysql from "mysql2/promise";
import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

// Get variables from .env file for database connection
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Create a connection pool to the database
const client = mysql.createPool({
  host: DB_HOST,
  port: Number.parseInt(DB_PORT as string),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },
});

export default client;

// Types export
type DatabaseClient = Pool;
type Result = ResultSetHeader;
type Rows = RowDataPacket[];

export type { DatabaseClient, Result, Rows };

// DEBUG DATABASE STARTUP
export async function printDatabaseInfo() {
const color = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
};
  try {
    await client.query<ResultSetHeader>("SELECT 1");
    console.log(`${color.green}🟢 MySQL connecté et opérationnel${color.reset}`);

    // DB Active
    const [dbRows] = await client.query<RowDataPacket[]>(
      "SELECT DATABASE() AS db"
    );
    const dbName = dbRows[0]?.db;
    console.log(
      `${color.yellow}📁 DB active : ${color.bold}${dbName}${color.reset}`
    );

    // DB User
    const [userRows] = await client.query<RowDataPacket[]>(
      "SELECT USER() AS user"
    );
    const dbUser = userRows[0]?.user;
    console.log(
      `${color.cyan} → 🌐 Utilisateur : ${color.bold}${dbUser}${color.reset}${color.blue}:${DB_PORT}${color.reset}`
    );

    // TABLES
    const [tables] = await client.query<RowDataPacket[]>("SHOW TABLES");
    const tableList = tables;

    console.log(
      `${color.cyan}📦 Tables disponibles (${tableList.length}) :${color.reset}`
    );

    console.table(tableList);

  } catch (err) {
    console.error(`${color.red}❌ Erreur connexion DB :${color.reset}`, err);
  }
}