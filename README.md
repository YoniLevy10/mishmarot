# משמרות (Mishmarot)

אפליקציית React + Vite בעברית (RTL) לניהול משמרות וחישוב שכר חודשי למאבטחים (הסכם RODA).

## טכנולוגיות
- React + Vite + TypeScript
- TailwindCSS (v4)
- React Router
- Supabase (Auth + Database)
- Deployed to Vercel

## הרצה מקומית
1. התקנת תלויות:

```bash
npm install
```

2. צור קובץ `.env.local` על בסיס `.env.example`:

```bash
copy .env.example .env.local
```

3. מלא ערכים ב־`.env.local`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

4. הרץ:

```bash
npm run dev
```

## Supabase
1. צור פרויקט Supabase.
2. הפעל Email Auth.
3. הרץ את הסכמה מתוך `supabase.sql` ב־SQL Editor.

## דפלוי ל־Vercel
- העלה את התיקיה `mishmarot` ל־GitHub.
- ב־Vercel צור פרויקט חדש מה־repo.
- הגדר Environment Variables בפרויקט:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Build Command: `npm run build`
- Output: `dist`

## מבנה קבצים עיקרי
- `src/lib/supabase.ts` חיבור Supabase
- `src/lib/calc.ts` לוגיקת חישוב שכר
- `src/pages/*` מסכים (Login/Home/Summary/Settings)

