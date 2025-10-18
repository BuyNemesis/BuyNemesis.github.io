// Reviews System V2
// Format the date in a human-readable format
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const hours = Math.floor(diffTime / (1000 * 60 * 60));
        if (hours === 0) {
            const minutes = Math.floor(diffTime / (1000 * 60));
            if (minutes === 0) return 'Just now';
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

function createReviewCard(review) {
    if (!review || !review.author) return '';
    
    const username = review.author.username || 'Anonymous';
    const initials = username.slice(0, 2).toUpperCase();
    const content = review.content?.trim() || 'No review message.';
    const rating = Math.min(Math.max(0, review.rating || 0), 5);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const date = formatDate(review.timestamp);
    
    const avatarHtml = review.author.avatar
        ? `<img src="${review.author.avatar}" alt="${username}" class="avatar-img" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'avatar-initials\\'>${initials}</div>';">`
        : `<div class="avatar-initials">${initials}</div>`;

    return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar">
                    ${avatarHtml}
                </div>
                <div class="review-info">
                    <h4>${username}</h4>
                    <div class="review-date">${date}</div>
                </div>
            </div>
            <div class="review-content">${content}</div>
            <div class="review-rating">
                <span class="stars">${stars}</span>
                <span class="rating-text">${rating}/5</span>
            </div>
        </div>
    `;
}


async function loadReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) {
        console.error('❌ Reviews grid element not found! Looking for element with id="reviews-grid"');
        return;
    }

    console.log('🔄 Starting to load reviews...');

    // Show loading state
    grid.innerHTML = `
        <div class="review-loading">
            <div class="loading-spinner"></div>
            <p>Loading reviews...</p>
        </div>
    `;

    try {
        const apiUrl = 'https://nemesis-backend-yv3w.onrender.com/api/reviews';
        console.log('📡 Fetching from:', apiUrl);
        console.log('🌐 Current page protocol:', window.location.protocol);
        console.log('🌐 Current page origin:', window.location.origin);
        console.log('🔍 Browser:', navigator.userAgent);
        
        // Add fetch options with explicit mode (without credentials to avoid CORS issues)
        const fetchOptions = {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
            // Note: NOT sending credentials to avoid CORS wildcard conflict
        };
        
        console.log('🚀 Initiating fetch with options:', fetchOptions);
        const response = await fetch(apiUrl, fetchOptions);
        
        console.log('📥 Response received!');
        console.log('📊 Response status:', response.status, response.statusText);
        console.log('📋 Response headers:', [...response.headers.entries()]);
        console.log('✓ Response ok?', response.ok);
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Data parsed successfully:', data);
        console.log('📊 Number of reviews:', data.reviews?.length || 0);
        
        if (!data || !Array.isArray(data.reviews)) {
            console.error('❌ Invalid data format:', data);
            throw new Error('Invalid response format from server');
        }

        if (data.reviews.length === 0) {
            console.log('ℹ️ No reviews found');
            grid.innerHTML = `
                <div class="review-empty">
                    <p class="review-message">No reviews available yet.</p>
                </div>
            `;
            return;
        }

        const reviewsHtml = data.reviews
            .map(review => createReviewCard(review))
            .filter(html => html) // Remove any empty strings from invalid reviews
            .join('');

        grid.innerHTML = reviewsHtml;
        console.log(`✅ Successfully rendered ${data.reviews.length} reviews`);

    } catch (error) {
        console.error('❌ Failed to load reviews:', error);
        console.error('📛 Error name:', error.name);
        console.error('💬 Error message:', error.message);
        console.error('📚 Error stack:', error.stack);
        console.error('🔍 Error occurred at:', new Date().toISOString());
        
        let errorMessage = 'Failed to load reviews.';
        let helpText = '';
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server.';
            console.error('🚨 FETCH FAILURE - Possible causes:');
            console.error('  1. Network is down');
            console.error('  2. Server is not responding');
            console.error('  3. CORS policy blocking request');
            console.error('  4. Browser security policy');
            console.error('  5. Mixed content (HTTP/HTTPS)');
            console.error('  Current protocol:', window.location.protocol);
            console.error('  Target protocol: https:');
            
            if (window.location.protocol === 'file:') {
                helpText = '<br><small>⚠️ You\'re opening this page as a local file. Please use a web server (e.g., Live Server extension in VS Code) or deploy to a hosting service.</small>';
            } else {
                helpText = '<br><small>Check your internet connection or try again later.</small>';
            }
        } else if (error.message.includes('CORS')) {
            errorMessage = 'CORS policy blocked the request.';
            helpText = '<br><small>The server needs to allow requests from ' + window.location.origin + '</small>';
        }
        
        grid.innerHTML = `
            <div class="review-error">
                <p class="review-message">${errorMessage}${helpText}</p>
                <button class="retry-btn" onclick="window.loadReviews()">Try Again</button>
            </div>
        `;
    }
}


// Expose loadReviews globally immediately (before DOMContentLoaded)
window.loadReviews = loadReviews;
window.updateReviews = loadReviews;

console.log('📦 Reviews script loaded - functions exposed to window');

// Note: Initialization is now handled by the main HTML script
// to avoid race conditions with other scripts