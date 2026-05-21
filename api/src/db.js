import mysql from "mysql2/promise";

import { config } from "./config.js";

export const pool = mysql.createPool(config.db);

export async function pingDatabase() {
  const [rows] = await pool.query("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
}
