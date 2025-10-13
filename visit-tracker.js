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
            
            // Get user's location data
            const locationData = await this.getLocationData();
            
            const response = await fetch(`${this.apiUrl}/api/visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    page: currentPage,
                    userAgent: navigator.userAgent,
                    referrer: document.referrer || 'direct',
                    location: locationData
                })
            });

            if (response.ok) {
                // Mark as tracked for this session
                sessionStorage.setItem('visit_tracked', 'true');
                this.tracked = true;
            }
        } catch (error) {
            // Silent fail - no logging to avoid user concerns
        }
    }

    async getLocationData() {
        try {
            // Use a free IP geolocation service
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                const data = await response.json();
                return {
                    country: data.country_name || 'Unknown',
                    countryCode: data.country_code || 'XX',
                    city: data.city || 'Unknown',
                    region: data.region || 'Unknown',
                    ip: data.ip || 'Unknown'
                };
            }
        } catch (error) {
            // Fallback if geolocation fails
        }
        
        return {
            country: 'Unknown',
            countryCode: 'XX',
            city: 'Unknown',
            region: 'Unknown',
            ip: 'Unknown'
        };
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