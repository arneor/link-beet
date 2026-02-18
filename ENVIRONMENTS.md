# LinkBeet — Environment Setup (Lightweight)

## How It Works

```
You run "npm run dev"  →  loads .env.development  →  connects to linkbeet_dev database
Render runs "npm start:prod"  →  loads .env.production  →  connects to linkbeet_prod database
```

That's it. Two files, two databases, zero risk of cross-contamination.

---

## File Map

```
backend/
├── .env.development    ← Your local dev config (linkbeet_dev DB)
├── .env.production     ← Production config (linkbeet_prod DB) — used on Render
├── .env                ← Fallback (also points to linkbeet_dev)
├── .env.example        ← Template for new developers
└── src/
    ├── app.module.ts   ← Loads .env.{NODE_ENV} automatically
    ├── main.ts         ← Validates config + logs which DB is connected
    └── common/guards/
        └── environment.guard.ts  ← Blocks dev from connecting to prod DB
```

---

## Running Locally

### Development (default — what you do every day)
```bash
cd backend
npm run dev
```
You'll see in the terminal:
```
✅ Environment validation passed
🚀 LINKBEET Backend is running on: http://localhost:3001
🌍 Environment: development
🗄️  Database: linkbeet_dev       ← Confirms you're on the dev database
```

### Testing Production Config Locally (rare — only to verify)
```bash
cd backend
npm run prod:local
```
This loads `.env.production` so you can verify production config works.

---

## The 3 Key Differences Between Dev and Prod

| Setting         | `.env.development`              | `.env.production`                        |
|-----------------|--------------------------------|------------------------------------------|
| `MONGODB_URI`   | `...cluster0.../linkbeet_dev`  | `...cluster0.../linkbeet_prod`           |
| `CORS_ORIGINS`  | `localhost:3000,3001,3002`     | `www.linkbeet.in,admin.linkbeet.in`      |
| `JWT_SECRET`    | Dev placeholder (weak, OK)     | **Must be 64+ chars** (strong, required) |

Everything else (AWS keys, Google OAuth, email config) is the same for now. You can split those later when needed.

---

## Your Existing MongoDB Data

Your current data is stored on `cluster0.40eipu0.mongodb.net` with **no database name** (defaults to `test`).

After this change:
- `linkbeet_dev` = New empty database for development (you work here freely)
- `linkbeet_prod` = New database for production (you set this up once, then don't touch)
- Your original data in `test` = Still there, untouched

### To Move Your Existing Data to Prod:
1. Go to MongoDB Atlas → Database → cluster0 → Browse Collections
2. You'll see your old collections under the `test` database
3. Use `mongodump` / `mongorestore` to copy to `linkbeet_prod`:
   ```bash
   # Export existing data
   mongodump --uri="mongodb+srv://link-beet-db:PASSWORD@cluster0.40eipu0.mongodb.net/test" --out=./backup

   # Import into prod database
   mongorestore --uri="mongodb+srv://link-beet-db:PASSWORD@cluster0.40eipu0.mongodb.net/linkbeet_prod" --nsFrom="test.*" --nsTo="linkbeet_prod.*" ./backup/test
   ```
4. Or easier: In MongoDB Atlas GUI → click your collection → Clone Collection → target `linkbeet_prod`

---

## What Gets Deployed Where

### Current Setup (Single Environment)
```
Your laptop → push to main → Render auto-deploys → linkbeet_prod DB
```

### After Setup (Two Environments)
```
Your laptop → push to develop → Render Dev service → linkbeet_dev DB
Code review → merge to main → Render Prod service → linkbeet_prod DB
```

### Setting Up the Dev Service on Render
1. Go to render.com → New Web Service → Connect `mark-morph` repo
2. **Branch:** `develop` (not main!)
3. **Root Directory:** `backend`
4. **Build:** `npm install && npm run build`
5. **Start:** `npm run start:prod`   ← This sets NODE_ENV=production, but...
6. **Override NODE_ENV** in Render's env vars to `development` for the dev service
7. **Set MONGODB_URI** to `mongodb+srv://...linkbeet_dev`

Your existing Render service stays on `main` branch → production.

---

## Safety Guardrails

The environment guard (`environment.guard.ts`) does 3 things at every startup:

1. **🛑 Blocks**: If `NODE_ENV=development` but `MONGODB_URI` contains `linkbeet_prod` → crashes immediately
2. **🛑 Blocks**: If `NODE_ENV=production` but `JWT_SECRET` is weak/default → crashes immediately  
3. **⚠️ Warns**: If production is missing `RESEND_API_KEY`, `AWS_*`, or `GOOGLE_CLIENT_ID`

---

## Quick Reference: npm Scripts

| Command             | What it does                          |
|---------------------|---------------------------------------|
| `npm run dev`       | Start locally with DEV database       |
| `npm run start:dev` | Same as `dev` (alias)                 |
| `npm run prod:local`| Start locally with PROD config        |
| `npm run start:prod`| Production build (used by Render)     |
| `npm run build`     | Build for production deployment       |


# 1. Work on develop
git checkout develop

# 2. Make changes, test locally
# 3. Commit and push to develop
git add . && git commit -m "feat: description" && git push origin develop

# 4. Test on dev environment (dev Vercel URL)

# 5. When ready for production:
git checkout main
git merge develop --no-edit
git push origin main
git checkout develop