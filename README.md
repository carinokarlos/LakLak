# Laklak Nightclub Booking SaaS

Philippines-focused nightclub table booking MVP for local XAMPP development.

Phase 1 includes:

- Node.js and Express API
- XAMPP MariaDB/MySQL schema and seed data
- React operations dashboard
- Local role-based test login
- Reservation creation, confirmation, cancellation, and manual check-in

## Tech Stack

- Backend: Node.js, Express, MySQL via `mysql2`
- Frontend: React, Vite
- Database: MariaDB/MySQL from XAMPP
- Local server: `http://127.0.0.1:8000`

## Project Structure

```txt
laklak/
  api/                 Node.js API server
    scripts/           Local helper scripts
    src/               API source code
  client/              React + Vite frontend
    public/            Static frontend assets
    src/               React source code
  docs/                Phase notes
  migrations/          Database migration SQL
  database.sql         Base database schema
  seed.sql             Local seed clubs, tables, and users
  .env.example         Root environment template
```

The old static UI in `api/public` was removed. The API now serves the built
React app from `client/dist` after running `npm.cmd run build` in `client`.

## Requirements

- XAMPP installed
- MySQL running in XAMPP
- Node.js installed
- PowerShell or Windows Terminal

PowerShell may block `npm.ps1`, so use `npm.cmd` in commands.

## Database Setup

1. Open XAMPP Control Panel.
2. Start MySQL.
3. Open phpMyAdmin.
4. Import `database.sql`.
5. Import `seed.sql`.
6. Copy `.env.example` to `.env`.
7. Adjust `DB_PASSWORD` in `.env` if your local MySQL root password is not blank.

Default local database settings:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=nightclub_booking
DB_USER=root
DB_PASSWORD=
PORT=8000
```

If you imported an older schema, run the role migration:

```powershell
cd C:\xampp\htdocs\Projects\laklak\api
npm.cmd run migrate:roles
```

## Run The App

Use this for normal local use. This needs only one running terminal after the
client is built.

```powershell
cd C:\xampp\htdocs\Projects\laklak\client
npm.cmd install
npm.cmd run build

cd C:\xampp\htdocs\Projects\laklak\api
npm.cmd install
npm.cmd run dev
```

Open:

```txt
http://127.0.0.1:8000
```

The API serves both the backend routes and the built React UI on port `8000`.

## Frontend Development

Use this only when editing React and you want Vite hot reload. This mode needs
two terminals.

Terminal 1:

```powershell
cd C:\xampp\htdocs\Projects\laklak\api
npm.cmd run dev
```

Terminal 2:

```powershell
cd C:\xampp\htdocs\Projects\laklak\client
npm.cmd run dev
```

Open:

```txt
http://127.0.0.1:5173
```

Vite proxies API calls to `http://127.0.0.1:8000`.

## Useful Scripts

Backend:

```powershell
cd C:\xampp\htdocs\Projects\laklak\api
npm.cmd run dev
npm.cmd run start
npm.cmd run stop
npm.cmd run migrate:roles
```

Frontend:

```powershell
cd C:\xampp\htdocs\Projects\laklak\client
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run preview
```

## Test Accounts

The Phase 1 login only checks email. Passwords are not used yet.

```txt
admin@laklak.local
developer@laklak.local
staffadmin@laklak.local
clubadmin@laklak.local
user@laklak.local
```

Dashboard access is allowed for:

```txt
super_admin
developer
staff_admin
club_admin
```

The `user` role exists for reservation/customer testing, but it cannot sign in
to the operations dashboard.

## UI Views

- Admin Dashboard: API/database status, analytics, club inventory, tables, users, and latest reservations
- User View: customer-style club and table browsing with reservation creation
- Check-in: manual QR hash admission for confirmed reservations

## MVP Booking Flow

```txt
User View reserve table
-> creates pending reservation
-> Admin Dashboard confirms reservation
-> API generates QR hash
-> Check-in verifies QR hash
-> reservation becomes attended
```

Rules:

- A table cannot have duplicate active bookings on the same date.
- Only pending reservations can be confirmed.
- Cancelled and attended reservations cannot be confirmed.
- Attended reservations cannot be cancelled.

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | React operations UI |
| `GET` | `/api` | API route index |
| `GET` | `/health` | API health check |
| `GET` | `/db/health` | Database health check |
| `POST` | `/auth/dev-login` | Local email-only dashboard login |
| `GET` | `/auth/dev-login` | Helper response explaining the route requires POST |
| `GET` | `/admin/analytics` | Dashboard metrics |
| `GET` | `/admin/reservations` | Latest reservations |
| `PATCH` | `/admin/reservations/:id/confirm` | Confirm pending reservation and generate QR hash |
| `PATCH` | `/admin/reservations/:id/cancel` | Cancel pending or confirmed reservation |
| `GET` | `/admin/users` | Local users and roles |
| `GET` | `/clubs` | Club list |
| `GET` | `/clubs/:clubId/tables` | Tables for one club |
| `POST` | `/reservations` | Create pending reservation |
| `POST` | `/checkin` | Mark confirmed QR hash as attended |

Example local login request:

```powershell
Invoke-RestMethod `
  -Method Post `
  -ContentType 'application/json' `
  -Body '{"email":"admin@laklak.local"}' `
  http://127.0.0.1:8000/auth/dev-login
```

## Troubleshooting

### Port 8000 Is Already In Use

```powershell
cd C:\xampp\htdocs\Projects\laklak\api
npm.cmd run stop
npm.cmd run dev
```

### Dashboard Says Database Error

Check these:

1. XAMPP MySQL is running.
2. `database.sql` and `seed.sql` were imported.
3. `.env` has the right database password.
4. `DB_NAME` is `nightclub_booking`.

### `/auth/dev-login` Shows An Error In The Browser

The login endpoint is a POST API route. Use the app login form at:

```txt
http://127.0.0.1:8000
```

Opening `/auth/dev-login` directly in the browser sends GET, so the server
returns a helper message instead of logging in.

### React Changes Do Not Show On Port 8000

Port `8000` serves the last built React files. Rebuild the client:

```powershell
cd C:\xampp\htdocs\Projects\laklak\client
npm.cmd run build
```

For live frontend changes, use Vite at `http://127.0.0.1:5173`.

## Development Notes

- `client/dist` is build output and is ignored by git.
- `node_modules` is ignored by git.
- Keep shared run instructions in this root README.
- Use `npm.cmd` instead of `npm` in PowerShell if script execution is blocked.
