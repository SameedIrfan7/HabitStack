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
