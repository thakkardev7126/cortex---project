# Cortex - System Health Checklist

## Pre-Flight Checks

### 1. PostgreSQL
- [ ] PostgreSQL installed
- [ ] Service running: `Get-Service postgresql*`
- [ ] Database created: `cortex`
- [ ] Can connect: `psql -U postgres -d cortex`

### 2. Environment Configuration
- [ ] `backend/.env` exists
- [ ] `DATABASE_URL` matches your PostgreSQL password
- [ ] `JWT_SECRET` is set
- [ ] Port 5001 is free

### 3. Dependencies Installed
```powershell
# Backend
cd backend
npm install
npx prisma generate

# Frontend
cd ..\frontend
npm install

# Simulator
cd ..\scripts
npm install
```

### 4. Database Migration
```powershell
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

## Runtime Health Checks

### Backend Health
```powershell
# Terminal 1
cd C:\Users\Daksh\.gemini\antigravity\scratch\DevSentinel\backend
npm run dev
```

**Expected Output:**
```
✅ Database connected successfully
🚀 Cortex Backend is running!
🌐 Server: http://localhost:5001
```

**Test:**
```powershell
curl http://localhost:5001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Frontend Health
```powershell
# Terminal 2
cd C:\Users\Daksh\.gemini\antigravity\scratch\DevSentinel\frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

**Test:**
- Open http://localhost:5173
- Should see Cortex login page
- No console errors

### Authentication Test
1. Go to http://localhost:5173
2. Enter:
   - Email: `admin@cortex.com`
   - Password: `Admin123!`
3. Click "Sign In"
4. Should redirect to Dashboard
5. Check browser DevTools Network tab
   - POST to `/api/auth/login` should return 200
   - Response should contain `accessToken`

### Dashboard Data Test
1. After login, should see:
   - Active Alerts count
   - Events count
   - Monitored Agents count
2. Check Network tab:
   - GET to `/api/dashboard/stats` should return 200
   - Should see `totalEvents`, `activeAlerts`, etc.

### Simulator Test
```powershell
# Terminal 3
cd C:\Users\Daksh\.gemini\antigravity\scratch\DevSentinel\scripts
node simulator.js
```

**Expected Output:**
```
🚀 Cortex Agent Simulator
📡 Target: http://localhost:5001/api/events/ingest
✅ [1] SAFE event from workstation-01.dev.corp → SAFE
🚨 [2] MALICIOUS event from prod-server-primary.internal → MALICIOUS
```

**Verify:**
1. Refresh Dashboard (http://localhost:5173)
2. Event count should increase
3. Alerts should appear for MALICIOUS events
4. Recent Activity should show new events

## Common Issues & Fixes

### ❌ Backend: "Database connection failed"
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# If stopped, start it:
Start-Service postgresql-x64-15

# Verify connection string in backend/.env
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cortex?schema=public"
```

### ❌ Backend: "Module not found"
```powershell
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### ❌ Frontend: "Cannot connect to backend"
1. Check backend is running on port 5001
2. Check browser console for CORS errors
3. Verify Vite proxy in `frontend/vite.config.ts`

### ❌ Simulator: "ECONNREFUSED"
- Backend must be running first
- Check API_URL in `scripts/simulator.js` is `http://localhost:5001/api/events/ingest`

### ❌ Login: "Invalid credentials"
```powershell
# Re-seed database
cd backend
npx prisma db seed
```

### ❌ Port 5001 already in use
```powershell
# Find process
netstat -ano | findstr :5001

# Kill it (replace <PID>)
taskkill /PID <PID> /F
```

## Success Criteria

✅ **System is healthy when:**
1. Backend starts without errors
2. Frontend loads and shows login page
3. Can log in with `admin@cortex.com` / `Admin123!`
4. Dashboard shows stats (even if zeros)
5. Simulator successfully sends events
6. Dashboard updates with new events in real-time

## Final Demo Flow

1. **Start Backend** → Wait for "Database connected"
2. **Start Frontend** → Open http://localhost:5173
3. **Login** → Use admin credentials
4. **Verify Dashboard** → Should load (even with 0 events)
5. **Start Simulator** → Events start flowing
6. **Refresh Dashboard** → See live data
7. **Show Alerts** → MALICIOUS events create alerts

---

**✨ If all checks pass, your Cortex platform is PRODUCTION-READY! ✨**
