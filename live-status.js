// Live status handler with smooth transitions
async function updateLiveStatus() {
    try {
        console.log('Fetching status...');
        const response = await fetch('https://nemesis-backend-yv3w.onrender.com/api/live-status', {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) throw new Error(`Failed to fetch status: ${response.status}`);
        
        const status = await response.json();
        console.log('Received status:', status);
        
        if (!status.emoji || !status.color || !status.text) {
            console.error('Invalid status format:', status);
            throw new Error('Invalid status format');
        }
        
        const statusElement = document.getElementById('live-status');
        
        if (statusElement) {
            // Fade out
            statusElement.style.opacity = '0';
            
            // Update after short delay for smooth transition
            setTimeout(() => {
                statusElement.innerHTML = `${status.emoji} ${status.text}`;
                statusElement.className = status.color.toLowerCase();
                
                // Fade back in
                statusElement.style.opacity = '1';
                
                // Add pulse animation on status change
                statusElement.classList.add('status-updated');
                setTimeout(() => {
                    statusElement.classList.remove('status-updated');
                }, 1000);
            }, 200);
        }
    } catch (error) {
        console.warn('Status update failed:', error);
        const statusElement = document.getElementById('live-status');
        if (statusElement) {
            statusElement.style.opacity = '0';
            setTimeout(() => {
                statusElement.innerHTML = '🟢 Online';
                statusElement.className = 'green';
                statusElement.style.opacity = '1';
            }, 200);
        }
    }
}

// Update status immediately and then every 30 seconds
document.addEventListener('DOMContentLoaded', () => {
    updateLiveStatus();
    setInterval(updateLiveStatus, 30000);
});