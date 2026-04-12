# ⚡ HABITSTACK v2 — Setup & Deployment Guide

## What's Inside
- PWA installable app (works on iPhone & Android like a native app)
- Individual accounts with auth
- Common habits → public leaderboard (scores only, habits private)
- Personal habits → fully private, never shared
- Optional Namaz + Quran tracking for Muslim users
- Fire page with animated fire + AI motivation
- AI Coach powered by Claude
- Gym-aesthetic UI with orange/dark theme

---

## STEP 1 — Supabase Setup (~5 min)

1. Go to https://supabase.com → Sign up free → **New Project**
2. Wait for project to boot (~1 min)
3. Go to **SQL Editor** → **New Query**
4. Copy the entire contents of `supabase-schema.sql` → **Run**
5. Go to **Settings → API** → Copy:
   - `Project URL` (looks like `https://xxxx.supabase.co`)
   - `anon public` key (long string starting with `eyJ...`)

---

## STEP 2 — Local Setup

```bash
# Unzip and enter folder
unzip habitstack-v2.zip
cd habitstack-v2

# Create your env file
cp .env.example .env.local

# Edit .env.local — paste your Supabase URL and anon key
nano .env.local   # or open in any editor

# Install dependencies
npm install

# Run locally to test
npm run dev
# Open http://localhost:5173
```

---

## STEP 3 — Deploy to Vercel (~3 min)

### Option A: CLI (fastest)
```bash
npm install -g vercel
vercel

# Follow the prompts:
# - Link to existing project? No
# - What's your project name? habitstack
# - Which directory? ./  (press enter)
# - Override settings? No
```

Then in **Vercel Dashboard → Your Project → Settings → Environment Variables** add:
| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | your supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | your supabase anon key |

Then redeploy: `vercel --prod`

### Option B: GitHub (easiest for future updates)
1. Push code to a GitHub repo
2. Go to https://vercel.com → **Import Project** → select your repo
3. Add the 2 env vars above
4. Deploy → done!

---

## STEP 4 — Install as App on Phones

### iPhone (Safari)
1. Open your Vercel URL in Safari
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **"Add"** — icon appears on home screen!

### Android (Chrome)
1. Open your Vercel URL in Chrome
2. Tap the **3-dot menu**
3. Tap **"Add to Home Screen"** or **"Install App"**
4. Done — opens full-screen like a native app!

---

## STEP 5 — Invite Your Crew

Share your Vercel URL (e.g. `https://habitstack.vercel.app`) with your 6-8 friends.

Each person:
1. Signs up with their name, username, avatar
2. Selects Muslim mode if applicable (adds Namaz/Quran habits)
3. Loads default habits or builds custom ones
4. Starts checking off daily — leaderboard updates automatically

**Privacy guarantee:** The leaderboard only shows each person's daily score (%). Nobody can see which individual habits anyone completed.

---

## App Structure

```
src/
├── pages/
│   ├── TodayPage.jsx      ← Daily checklist + AI Coach + missed habits
│   ├── StatsPage.jsx      ← Charts: week bar, 30-day line, per-habit
│   ├── LeaderboardPage.jsx← Crew rankings (scores only)
│   ├── PersonalPage.jsx   ← Private habits (not on leaderboard)
│   ├── FirePage.jsx       ← Animated fire + quotes + AI motivation
│   ├── ProfilePage.jsx    ← Edit profile, manage habits, sign out
│   └── AuthPage.jsx       ← Sign in / Sign up
├── components/
│   ├── Layout.jsx         ← Bottom nav + top header
│   └── AddHabitModal.jsx  ← Add custom or Muslim habits
├── hooks/
│   ├── useAuth.jsx        ← Auth context
│   └── useHabits.js       ← All habit data + operations
├── data/
│   └── constants.js       ← Quotes, defaults, icons, colors
└── lib/
    └── supabase.js        ← Supabase client
```

---

## Troubleshooting

**"Missing Supabase env vars" warning**
→ Make sure `.env.local` exists with both values and restart `npm run dev`

**Auth not working / users can't sign up**
→ In Supabase: Authentication → Settings → make sure "Enable email confirmations" matches what you want (disable for easier testing)

**Leaderboard empty**
→ Users must check at least one habit to generate a daily score. Scores only appear after the first toggle.

**PWA install not showing**
→ Must be served over HTTPS (Vercel handles this). Localhost won't show install prompt.

---

## Customizing

**Add more default habits:** Edit `src/data/constants.js` → `DEFAULT_COMMON_HABITS`

**Add more quotes:** Edit `src/data/constants.js` → `MOTIVATION_QUOTES`

**Change colors:** Edit `src/index.css` → `:root` variables

**Add more routes:** Add to `src/App.jsx` and `src/components/Layout.jsx`
