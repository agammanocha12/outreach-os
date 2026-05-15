# Outreach OS — Your Daily Playbook
## Atlas Reception · atlasreception4you@gmail.com

---

## What Telegram tells you and when

| Notification | When it fires |
|---|---|
| 📤 Morning batch sent | 10am daily — confirms emails went out |
| 📤 Afternoon batch sent + daily summary | 2pm daily — full day recap |
| 🔥 HOT LEAD | The second a company replies positively |
| 📬 Warm reply | Company asking about price |
| 💰 New customer | The moment you mark someone as a customer |
| 🔍 Scrape complete | After running npm run scrape |
| ⚠️ Gmail disconnected | If sending breaks — needs your attention |

---

## Day 1 checklist (today, ~30 min)

1. [ ] Open production URL → Settings → verify all your info
2. [ ] Settings → Test Telegram notification → confirm you receive it
3. [ ] Settings → confirm Gmail connected
4. [ ] Run first scrape:
   ```
   npm run scrape -- "HVAC and plumbing" "Suffolk County NY,Nassau County NY,Queens NY,Long Island NY" 400
   ```
5. [ ] Wait for Telegram: "🔍 Scrape complete: X leads added"
6. [ ] Verify leads appear in Leads page
7. [ ] Record 60-second Loom of AI handling a sample call → paste into Settings → Demo link
8. [ ] Set up Calendly free → verify link in Settings
9. [ ] Settings → flip Paused toggle OFF
10. [ ] Wait for 10am tomorrow — you'll get your first Telegram confirmation

---

## What to do when Telegram fires

**"🔥 HOT LEAD" fires:**
Drop what you're doing. Open the inbox link in the notification. Send the pre-written reply. Book the demo. Reply speed is everything — a lead that waits an hour often goes cold.

**"📤 Morning/afternoon batch sent" fires:**
Good. Nothing to do. Keep building.

**"📊 Daily Summary" fires:**
Scan the numbers. Reply rate below 10%? Open Campaigns and tweak the Email 1 subject line. Open rate below 50%? Drop send rate to 25/day in Settings for a week.

**"⚠️ Gmail disconnected" fires:**
Open Settings immediately → Disconnect → Connect Gmail → redo OAuth. Sends are paused until fixed.

**"💰 New customer" fires:**
Celebrate. Then raise your prices.

---

## Daily routine (1 hour/day)

**Morning (15 min):** Check Telegram. Handle any HOT/WARM replies from overnight. Send via the Gmail link in the inbox, using the pre-written response.

**Midday (15 min):** Run any demos that booked.

**Afternoon (5 min):** Telegram confirms afternoon batch. Nothing else needed.

**Weekly (30 min):** Run fresh scrape:
```
npm run scrape -- "HVAC and plumbing" "next city set" 400
```
Review A/B results on dashboard.

---

## Month 1 math to 20 customers

- 40/day × 30 days = 1,200 emails sent
- 60-70% open rate (year-old Gmail) = 780 opens
- 15% reply rate with 4-email sequence = ~150 replies
- 35% positive (HOT/WARM) = ~52 demos
- 65% show up = ~34 demos completed
- 55% close = 18-20 customers

**Critical path:** Reply to HOT notifications within 1 hour. Have a Loom demo. Show up.

---

## Scraper commands

```bash
# First scrape (run locally, not on Vercel)
npm run scrape -- "HVAC and plumbing" "Suffolk County NY,Nassau County NY,Queens NY,Long Island NY" 400

# Just HVAC
npm run scrape -- "HVAC" "Bergen County NJ,Bronx NY" 200

# Just plumbing
npm run scrape -- "plumbing" "Nassau County NY" 200
```

---

## Troubleshooting

**No Telegram messages:**
You need to send the bot at least one message first. Open your bot in Telegram and say anything. Then test again in Settings.

**Open rate below 40%:**
Gmail throttling. Drop send rate to 20/day in Settings, wait 5 days, climb back up.

**Replies not appearing in inbox:**
Check-replies cron runs every 15 min. Check that cron jobs are enabled in Vercel → Cron Jobs tab.

**Gmail disconnected alert:**
Settings → Disconnect → Connect Gmail.

**Leads not scraping:**
Run `npm run scrape` locally, check terminal for errors. Make sure `.env.local` has Supabase credentials.

**"Error: No leads to send to":**
All leads have been sent to already. Run the scraper to add new leads.

**Cron not running:**
Vercel free tier crons require a deployed project. They won't run on `localhost`.

---

## Environment variables reference

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API (service_role) |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |
| `CRON_SECRET` | Any random 32-char string |
| `TELEGRAM_BOT_TOKEN` | @BotFather in Telegram |
| `TELEGRAM_CHAT_ID` | Your user ID from getUpdates |
