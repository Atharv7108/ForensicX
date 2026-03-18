# 🚀 ForensicX Production Deployment (Backend: Render, Frontend: Vercel)

## STATUS: 🟡 Preparing - Large ML models need handling (temp disable)

## 1. GIT PREP (Run these)
```
git add .
git commit -m "Prepare production deploy: disable ML temporarily"
git push origin main
```

## 2. BACKEND RENDER.COM
```
1. render.com → New → Web Service → [your GitHub repo]
2. Python → Connect repo (ROOT DIRECTORY)
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Plan: Free (512MB)
⚠️  **CRITICAL**: Add to .gitignore:
```
models/*
data/*
*.pth
*.pkl
```
6. Create & push: `git add .gitignore && git commit -p && git push`

7. Deploy → Add Database → PostgreSQL (Free)
8. Environment Variables:
```
DATABASE_URL=postgresql://user:... (copy from Render)
SECRET_KEY=sk-64randomcharsminimumverysecret1234567890abcdefghijklmnopqrstuvwxyz
```
9. Deploy!
```

## 3. DATABASE MIGRATION (After Render deploy)
```
# Local backup (optional)
sqlite3 forensicx.db ".dump" > db_backup.sql

# Render shell (after Postgres created)
psql $DATABASE_URL < db_backup.sql
```

## 4. FRONTEND VERCEL.COM  
```
1. vercel.com → New Project → [same GitHub repo]
2. Root: ./frontend
3. Framework: Vite ✅ Auto
4. Env Vars: `VITE_API_BASE=https://your-app.onrender.com`
5. Deploy!
```

## 5. TEST PRODUCTION
```
✅ Backend: https://your-app.onrender.com/health
✅ Auth: POST /auth/demo 
✅ Frontend: https://your-project.vercel.app
✅ Update VITE_API_BASE after backend URL ready
```

## 6. ML MODELS (Phase 2 - After demo works)
```
Options:
[ ] AWS S3 + boto3 download
[ ] HuggingFace Hub public repo
[ ] External ML service (Replicate/Modal)
[ ] Render paid plan (2GB+)
```

## QUICK COMMANDS TO RUN NOW:
```bash
# 1. Git prep
echo "models/*\ndata/*\n*.pth\n*.pkl\n.DS_Store" >> .gitignore
git add .gitignore TODO.md frontend/src/services/api.ts
git commit -m "Deploy prep: disable ML, fix API base"
git push origin main
```

**Next manual step**: Create Render service following steps 2-3 above.

**Backend will serve AUTH only (demo mode) until ML models handled.**
