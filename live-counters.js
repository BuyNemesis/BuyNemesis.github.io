// Live counters with static fallback for GitHub Pages (no backend)
async function fetchWithFallback(apiUrl, localPath) {
    try {
        // Try backend first
        const res = await fetch(apiUrl, { cache: 'no-store' });
        if (res.ok) return res.json();
        // fall through to local
    } catch (e) {
        // network error or CORS - fall back to local
    }

    try {
        const localRes = await fetch(localPath, { cache: 'no-store' });
        if (localRes.ok) return localRes.json();
    } catch (e) {
        // final fallback failed
    }
    return null;
}

async function updateConfigCount() {
    const data = await fetchWithFallback('https://nemesis-backend-yv3w.onrender.com/api/configs', 'data/configs.json');
    const el = document.getElementById('config-count');
    if (!el) return;
    if (data && typeof data.count === 'number') {
        el.textContent = data.count;
    } else {
        // Use the local file's count when backend is unreachable
        fetch('data/configs.json')
          .then(res => res.json())
          .then(data => {
            if (data && typeof data.count === 'number') {
              el.textContent = data.count;
            }
          })
          .catch(() => {
            // Only use static fallback if local file also fails
            el.textContent = '100+';
          });
    }
}

async function updateMemberCount() {
    const data = await fetchWithFallback('https://nemesis-backend-yv3w.onrender.com/api/members', 'data/members.json');
    const el = document.getElementById('member-count');
    if (!el) return;
    if (data && typeof data.count === 'number') {
        el.textContent = data.count.toLocaleString();
    } else {
        el.textContent = '1,000+';
    }
}

// Initialize counters
document.addEventListener('DOMContentLoaded', () => {
    updateConfigCount();
    updateMemberCount();
    setInterval(updateConfigCount, 30000); // Update every 30 seconds
    setInterval(updateMemberCount, 30000);
});