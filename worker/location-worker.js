/**
 * Cloudflare Worker — Dynamic Location API
 *
 * KV namespace binding: LOCATION_KV
 * Environment variables: TELEGRAM_BOT_TOKEN, ALLOWED_CHAT_ID
 *
 * Telegram commands:
 *   /location Berlin, Germany   → sets current location (away)
 *   /home                       → resets to base location
 *
 * HTTP API:
 *   GET  /location              → returns { current, base, isHome }
 *   POST /webhook/<bot-token>   → Telegram webhook endpoint
 */

const BASE_LOCATION = 'lisbon, portugal';
const KV_KEY = 'current_location';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers for your static site
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /location — read current location
    if (url.pathname === '/location' && request.method === 'GET') {
      const stored = await env.LOCATION_KV.get(KV_KEY, 'json');
      const data = stored || { current: BASE_LOCATION, isHome: true };
      data.base = BASE_LOCATION;

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // POST /webhook/<token> — Telegram webhook
    if (url.pathname === `/webhook/${env.TELEGRAM_BOT_TOKEN}` && request.method === 'POST') {
      const update = await request.json();
      return handleTelegramUpdate(update, env);
    }

    return new Response('Not found', { status: 404 });
  },
};

async function handleTelegramUpdate(update, env) {
  const message = update.message;
  if (!message || !message.text) {
    return new Response('OK');
  }

  // Only allow your own chat ID
  const chatId = message.chat.id.toString();
  if (chatId !== env.ALLOWED_CHAT_ID) {
    return new Response('OK');
  }

  const text = message.text.trim();
  let reply = '';

  if (text.startsWith('/location ')) {
    const location = text.replace('/location ', '').trim().toLowerCase();
    const isHome = location === BASE_LOCATION || location === 'lisbon' || location === 'home';

    await env.LOCATION_KV.put(KV_KEY, JSON.stringify({
      current: isHome ? BASE_LOCATION : location,
      isHome,
      updatedAt: new Date().toISOString(),
    }));

    reply = isHome
      ? `📍 Back home — ${BASE_LOCATION}`
      : `📍 Updated — ${location} · based in lisbon`;

  } else if (text === '/home') {
    await env.LOCATION_KV.put(KV_KEY, JSON.stringify({
      current: BASE_LOCATION,
      isHome: true,
      updatedAt: new Date().toISOString(),
    }));
    reply = `📍 Back home — ${BASE_LOCATION}`;

  } else if (text === '/where') {
    const stored = await env.LOCATION_KV.get(KV_KEY, 'json');
    const data = stored || { current: BASE_LOCATION, isHome: true };
    reply = data.isHome
      ? `📍 ${BASE_LOCATION}`
      : `📍 ${data.current} · based in lisbon`;

  } else {
    return new Response('OK'); // Ignore other messages
  }

  // Send reply back to Telegram
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: reply }),
  });

  return new Response('OK');
}
