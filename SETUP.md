# GymSync — Setup Guide

## Prerequisites

Install these before running `setup.bat`:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| .NET SDK | 9.0 | https://dotnet.microsoft.com/download |
| SQL Server LocalDB | any | https://aka.ms/sqllocaldb |

> SQL Server LocalDB ships with Visual Studio. If you have VS installed, you likely already have it.
> To check: run `sqllocaldb info` in a terminal.

---

## Quick Start

Double-click `setup.bat` — it will:

1. Check Node.js, npm, and .NET are installed
2. Run `npm install` for the frontend
3. Run `dotnet restore` for the backend
4. Apply database migrations (creates the DB automatically)
5. Start both servers in separate terminal windows

**Frontend** → http://localhost:5173  
**Backend API** → http://localhost:5170  
**Swagger UI** → http://localhost:5170/swagger  

---

## Manual Start (after first setup)

If you've already run `setup.bat` once, you can start the servers manually:

**Terminal 1 — Backend:**
```
cd GymTracker.API
dotnet run --launch-profile http
```

**Terminal 2 — Frontend:**
```
cd FrontEnd/gymsync
npm run dev
```

---

## Configuration

The connection string is in `GymTracker.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(LocalDB)\\MSSQLLocalDB;Database=GymTrackerDb;Trusted_Connection=True;MultipleActiveResultSets=true"
}
```

If you're using a full SQL Server instance instead of LocalDB, replace with:
```json
"DefaultConnection": "Server=localhost;Database=GymTrackerDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
```

---

## Troubleshooting

**`sqllocaldb` not found** — Install SQL Server Express LocalDB from https://aka.ms/sqllocaldb

**Migration fails** — Make sure LocalDB is running: `sqllocaldb start MSSQLLocalDB`

**Port already in use** — Change the port in `GymTracker.API/Properties/launchSettings.json` and update `FrontEnd/gymsync/src/lib/api.ts` baseURL to match
