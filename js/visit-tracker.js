// Visit tracking for Nemesis website
class VisitTracker {
    constructor() {
        // TODO: Update this with your actual Render deployment URL
        // Example: 'https://nemesis-analytics-abc123.onrender.com'
        this.apiUrl = 'https://nemesis-backend-yv3w.onrender.com'; 
        this.tracked = false;
        this.init();
    }

    init() {
        // Only track once per session
        if (sessionStorage.getItem('visit_tracked')) {
            return;
        }

        // Wait a moment for page to load, then track
        setTimeout(() => {
            this.trackVisit();
        }, 1000);
    }

    async trackVisit() {
        if (this.tracked) return;

        try {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            const response = await fetch(`${this.apiUrl}/api/visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    page: currentPage,
                    userAgent: navigator.userAgent,
                    referrer: document.referrer || 'direct'
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Visit tracked successfully:', data.message);
                
                // Mark as tracked for this session
                sessionStorage.setItem('visit_tracked', 'true');
                this.tracked = true;
            } else {
                console.warn('⚠️ Visit tracking failed:', response.status);
            }
        } catch (error) {
            console.warn('⚠️ Visit tracking error:', error.message);
        }
    }
}

// Initialize visit tracking when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new VisitTracker();
    });
} else {
    new VisitTracker();
}