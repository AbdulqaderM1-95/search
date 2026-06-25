# EZsearch — Setup Guide

## 1. Create Supabase project

1. Go to https://supabase.com → New project
2. Name it `ezsearch`, choose a strong database password, pick the closest region
3. Wait for the project to provision (~1 min)

## 2. Run the database migration

In your Supabase dashboard → **SQL Editor** → paste and run the contents of:

```
supabase/migrations/001_initial.sql
```

This creates all tables, RLS policies, triggers, and seeds the 4 shops + 3 iPhone models.

## 3. Upload shop logos (optional)

1. Go to **Storage** → Create bucket `shop-logos` (set to **public**)
2. Upload your 4 PNG files:
   - `logo_xcite.png`
   - `logo_blink.png`
   - `logo_eureka.png`
   - `logo_best_alyousifi.png`
3. Copy each file's public URL and update the `logo_url` column in the `shops` table via the Table Editor

## 4. Get your API keys

In Supabase → **Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Get an OpenRouter key at https://openrouter.ai/keys

## 5. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

## 6. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 7. Set your first admin

After creating your account in the app, run this in Supabase SQL Editor (replace with your user UUID from the `auth.users` table):

```sql
UPDATE public.profiles SET role = 'admin' WHERE id = 'your-user-uuid-here';
```

## 8. Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` and follow prompts
3. Add the 3 environment variables in the Vercel dashboard (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENROUTER_API_KEY`
4. Set your Supabase **Auth → URL Configuration → Site URL** to your Vercel URL
5. Add your Vercel URL to **Auth → URL Configuration → Redirect URLs**

## 9. Add prices (first run)

Go to `/admin/content` → Edit each price row to set real prices from each shop.
Prices are entered manually — no scraper.
