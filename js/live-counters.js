// Live counters (copied)
async function updateConfigCount() {
    try {
        const res = await fetch('https://nemesis-backend-yv3w.onrender.com/api/configs');
        const data = await res.json();
        const el = document.getElementById('config-count');
        if (el && typeof data.count === 'number') {
            el.textContent = data.count;
        }
    } catch (e) {}
}

async function updateMemberCount() {
    try {
        const res = await fetch('https://nemesis-backend-yv3w.onrender.com/api/members');
        const data = await res.json();
        const el = document.getElementById('member-count');
        if (el && typeof data.count === 'number') {
            el.textContent = data.count.toLocaleString();
        }
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => { updateConfigCount(); updateMemberCount(); setInterval(updateConfigCount, 30000); setInterval(updateMemberCount, 30000); });
