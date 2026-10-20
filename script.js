const STATE_ENDPOINT = '/api/get-ip';

function timeAgo(iso) {
    if (!iso) return '';
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 0) return 'właśnie teraz';
    if (s < 60) return `${s} s temu`;
    if (s < 3600) return `${Math.floor(s / 60)} min temu`;
    if (s < 86400) return `${Math.floor(s / 3600)} h temu`;
    return `${Math.floor(s / 86400)} dni temu`;
}

function setAddress(url) {
    const addrEl = document.getElementById('server-address');
    const copyBtn = document.getElementById('copy-btn');

    if (url) {
        addrEl.textContent = url;
        addrEl.title = url;
        addrEl.dataset.address = url;
        copyBtn.disabled = false;
    } else {
        addrEl.textContent = '—';
        addrEl.title = '';
        delete addrEl.dataset.address;
        copyBtn.disabled = true;
    }
}

async function fetchServerInfo() {
    try {
        const res = await fetch(STATE_ENDPOINT, { cache: 'no-store' });
        const data = await res.json();

        const statusEl = document.getElementById('server-status');
        const playersEl = document.getElementById('player-count');
        const timeEl = document.getElementById('response-time');
        const lastEl = document.getElementById('last-updated');

        if (data.status === 'ok' && data.url) {
            statusEl.textContent = '🟢 Online';
            statusEl.className = 'value online';
            timeEl.textContent = `Ostatni raport: ${timeAgo(data.updated_at)}`;
            playersEl.textContent = data.players ?? '—';
            setAddress(data.url);
            lastEl.textContent = new Date().toLocaleString('pl-PL');
        } else {
            statusEl.textContent = '⚪ Oczekiwanie na raport...';
            statusEl.className = 'value';
            timeEl.textContent = data.message || '';
            playersEl.textContent = '—';
            setAddress(null);
            lastEl.textContent = new Date().toLocaleString('pl-PL');
        }
    } catch (err) {
        console.error('Błąd:', err);
        document.getElementById('server-status').textContent = '⚠️ Błąd połączenia';
        document.getElementById('server-status').className = 'value offline';
        setAddress(null);
    }
}

// Kopiowanie adresu do schowka
document.getElementById('copy-btn').addEventListener('click', async () => {
    const url = document.getElementById('server-address').dataset.address;
    if (!url) return;

    const btn = document.getElementById('copy-btn');
    const originalText = btn.textContent;

    try {
        await navigator.clipboard.writeText(url);
        btn.textContent = '✅ Skopiowano!';
        btn.classList.add('copied');
    } catch {
        // Fallback dla starszych przeglądarek / http
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            btn.textContent = '✅ Skopiowano!';
            btn.classList.add('copied');
        } catch {
            alert('Nie udało się skopiować. Skopiuj ręcznie:\n\n' + url);
        }
        document.body.removeChild(textarea);
    } finally {
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 1500);
    }
});

fetchServerInfo();
setInterval(fetchServerInfo, 60_000);
