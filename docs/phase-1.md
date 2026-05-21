# Phase 1 - Database & Node API

## Completed Scope

- Node.js API project structure under `/api`
- Browser UI served from `/api/public`
- Express server with local test routes
- Local dev login route for staff/admin testing
- Admin dashboard view with analytics and reservation table
- User role set: super_admin, developer, staff_admin, club_admin, user
- User view with club and table browsing
- XAMPP MariaDB/MySQL schema in `database.sql`
- Seed data in `seed.sql`
- Tables for users, clubs, tables, reservations, and payments
- Foreign keys and indexes for the MVP booking flow

## XAMPP Database

Create this database in phpMyAdmin:

```sql
CREATE DATABASE nightclub_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Default local connection:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=nightclub_booking
DB_USER=root
DB_PASSWORD=
```

## Verify In phpMyAdmin

After importing `database.sql` and `seed.sql`:

- `users` has role test accounts
- `clubs` has 2 clubs
- `tables` has 10 tables
- `reservations` and `payments` are empty

## Run API

```powershell
cd C:\xampp\htdocs\Projects\laklak\api
npm.cmd install
npm.cmd run dev
```

Open `http://127.0.0.1:8000` to see the dashboard UI.

API checks:

- `http://127.0.0.1:8000/api`
- `http://127.0.0.1:8000/admin/analytics`
- `http://127.0.0.1:8000/admin/reservations`
- `http://127.0.0.1:8000/admin/users`
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/db/health`
- `http://127.0.0.1:8000/clubs`

Local dashboard login:

- Email: `admin@laklak.local`
- Password: not used in Phase 1 because Firebase Auth is planned for Phase 2

Additional role test emails:

- `developer@laklak.local`
- `staffadmin@laklak.local`
- `clubadmin@laklak.local`
- `user@laklak.local`
