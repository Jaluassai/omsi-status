export async function onRequestGet(context) {
  const { env } = context;

  const raw = await env.STATUS_KV.get('server_state');

  if (!raw) {
    return new Response(JSON.stringify({ status: 'unknown', message: 'Brak danych — serwer jeszcze nie raportował.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = JSON.parse(raw);

  return new Response(JSON.stringify({
    status: 'ok',
    ip: data.ip,
    players: data.players,
    timestamp: data.timestamp,
    updated_at: data.updated_at,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}