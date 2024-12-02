document.addEventListener('DOMContentLoaded', () => {
    // Utility function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Logout Functionality
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.removeItem('username');
                localStorage.removeItem('user_type');
                window.location.href = '/login/';
            } else {
                alert('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout');
        }
    });

    // Fetch Driver Profile
    async function fetchDriverProfile() {
        try {
            const username = localStorage.getItem('username');
            
            if (!username) {
                console.error('No username found');
                window.location.href = '/login/';
                return;
            }

            const response = await fetch(`/api/driver/profile/?username=${username}`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            const data = await response.json();
            console.log('Profile Data:', data);

            if (data.success) {
                document.getElementById('profile-name').textContent = `Name: ${data.profile.name}`;
                document.getElementById('profile-email').textContent = `Email: ${data.profile.email}`;
                document.getElementById('profile-phone').textContent = `Phone: ${data.profile.phone}`;
                document.getElementById('profile-car-model').textContent = `Car Model: ${data.profile.car_model}`;
                document.getElementById('profile-car-license').textContent = `Car License: ${data.profile.car_license}`;
                document.getElementById('profile-seats').textContent = `Seats Available: ${data.profile.seats_available}`;
                document.getElementById('profile-route').textContent = `Route: ${data.profile.route}`;
                document.getElementById('profile-schedule').textContent = `Schedule: ${data.profile.schedule}`;
            } else {
                console.error('Failed to fetch profile');
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
        }
    }

    // Fetch Driver Bookings
    async function fetchDriverBookings() {
        try {
            const username = localStorage.getItem('username');
            
            const response = await fetch(`/api/driver/bookings/?username=${username}`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            const data = await response.json();
            console.log('Bookings Data:', data);

            const bookingsList = document.getElementById('bookings-list');
            bookingsList.innerHTML = ''; // Clear previous results

            if (data.success && data.bookings && data.bookings.length > 0) {
                data.bookings.forEach(booking => {
                    const bookingElement = document.createElement('div');
                    bookingElement.classList.add('booking-item');
                    bookingElement.innerHTML = `
                        <h3>Booking with ${booking.rider_name}</h3>
                        <p>Booking Time: ${booking.created_at}</p>
                        <button onclick="createRiderRatingModal('${booking.rider_username}')">Rate Rider</button>
                    `;
                    bookingsList.appendChild(bookingElement);
                });
            } else {
                bookingsList.innerHTML = '<p>No bookings found</p>';
            }
        } catch (error) {
            console.error('Fetch bookings error:', error);
        }
    }

    // Create Rider Rating Modal
    window.createRiderRatingModal = function(riderUsername) {
        const ratingsList = document.getElementById('rider-ratings-list');
        ratingsList.innerHTML = `
            <div class="rating-modal">
                <h3>Rate Rider</h3>
                <form id="rider-rating-form">
                    <div class="rating-stars">
                        <input type="radio" name="rating" value="1" id="star1">
                        <label for="star1">★</label>
                        <input type="radio" name="rating" value="2" id="star2">
                        <label for="star2">★</label>
                        <input type="radio" name="rating" value="3" id="star3">
                        <label for="star3">★</label>
                        <input type="radio" name="rating" value="4" id="star4">
                        <label for="star4">★</label>
                        <input type="radio" name="rating" value="5" id="star5">
                        <label for="star5">★</label>
                    </div>
                    <textarea id="rating-feedback" placeholder="Optional feedback"></textarea>
                    <div class="rating-actions">
                        <button type="button" onclick="submitRiderRating('${riderUsername}')">Submit Rating</button>
                        <button type="button" onclick="closeRatingModal()">Cancel</button>
                    </div>
                </form>
            </div>
        `;
    }

    // Submit Rider Rating
    window.submitRiderRating = async function(riderUsername) {
        try {
            const selectedRating = document.querySelector('input[name="rating"]:checked');
            const feedbackElement = document.getElementById('rating-feedback');
            
            if (!selectedRating) {
                alert('Please select a rating');
                return;
            }

            const response = await fetch('/api/driver/rate-rider/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    from_username: localStorage.getItem('username'),
                    to_username: riderUsername,
                    score: parseInt(selectedRating.value),
                    feedback: feedbackElement.value || ''
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Rating submitted successfully');
                closeRatingModal();
            } else {
                alert('Failed to submit rating');
            }
        } catch (error) {
            console.error('Rating submission error:', error);
            alert('An error occurred while submitting rating');
        }
    }

    // Close Rating Modal
    window.closeRatingModal = function() {
        const ratingsList = document.getElementById('rider-ratings-list');
        ratingsList.innerHTML = '';
    }

    // Cancel Booking
    async function cancelBooking(bookingId) {
        try {
            const response = await fetch('/api/cancel-booking/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ booking_id: bookingId })
            });

            const data = await response.json();
            console.log('Cancel Booking Response:', data);

            if (data.success) {
                alert('Booking cancelled successfully!');
                fetchDriverBookings(); // Refresh bookings
            } else {
                alert(data.message || 'Cancellation failed');
            }
        } catch (error) {
            console.error('Cancel booking error:', error);
        }
    }

    // Initial Load
    const username = localStorage.getItem('username');
    const userType = localStorage.getItem('user_type');

    if (!username || userType !== 'Driver') {
        window.location.href = '/login/';
    } else {
        fetchDriverProfile();
        fetchDriverBookings();
    }
});