# יומן מפתח / מסמך העברה למפתח חיצוני — Mishmarot

תאריך עדכון: 2026-04-21

## מטרת המוצר (בקצרה)
אפליקציית React (Vite) לניהול משמרות וחישוב שכר חודשי (RODA), עם Supabase ל‑Auth + DB.

## מה כבר קיים בקוד
- **Frontend**: React 19 + Vite 8 + TypeScript + Tailwind v4 + React Router.
- **Supabase client**: `src/lib/supabase.ts` משתמש ב־`import.meta.env`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Auth flow**:
  - `src/pages/LoginPage.tsx` — התחברות/הרשמה עם `signInWithPassword` / `signUp`.
  - `src/app/AuthGate.tsx` — מגן על מסכים פנימיים.
- **DB schema**: `supabase.sql` (להרצה ב‑Supabase SQL Editor).
- **Deploy**: Vercel (SPA). יש `vercel.json` עם rewrite ל־`/index.html` כדי שלא יהיו 404 על routes כמו `/login`.

## החלטות טכניות חשובות (למה דברים נראים כמו שהם)
### 1) Vite env vars ≠ Next.js env vars
ב‑Vite רק משתנים שמתחילים ב־`VITE_` נכנסים לבאנדל בצד לקוח. לכן ב‑Vercel חייבים שמות כמו:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

שם כמו `SUPABASE_ANON_KEY` **לא יגיע** לקוד הלקוח.

### 2) הוסר `@supabase/auth-ui-react`
החבילה גרמה ל־**שתי גרסאות React במקביל** (React 19 באפליקציה + React 18 כתלות של auth-ui), וזה יצר קריסה בפרודקשן בסגנון:
`Cannot read properties of null (reading 'useState')`.

הפתרון: טופס login פשוט + Supabase Auth API.

### 3) יומן “מצב פרויקט” בתוך האפליקציה
נוסף מסך פנימי:
- route: `/dev-journal`
- קובץ: `src/pages/DevJournalPage.tsx`

זה **סיכום ידני** שמתעדכן כשמשנים את הקוד (לא שואב commits אוטומטית).

## מה לבדוק כשמגיעים לפרויקט (צ’קליסט)
### Supabase
- Email provider מופעל.
- Redirect URLs מתאימים (אם יש flows עם redirect).
- `supabase.sql` הורץ בהצלחה.
- **RLS/Policies**: לוודא שמשתמש רואה/כותב רק את הרשומות שלו (`profiles`, `shifts`, וכו’).

### Vercel
- Environment Variables בפרויקט (לא רק Team shared, אלא גם בפרויקט עצמו אם צריך):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- אחרי שינוי env: **Redeploy**.

### Routes
- לוודא ש־`/login` עובד בפרודקשן (תלוי ב־`vercel.json`).

## איך להריץ מקומית
ראה `README.md`, אבל בקצרה:
1) `npm install`
2) צור `.env.local` לפי `.env.example`
3) `npm run dev`

## נקודות “ידועות” / חוב טכני
- `supabase/.temp/cli-latest` עלה לריפו בעבר — לא קריטי, אבל אפשר לנקות/להחריג אם מפריע.

## הצעדים הבאים המומלצים (לפי עדיפות)
1) “שכחתי סיסמה” + redirect flow ב‑Supabase.
2) בדיקות CI מינימליות (`npm run build`).
3) להחליט אם `/dev-journal` צריך להיות נגיש בפרודקשן לכולם (כרגע זה מאחורי AuthGate).
