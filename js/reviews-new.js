// Reviews System with backend pagination
let allReviews = [];
let offset = 0;
const REVIEWS_PER_PAGE = 6;
let hasMore = true;

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
        ? `<img src="${review.author.avatar}" alt="${username}" class="avatar-img">` 
        : `<div class="avatar-initials">${initials}</div>`;
    
    return `
        <div class="review-card" data-rating="${rating}">
            <div class="review-header">
                <div class="review-avatar">${avatar}</div>
                <div class="review-info">
                    <h4>${username}</h4>
                    <div class="review-date">${ago}</div>
                </div>
            </div>
            <div class="review-content">${review.content || 'No review message.'}</div>
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
    const reviewCards = allReviews.map(createReviewCard).join('');
    let html = reviewCards;
    if (hasMore) {
        html += `
            <div class="view-more-container">
                <button class="view-more-btn" onclick="loadReviews()">Load More Reviews</button>
            </div>
        `;
    }
    grid.innerHTML = html;
}


async function loadReviews(initial = false) {
    const grid = document.getElementById('reviews-grid');
    if (!hasMore && !initial) return;
    if (initial) {
        allReviews = [];
        offset = 0;
        hasMore = true;
        if (grid) grid.innerHTML = '<div class="review-loading"><div class="loading-spinner"></div><p>Loading reviews...</p></div>';
    }
    try {
        // Try backend endpoint first
        let data = null;
        try {
            const response = await fetch(`https://nemesis-backend-yv3w.onrender.com/api/reviews?offset=${offset}&limit=${REVIEWS_PER_PAGE}`, { cache: 'no-store' });
            if (response.ok) data = await response.json();
        } catch (e) {
            data = null;
        }

        // If backend failed or returned invalid data, fall back to local static file
        if (!data || !Array.isArray(data.reviews)) {
            const localRes = await fetch('data/reviews.json', { cache: 'no-store' });
            if (localRes.ok) data = await localRes.json();
        }

        if (!data || !Array.isArray(data.reviews)) throw new Error('Invalid reviews data');

        allReviews = allReviews.concat(data.reviews);
        hasMore = data.hasMore || false;
        offset += REVIEWS_PER_PAGE;
        if (allReviews.length === 0) {
            grid.innerHTML = '<div class="review-card"><div class="review-content">No reviews yet.</div></div>';
            return;
        }
        updateReviewDisplay();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        if (grid) grid.innerHTML = '<div class="review-card"><div class="review-content">Failed to load reviews. Please try again later.</div></div>';
    }
}

// Initialize reviews and set up auto-refresh
document.addEventListener('DOMContentLoaded', () => {
    loadReviews(true);
    setInterval(() => loadReviews(true), 60000);  // Refresh every minute
});