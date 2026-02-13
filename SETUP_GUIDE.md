# Cortex - Complete Setup Guide

## Prerequisites Installation

### 1. Install PostgreSQL (Windows)

**Download and Install:**
1. Download PostgreSQL 15 from: https://www.postgresql.org/download/windows/
2. Run the installer
3. **IMPORTANT SETTINGS:**
   - Port: `5432` (default)
   - Password: Choose a password (e.g., `postgres123`)
   - Remember this password!
4. Install pgAdmin (included with installer)
5. Complete installation

**Verify Installation:**
```powershell
# Open PowerShell and run:
psql --version
# Should show: psql (PostgreSQL) 15.x
```

**Create Database:**
```powershell
# Option 1: Using psql command line
psql -U postgres
# Enter password when prompted
# Then run:
CREATE DATABASE cortex;
\q

# Option 2: Using pgAdmin GUI
# Open pgAdmin → Right-click Databases → Create → Database
# Name: cortex
```

### 2. Install Node.js
- Download from: https://nodejs.org/ (LTS version)
- Verify: `node --version` and `npm --version`

---

## Project Setup

### Step 1: Install Dependencies

```powershell
# Navigate to project root
cd C:\Users\Daksh\.gemini\antigravity\scratch\DevSentinel

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..\frontend
npm install

# Install simulator dependencies
cd ..\scripts
npm init -y
npm install axios

cd ..
```

### Step 2: Configure Environment Variables

**Backend (.env):**
Create/update `backend\.env`:
```env
PORT=5001
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/cortex?schema=public"
JWT_SECRET="cortex_jwt_secret_change_in_production"
JWT_REFRESH_SECRET="cortex_refresh_secret_change_in_production"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

**IMPORTANT:** Replace `postgres123` with YOUR PostgreSQL password!

### Step 3: Initialize Database

```powershell
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Seed initial data
npx prisma db seed
```

### Step 4: Start Services

**Terminal 1 - Backend:**
```powershell
cd C:\Users\Daksh\.gemini\antigravity\scratch\DevSentinel\backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\Daksh\.gemini\antigravity\scratch\DevSentinel\frontend
npm run dev
```

**Terminal 3 - Simulator (Optional):**
```powershell
cd C:\Users\Daksh\.gemini\antigravity\scratch\DevSentinel\scripts
node simulator.js
```

---

## Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/health

## Default Login Credentials

```
Email: admin@cortex.com
Password: Admin123!
```

---

## Troubleshooting

### Database Connection Failed
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# If not running, start it:
Start-Service postgresql-x64-15  # Or your version
```

### Port Already in Use
```powershell
# Find process using port 5001
netstat -ano | findstr :5001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Prisma Errors
```powershell
# Reset database (WARNING: Deletes all data)
cd backend
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

---

## XAMPP Deployment (Optional)

```powershell
cd C:\Users\Daksh\.gemini\antigravity\scratch\DevSentinel\scripts
.\deploy_xampp.ps1
```

Access at: http://localhost/cortex/

**Note:** Backend must still run separately!
