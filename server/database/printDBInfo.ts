import type { RowDataPacket } from "mysql2/promise";
import client from "./client";

const DB_CONFIG = {
  previewLimit: 5,
};

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

const icon = {
  user: "👤",
  relation: "🔗",
  default: "📦",
};

const getIcon = (table: string) => {
  if (table === "user") return icon.user;
  if (table.includes("_")) return icon.relation;
  return icon.default;
};

const queryPreview = async (table: string, limit = DB_CONFIG.previewLimit) => {
  try {
    const [rows] = await client.query<RowDataPacket[]>(
      `SELECT * FROM \`${table}\` LIMIT ${limit}`,
    );
    return rows;
  } catch {
    return [];
  }
};

export async function printDBInfo() {
  try {
    await client.query("SELECT 1");

    console.log(`${color.green}🟢 MySQL connecté${color.reset}`);

    // =========================
    // 📁 DB NAME
    // =========================

    const [dbRows] = await client.query<RowDataPacket[]>(
      "SELECT DATABASE() AS db",
    );

    console.log(
      `${color.yellow}📁 DB : ${color.bold}${dbRows[0]?.db}${color.reset}`,
    );

    // =========================
    // 👤 USER + HOST + PORT
    // =========================

    const [userRows] = await client.query<RowDataPacket[]>(
      "SELECT USER() AS user",
    );

    const [portRows] = await client.query<RowDataPacket[]>(
      "SHOW VARIABLES LIKE 'port'",
    );

    const rawUser = userRows[0]?.user ?? "";
    const port = portRows[0]?.Value ?? "";

    const [user, host] = rawUser.split("@");

    console.log(
      `${color.purple}👤 ${user}${color.reset}@${color.cyan}${host}${color.reset}:${color.green}${port}${color.reset}`,
    );

    // =========================
    // 📦 AUTO TABLE DETECTION
    // =========================

    const [tablesRows] = await client.query<RowDataPacket[]>("SHOW TABLES");

    const tables = tablesRows.map((row) => Object.values(row)[0] as string);

    console.log(
      `\n${color.cyan}📦 Tables détectées (${tables.length})${color.reset}`,
    );

    // =========================
    // 🔥 DISPLAY TABLES
    // =========================

    for (const table of tables) {
      const rows = await queryPreview(table);

      const tableIcon = getIcon(table);

      const isRelation = table.includes("_");

      const labelColor =
        table === "user" ? color.blue : isRelation ? color.purple : color.blue;

      console.log(`${labelColor}${tableIcon} ${table}${color.reset}`);

      if (rows.length) {
        console.table(rows);
      } else {
        console.log(`${color.yellow}  (empty)${color.reset}`);
      }
    }
  } catch (err) {
    console.error(`${color.red}❌ DB error${color.reset}`, err);
  }
}
