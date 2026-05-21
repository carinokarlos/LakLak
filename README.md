# Laklak Nightclub Booking SaaS

Philippines-focused nightclub booking SaaS.

Phase 1 sets up the Node.js backend, XAMPP MariaDB/MySQL schema, and seed data.

## Local Database With XAMPP

1. Open XAMPP Control Panel.
2. Start MySQL.
3. Open phpMyAdmin.
4. Import `database.sql` to create the `nightclub_booking` database and tables.
5. Import `seed.sql` to add 2 clubs, 10 tables, and role test users.
6. Copy `.env.example` to `.env` and adjust `DB_PASSWORD` if your MySQL password is not blank.

User roles are stored as:

```txt
super_admin
developer
staff_admin
club_admin
user
```

## API Setup

```powershell
cd C:\xampp\htdocs\Projects\laklak\api
npm.cmd install
npm.cmd run dev
```

PowerShell may block `npm.ps1`, so `npm.cmd` is the safer Windows command:

```powershell
npm.cmd run dev
```

If port `8000` is stuck:

```powershell
npm.cmd run stop
npm.cmd run dev
```

If you already imported the old schema, run this once to add the new roles and seed role test users:

```powershell
npm.cmd run migrate:roles
```

The UI and API will be available at `http://127.0.0.1:8000`.

Useful test routes:

- `GET /` - operations dashboard UI
- `GET /api` - API route index
- `POST /auth/dev-login` - local staff/admin login for Phase 1
- `GET /admin/analytics` - admin dashboard metrics
- `GET /admin/reservations` - latest reservations table
- `GET /admin/users` - local users and roles
- `GET /health`
- `GET /db/health`
- `GET /clubs`
- `GET /clubs/:clubId/tables`

The UI has two signed-in views:

- Admin Dashboard - operations metrics, inventory, latest reservations
- User View - user-style club and table browsing

Local dashboard login:

```txt
Email: admin@laklak.local
Password: not used during Phase 1
```

Other Phase 1 test users:

```txt
developer@laklak.local
staffadmin@laklak.local
clubadmin@laklak.local
user@laklak.local
```
