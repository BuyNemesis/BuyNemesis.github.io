// Live counters with reliable fallback
async function fetchWithFallback(apiUrl, defaultValue) {
    try {
        const res = await fetch(apiUrl, { 
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!res.ok) throw new Error('Backend request failed');
        const data = await res.json();
        
        // Verify we have a valid count
        if (data && typeof data.count === 'number') {
            return data;
        }
        throw new Error('Invalid data format');
    } catch (e) {
        console.warn(`Counter fallback for ${apiUrl}:`, e);
        return { count: defaultValue };
    }
}

async function updateConfigCount() {
    const data = await fetchWithFallback('https://nemesis-backend-yv3w.onrender.com/api/configs-count', 4);
    const el = document.getElementById('config-count');
    if (!el) return;
    
    el.textContent = data.count.toString();
    el.classList.add('counter-updated');
    setTimeout(() => el.classList.remove('counter-updated'), 1000);
}

async function updateMemberCount() {
    const data = await fetchWithFallback('https://nemesis-backend-yv3w.onrender.com/api/members', 41);
    const el = document.getElementById('member-count');
    if (!el) return;
    
    el.textContent = data.count.toLocaleString();
    el.classList.add('counter-updated');
    setTimeout(() => el.classList.remove('counter-updated'), 1000);
}

// Initialize counters
document.addEventListener('DOMContentLoaded', () => {
    updateConfigCount();
    updateMemberCount();
    setInterval(updateConfigCount, 30000); // Update every 30 seconds
    setInterval(updateMemberCount, 30000);
});