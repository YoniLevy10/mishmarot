import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'

export function DevJournalPage() {
  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-extrabold text-white">יומן מפתח</div>
            <div className="mt-1 text-xs text-slate-300/80">
              עדכון אחרון: 2026-04-21 — זהו מסך “מצב פרויקט” שמסכם מה כבר קיים, מה תוקן לאחרונה, ומה נשאר לעשות.
            </div>
          </div>
          <Link className="text-sm font-semibold text-indigo-200 hover:text-white" to="/">
            חזרה
          </Link>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-bold text-white">איפה אנחנו עומדים</div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-200/90">
          <li>אפליקציית React + Vite + TypeScript + Tailwind v4 + React Router.</li>
          <li>Supabase משמש ל‑Auth + DB (יש סכמה ב־`supabase.sql`).</li>
          <li>הפרויקט על GitHub, ויש דיפלוי ב‑Vercel.</li>
        </ul>
      </Card>

      <Card>
        <div className="text-sm font-bold text-white">מה כבר בוצע (בפועל)</div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-200/90">
          <li>חיבור Supabase בצד לקוח דרך `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.</li>
          <li>תיקון ניתוב SPA ב‑Vercel עם `vercel.json` (כדי ש־`/login` לא יחזיר 404).</li>
          <li>תיקון קריסת פרודקשן: הוסר `@supabase/auth-ui-react` כי הוא גרם לשתי גרסאות React במקביל.</li>
          <li>מסך Login עבר לטופס פשוט עם `signInWithPassword` / `signUp`.</li>
        </ul>
      </Card>

      <Card>
        <div className="text-sm font-bold text-white">מה חסר / מה לבדוק</div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-200/90">
          <li>ב‑Vercel: לוודא שמוגדרים בדיוק `VITE_SUPABASE_URL` ו־`VITE_SUPABASE_ANON_KEY` (לא `SUPABASE_ANON_KEY`).</li>
          <li>ב‑Supabase: לוודא ש־Email Auth מופעל, Redirect URLs מתאימים, ושהסכמה הורצה ב־SQL Editor.</li>
          <li>RLS/Policies: לוודא שהמשתמש יכול לקרוא/לכתוב רק לרשומות שלו (profiles/shifts).</li>
          <li>חוויית משתמש: “שכחתי סיסמה”, הודעות שגיאה ידידותיות יותר, ולידציה לשדות.</li>
        </ul>
      </Card>

      <Card>
        <div className="text-sm font-bold text-white">תכנון קדימה (צעדים הגיוניים הבאים)</div>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-slate-200/90">
          <li>להוסיף “איפוס סיסמה” דרך Supabase (מייל + redirect).</li>
          <li>להוסיף בדיקות אוטומטיות קטנות (לפחות Typecheck/build ב‑CI).</li>
          <li>לשפר אבטחה/פרטיות: להסתיר יומן מפתח בפרודקשן (או להציג רק למשתמש admin).</li>
          <li>לייצא דוח חודשי (PDF/CSV) מתוך מסך הסיכום.</li>
        </ol>
      </Card>

      <Card>
        <div className="text-xs text-slate-300/80">
          הערה: זה לא “יומן אוטומטי” מה‑Git — זה מסך סיכום שמתעדכן כשמעדכנים את הקוד. אם תרצה, אפשר לחבר את זה ל‑GitHub API/Commits
          ולהציג שינויים אמיתיים בלי לערוך ידנית.
        </div>
      </Card>
    </div>
  )
}
