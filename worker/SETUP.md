# Dynamic Location — Setup Guide

## 1. Create the Telegram Bot

1. Open Telegram, search for **@BotFather**
2. Send `/newbot`
3. Name it something like "Location Bot"
4. Username: e.g. `benyasca_location_bot`
5. Copy the **bot token** BotFather gives you
6. Send a message to your new bot (just say "hi")
7. Get your chat ID by visiting:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   Look for `"chat":{"id":123456789}` — that number is your **chat ID**

## 2. Deploy the Cloudflare Worker

```bash
# Install wrangler if you don't have it
npm install -g wrangler

# Login to Cloudflare (free account works)
wrangler login

# From the worker/ directory:
cd worker

# Create the KV namespace
npx wrangler kv namespace create LOCATION_KV
# Copy the id it prints and paste it into wrangler.toml

# Set secrets
npx wrangler secret put TELEGRAM_BOT_TOKEN
# Paste your bot token

npx wrangler secret put ALLOWED_CHAT_ID
# Paste your chat ID

# Deploy
npx wrangler deploy
```

Note your worker URL: `https://location-api.<your-subdomain>.workers.dev`

## 3. Set the Telegram Webhook

Run this once (replace the placeholders):

```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://location-api.<your-subdomain>.workers.dev/webhook/<YOUR_TOKEN>"
```

## 4. Update the Website

In `src/pages/index.astro`, replace `YOUR_SUBDOMAIN` in the `WORKER_URL` with your actual Cloudflare subdomain.

## Usage

From Telegram, message your bot:

- `/location Berlin, Germany` — sets location (shows "berlin, germany · based in lisbon")
- `/location Tokyo` — sets location
- `/home` — back to lisbon
- `/where` — check what's currently set
