// Reviews System with backend pagination and live updates
let allReviews = [];
let offset = 0;
const REVIEWS_PER_PAGE = 6;
let hasMore = true;
let lastUpdate = 0;
const UPDATE_INTERVAL = 30000; // 30 seconds

function timeAgo(dateString) {
    if (!dateString) return '';
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.floor((now - then) / 1000);
    
    if (isNaN(seconds)) return '';
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2419200) return `${Math.floor(seconds / 604800)}w ago`;
    if (seconds < 29030400) return `${Math.floor(seconds / 2419200)}mo ago`;
    return `${Math.floor(seconds / 29030400)}y ago`;
}

function createReviewCard(review) {
    const username = review.author?.username || 'Anonymous';
    const initials = username.substring(0, 2).toUpperCase();
    const rating = typeof review.rating === 'number' ? review.rating : 5;
    const stars = '★'.repeat(Math.max(0, rating)) + '☆'.repeat(Math.max(0, 5 - rating));
    const ago = timeAgo(review.timestamp);
    const avatar = review.author?.avatar 
        ? `<img src="${review.author.avatar}" alt="${username}" class="avatar-img" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'avatar-initials\\'>${initials}</div>';">` 
        : `<div class="avatar-initials">${initials}</div>`;
    
    // Clean and sanitize the content
    const content = review.content?.trim() || 'No review message.';
    
    return `
        <div class="review-card" data-rating="${rating}">
            <div class="review-header">
                <div class="review-avatar">${avatar}</div>
                <div class="review-info">
                    <h4>${username}</h4>
                    <div class="review-date">${ago}</div>
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


function updateReviewDisplay() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    
    // Create the review cards with animation delays
    const reviewCards = allReviews.map((review, index) => {
        const card = createReviewCard(review);
        return card.replace('class="review-card"', 
            `class="review-card" style="animation-delay: ${index * 100}ms"`);
    }).join('');
    
    let html = reviewCards;
    if (hasMore) {
        html += `
            <div class="view-more-container">
                <button class="view-more-btn" onclick="loadReviews(false, true)">Load More Reviews</button>
            </div>
        `;
    }
    
    grid.innerHTML = html;
    
    // Add animation class to trigger fade-in
    requestAnimationFrame(() => {
        const cards = grid.querySelectorAll('.review-card');
        cards.forEach(card => {
            card.classList.add('review-card-visible');
        });
    });
}


async function loadReviews(initial = false, forceRefresh = false) {
    const grid = document.getElementById('reviews-grid');
    
    // Check if we need to refresh based on time
    const now = Date.now();
    if (!forceRefresh && !initial && now - lastUpdate < UPDATE_INTERVAL) {
        return;
    }
    lastUpdate = now;

    if (initial) {
        allReviews = [];
        offset = 0;
        hasMore = true;
        if (grid) grid.innerHTML = '<div class="review-loading"><div class="loading-spinner"></div><p>Loading reviews...</p></div>';
    }

    try {
        // Always fetch latest reviews with no cache
        const response = await fetch('https://nemesis-backend-yv3w.onrender.com/api/reviews?offset=0&limit=6', {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch reviews');
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data.reviews)) {
            throw new Error('Invalid reviews data format');
        }

        // Compare new reviews with existing ones
        const hasNewReviews = initial || forceRefresh || !allReviews.length || 
            JSON.stringify(data.reviews) !== JSON.stringify(allReviews);

        if (hasNewReviews) {
            allReviews = data.reviews;
            hasMore = data.hasMore;
            offset = data.reviews.length;

            // Animate new reviews if not initial load
            if (!initial && grid) {
                grid.style.opacity = '0';
                setTimeout(() => {
                    updateReviewDisplay();
                    grid.style.opacity = '1';
                }, 200);
            } else {
                updateReviewDisplay();
            }
        }

        if (allReviews.length === 0 && grid) {
            grid.innerHTML = '<div class="review-card"><div class="review-content">No reviews yet.</div></div>';
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
        // Only show error if we have no existing reviews
        if ((!allReviews || allReviews.length === 0) && grid) {
            grid.innerHTML = '<div class="review-card"><div class="review-content">Failed to load reviews. Please try again later.</div></div>';
        }
    }
}

// Initialize reviews and set up auto-refresh
document.addEventListener('DOMContentLoaded', () => {
    // Add transition for smooth updates
    const grid = document.getElementById('reviews-grid');
    if (grid) {
        grid.style.transition = 'opacity 0.2s ease';
    }

    // Initial load
    loadReviews(true);

    // Regular refresh every 30 seconds
    setInterval(() => {
        loadReviews(false, true);
    }, UPDATE_INTERVAL);
});