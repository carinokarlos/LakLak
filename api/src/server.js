import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "./config.js";
import { pingDatabase, pool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const USER_ROLES = ["super_admin", "developer", "staff_admin", "club_admin", "user"];
const DASHBOARD_ROLES = ["super_admin", "developer", "staff_admin", "club_admin"];
const ROLE_LABELS = {
  super_admin: "Superadmin",
  developer: "Developer",
  staff_admin: "Staff Admin",
  club_admin: "Club Admin",
  user: "User",
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "../public")));

app.get("/api", (_req, res) => {
  res.json({
    name: config.appName,
    status: "running",
    routes: {
      login: "/auth/dev-login",
      health: "/health",
      databaseHealth: "/db/health",
      adminAnalytics: "/admin/analytics",
      adminReservations: "/admin/reservations",
      adminUsers: "/admin/users",
      clubs: "/clubs",
      clubTables: "/clubs/:clubId/tables",
    },
    roles: USER_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] })),
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", environment: config.appEnv });
});

app.get("/db/health", async (_req, res, next) => {
  try {
    await pingDatabase();
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/dev-login", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const [users] = await pool.query(
      `SELECT id, firebase_uid, name, email, role, club_id, created_at
       FROM users
       WHERE LOWER(email) = ?
       LIMIT 1`,
      [email]
    );

    const user = users[0];

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    if (!DASHBOARD_ROLES.includes(user.role)) {
      res.status(403).json({ error: "Dashboard access requires admin or developer role" });
      return;
    }

    res.json({ user: { ...user, role_label: ROLE_LABELS[user.role] || user.role } });
  } catch (error) {
    next(error);
  }
});

app.get("/admin/analytics", async (_req, res, next) => {
  try {
    const [[clubStats], [reservationStats], [userStats]] = await Promise.all([
      pool.query(
        `SELECT
          (SELECT COUNT(*) FROM clubs) AS clubs,
          (SELECT COUNT(*) FROM tables) AS tables,
          (SELECT COUNT(*) FROM tables WHERE is_active = TRUE) AS active_tables`
      ),
      pool.query(
        `SELECT
          COUNT(*) AS total,
          SUM(status = 'pending') AS pending,
          SUM(status = 'confirmed') AS confirmed,
          SUM(status = 'attended') AS attended,
          SUM(status = 'cancelled') AS cancelled
        FROM reservations`
      ),
      pool.query(
        `SELECT
          COUNT(*) AS total,
          SUM(role = 'super_admin') AS super_admins,
          SUM(role = 'developer') AS developers,
          SUM(role = 'staff_admin') AS staff_admins,
          SUM(role = 'club_admin') AS club_admins,
          SUM(role = 'user') AS users,
          SUM(role IN ('super_admin', 'developer', 'staff_admin', 'club_admin')) AS operators
        FROM users`
      ),
    ]);

    res.json({
      clubs: Number(clubStats[0]?.clubs || 0),
      tables: Number(clubStats[0]?.tables || 0),
      activeTables: Number(clubStats[0]?.active_tables || 0),
      reservations: {
        total: Number(reservationStats[0]?.total || 0),
        pending: Number(reservationStats[0]?.pending || 0),
        confirmed: Number(reservationStats[0]?.confirmed || 0),
        attended: Number(reservationStats[0]?.attended || 0),
        cancelled: Number(reservationStats[0]?.cancelled || 0),
      },
      users: {
        total: Number(userStats[0]?.total || 0),
        operators: Number(userStats[0]?.operators || 0),
        roles: {
          superAdmins: Number(userStats[0]?.super_admins || 0),
          developers: Number(userStats[0]?.developers || 0),
          staffAdmins: Number(userStats[0]?.staff_admins || 0),
          clubAdmins: Number(userStats[0]?.club_admins || 0),
          users: Number(userStats[0]?.users || 0),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/admin/users", async (_req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT
        users.id,
        users.name,
        users.email,
        users.role,
        users.club_id,
        users.created_at,
        clubs.name AS club_name
      FROM users
      LEFT JOIN clubs ON clubs.id = users.club_id
      ORDER BY FIELD(users.role, 'super_admin', 'developer', 'staff_admin', 'club_admin', 'user'),
        users.name`
    );

    res.json(
      users.map((user) => ({
        ...user,
        role_label: ROLE_LABELS[user.role] || user.role,
      }))
    );
  } catch (error) {
    next(error);
  }
});

app.get("/admin/reservations", async (_req, res, next) => {
  try {
    const [reservations] = await pool.query(
      `SELECT
        reservations.id,
        reservations.booking_date,
        reservations.status,
        reservations.expires_at,
        reservations.created_at,
        users.name AS customer_name,
        users.email AS customer_email,
        tables.label AS table_label,
        clubs.name AS club_name
      FROM reservations
      INNER JOIN users ON users.id = reservations.user_id
      INNER JOIN tables ON tables.id = reservations.table_id
      INNER JOIN clubs ON clubs.id = tables.club_id
      ORDER BY reservations.created_at DESC
      LIMIT 25`
    );

    res.json(reservations);
  } catch (error) {
    next(error);
  }
});

app.get("/clubs", async (_req, res, next) => {
  try {
    const [clubs] = await pool.query(
      `SELECT id, name, location, description, cover_image_url, created_at
       FROM clubs
       ORDER BY name`
    );

    res.json(clubs);
  } catch (error) {
    next(error);
  }
});

app.get("/clubs/:clubId/tables", async (req, res, next) => {
  try {
    const [tables] = await pool.query(
      `SELECT id, club_id, label, capacity, min_consumable, is_active
       FROM tables
       WHERE club_id = ?
       ORDER BY label`,
      [req.params.clubId]
    );

    res.json(tables);
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    error: "Internal server error",
    message: config.appEnv === "local" ? error.message : undefined,
  });
});

const server = app.listen(config.port);

server.on("listening", () => {
  console.log(`${config.appName} running on http://127.0.0.1:${config.port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${config.port} is already in use.`);
    console.error("Run npm.cmd run stop, then npm.cmd run dev.");
    process.exit(1);
  }

  throw error;
});
