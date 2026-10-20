const IP_ENDPOINT = '/api/get-ip';

async function fetchServerInfo() {
    try {
        const res = await fetch(IP_ENDPOINT);
        const data = await res.json();

        const statusEl = document.getElementById('server-status');
        const playersEl = document.getElementById('player-count');
        const timeEl = document.getElementById('response-time');

        if (data.status === 'ok') {
            statusEl.textContent = '🟢 Online';
            statusEl.className = 'value online';
            timeEl.textContent = `Ostatni raport: ${new Date(data.updated_at).toLocaleString('pl-PL')}`;
            playersEl.textContent = data.players ?? '—';
        } else {
            statusEl.textContent = '⚪ Oczekiwanie na raport...';
            statusEl.className = 'value';
            timeEl.textContent = data.message || '';
            playersEl.textContent = '—';
        }
    } catch (err) {
        console.error('Błąd:', err);
        document.getElementById('server-status').textContent = '⚠️ Błąd połączenia';
    }
}

fetchServerInfo();
setInterval(fetchServerInfo, 60_000); // odświeżaj co minutę