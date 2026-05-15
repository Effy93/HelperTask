import type { RowDataPacket } from "mysql2/promise";
import client from "./client";

export async function printDBInfo() {
  const color = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    purple: "\x1b[35m",
    bold: "\x1b[1m",
  };

  try {
    await client.query("SELECT 1");

    console.log(
      `${color.green}🟢 MySQL connecté et opérationnel${color.reset}`,
    );

    // DB ACTIVE
    const [dbRows] = await client.query<RowDataPacket[]>(
      "SELECT DATABASE() AS db",
    );
    const dbName = dbRows[0]?.db;

    console.log(
      `${color.yellow}📁 DB_NAME : ${color.bold}${dbName}${color.reset}`,
    );

    // USER
    const [userRows] = await client.query<RowDataPacket[]>(
      "SELECT USER() AS user",
    );
    const dbUser = userRows[0]?.user;

    // PORT (SQL version)
    const [portRows] = await client.query<RowDataPacket[]>(
      "SHOW VARIABLES LIKE 'port'",
    );
    const dbPort = portRows[0]?.Value;

    console.log(
      `${color.cyan}→ 🌐 DB_USER : ${color.bold}${color.purple}${dbUser}${color.reset}:${color.green}${dbPort}${color.reset}`,
    );

    // TABLES
    const [tables] = await client.query<RowDataPacket[]>("SHOW TABLES");
    const tableList = tables;

    console.log(
      `${color.cyan}📦 Tables disponibles (${tableList.length}) :${color.reset}`,
    );

    console.table(tableList);
  } catch (err) {
    console.error(`${color.red}❌ Erreur connexion DB :${color.reset}`, err);
  }
}
