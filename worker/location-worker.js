/**
 * Cloudflare Worker — Dynamic Location API
 *
 * KV namespace binding: LOCATION_KV
 * Environment variables: TELEGRAM_BOT_TOKEN, ALLOWED_CHAT_ID
 *
 * Telegram commands:
 *   /location Berlin, Germany   → sets current location (away)
 *   /home                       → resets to base location
 *   /where                      → check current setting
 *   [share location attachment] → auto-detects city via reverse geocoding
 *
 * HTTP API:
 *   GET  /location              → returns { current, base, isHome }
 *   POST /webhook/<bot-token>   → Telegram webhook endpoint
 */

const BASE_LOCATION = 'lisbon';
const KV_KEY = 'current_location';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

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

async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10&accept-language=en`,
    { headers: { 'User-Agent': 'benyasca-location-bot/1.0' } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const addr = data.address || {};
  const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
  if (!city) return null;
  return city.toLowerCase();
}

function isHomeLocation(location) {
  return location === BASE_LOCATION
    || location === 'lisbon'
    || location === 'lisboa'
    || location === 'home';
}

async function setLocation(env, location) {
  const isHome = isHomeLocation(location);
  const current = isHome ? BASE_LOCATION : location;
  await env.LOCATION_KV.put(KV_KEY, JSON.stringify({
    current,
    isHome,
    updatedAt: new Date().toISOString(),
  }));
  return isHome
    ? `📍 Back home — ${BASE_LOCATION}`
    : `📍 Updated — ${current} / lisbon`;
}

async function handleTelegramUpdate(update, env) {
  const message = update.message;
  if (!message) return new Response('OK');

  // Only allow your own chat ID
  const chatId = message.chat.id.toString();
  if (chatId !== env.ALLOWED_CHAT_ID) {
    return new Response('OK');
  }

  let reply = '';

  // Handle shared location (📎 → Location → Send)
  if (message.location) {
    const { latitude, longitude } = message.location;
    const location = await reverseGeocode(latitude, longitude);
    if (location) {
      reply = await setLocation(env, location);
    } else {
      reply = `📍 Couldn't detect city for ${latitude}, ${longitude}. Try /location <city> instead.`;
    }

  // Handle text commands
  } else if (message.text) {
    const text = message.text.trim();

    if (text.startsWith('/location ')) {
      const location = text.replace('/location ', '').trim().toLowerCase();
      reply = await setLocation(env, location);

    } else if (text === '/home') {
      reply = await setLocation(env, 'home');

    } else if (text === '/where') {
      const stored = await env.LOCATION_KV.get(KV_KEY, 'json');
      const data = stored || { current: BASE_LOCATION, isHome: true };
      reply = data.isHome
        ? `📍 ${BASE_LOCATION}`
        : `📍 ${data.current} / lisbon`;

    } else {
      return new Response('OK');
    }
  } else {
    return new Response('OK');
  }

  // Send reply
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: reply }),
  });

  return new Response('OK');
}
