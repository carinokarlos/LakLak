import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

import { config } from "../src/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationPath = path.resolve(__dirname, "../../migrations/20260521_add_user_roles.sql");
const sql = await fs.readFile(migrationPath, "utf8");

const connection = await mysql.createConnection({
  ...config.db,
  multipleStatements: true,
});

try {
  await connection.query(sql);
  console.log("Applied user role migration.");
} finally {
  await connection.end();
}
