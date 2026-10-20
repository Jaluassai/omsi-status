export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Weryfikacja tokenu (nagłówek Authorization)
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.WEBHOOK_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { ip, players, timestamp } = body;

  if (!ip || typeof ip !== 'string' || ip.trim() === '') {
    return new Response(JSON.stringify({ error: 'Missing or invalid "ip"' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const record = {
    ip: ip.trim(),
    players: typeof players === 'number' ? players : null,
    timestamp: timestamp || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 2. Zapis do KV (klucz "server_state")
  await env.STATUS_KV.put('server_state', JSON.stringify(record));

  return new Response(JSON.stringify({ ok: true, stored: record }), {
    headers: { 'Content-Type': 'application/json' },
  });
}