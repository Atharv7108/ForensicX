# ForensicX - AI Forensic Detection Platform

## Backend Deploy (Render)

**Use `requirements-render.txt`** for auth-only deploy:

```
Build Command: pip install -r requirements-render.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables**:
```
DATABASE_URL=postgresql://...
SECRET_KEY=sk-your-64-char-secret-key...
```

## Full ML Backend (Future)
Use `requirements.txt` + upload models to S3/HuggingFace.

## Frontend Deploy (Vercel)
Root: `./frontend`
Env: `VITE_API_BASE=https://your-render-app.onrender.com`

