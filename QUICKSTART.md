# 🚀 Cortex - QUICK START GUIDE

## ⚡ 3-Minute Setup

### Step 1: Install PostgreSQL
1. Download: https://www.postgresql.org/download/windows/
2. During install, set password to: `postgres123`
3. After install, create database:
   ```powershell
   psql -U postgres
   # Enter password: postgres123
   CREATE DATABASE devsentinel;
   \q
   ```

### Step 2: Install Dependencies
```powershell
cd C:\Users\Daksh\.gemini\antigravity\scratch\DevSentinel

# Backend
cd backend
npm install

# Frontend  
cd ..\frontend
npm install

# Simulator
cd ..\scripts
npm install
```

### Step 3: Setup Database
```powershell
cd C:\Users\Daksh\.gemini\antigravity\scratch\DevSentinel\backend

npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### Step 4: Start Everything (The Fast Way) 🚀

Open a **single** terminal in the root folder and run:

```powershell
# Option A: PowerShell (Recommended for Windows)
.\RUN.ps1

# Option B: NPM
npm run dev
```

This will automatically launch:
- **Backend API** (Port 5001)
- **Frontend Dashboard** (Port 5173)
- **Agent Simulator** (Generating traffic)

All logs will appear in the same window, color-coded for each service!

### Step 5: Login & Test
1. Open: **http://localhost:5173**
2. Login:
   - Email: `admin@devsentinel.com`
   - Password: `Admin123!`
3. Dashboard should load with real-time data!

---

## 🔧 If Something Breaks

### Database Won't Connect
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# If stopped:
Start-Service postgresql-x64-15

# Verify password in backend\.env matches what you set during install
```

### Port Already in Use
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Module not found" errors
```powershell
# Clean install
cd backend
rm -rf node_modules
npm install
npx prisma generate
```

---

## ✅ Success Checklist

You're good to go when:
- [x] Backend shows "Database connected successfully"
- [x] Frontend loads at http://localhost:5173
- [x] Can login with admin@devsentinel.com
- [x] Dashboard shows stats
- [x] Simulator sends events successfully
- [x] Dashboard updates in real-time

**That's it! Your DevSentinel platform is now running! 🎉**

For detailed docs, see:
- `SETUP_GUIDE.md` - Full installation guide
- `SYSTEM_HEALTH_CHECKLIST.md` - Troubleshooting
- `README.md` - Complete documentation
