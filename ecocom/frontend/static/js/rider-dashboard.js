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

// Fetch Rider Profile
async function fetchRiderProfile() {
    try {
        const username = localStorage.getItem('username');
        
        if (!username) {
            console.error('No username found');
            window.location.href = '/login/';
            return;
        }

        const response = await fetch(`/api/rider/profile/?username=${username}`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Rider Profile Data:', data);

        if (data.success) {
            const profile = data.profile;

            // Update profile details
            document.getElementById('rider-username').textContent = profile.username || 'N/A';
            document.getElementById('rider-name').textContent = profile.name || 'N/A';
            document.getElementById('rider-email').textContent = profile.email || 'N/A';
            document.getElementById('rider-phone').textContent = profile.phone || 'N/A';
            document.getElementById('rider-pickup-location').textContent = profile.pickup_location || 'N/A';
        } else {
            console.error('Failed to fetch rider profile:', data.message);
            
            // Set default values if fetch fails
            document.getElementById('rider-username').textContent = 'N/A';
            document.getElementById('rider-name').textContent = 'N/A';
            document.getElementById('rider-email').textContent = 'N/A';
            document.getElementById('rider-phone').textContent = 'N/A';
            document.getElementById('rider-pickup-location').textContent = 'N/A';
        }
    } catch (error) {
        console.error('Rider profile fetch error:', error);
        
        // Set default values on error
        document.getElementById('rider-username').textContent = 'N/A';
        document.getElementById('rider-name').textContent = 'N/A';
        document.getElementById('rider-email').textContent = 'N/A';
        document.getElementById('rider-phone').textContent = 'N/A';
        document.getElementById('rider-pickup-location').textContent = 'N/A';
    }
}

// Fetch My Bookings
async function fetchMyBookings() {
    try {
        const username = localStorage.getItem('username');
        const response = await fetch(`/api/rider/bookings/?username=${username}`, {
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
                    <h3>Booking with ${booking.driver_name}</h3>
                    <p>Driver Username: ${booking.driver_username}</p>
                    <p>Car Model: ${booking.car_model}</p>
                    <p>Booking Time: ${booking.created_at}</p>
                    <button onclick="cancelBooking(${booking.id})">Cancel Booking</button>
                `;
                bookingsList.appendChild(bookingElement);
            });
        } else {
            bookingsList.innerHTML = '<p>No bookings found</p>';
        }
    } catch (error) {
        console.error('Fetch bookings error:', error);
        document.getElementById('bookings-list').innerHTML = '<p>Error fetching bookings</p>';
    }
}

// Search Rides Function
async function searchRides() {
    const pickupLocation = document.getElementById('pickup-location').value;
    const carMake = document.getElementById('car-make').value;

    try {
        const response = await fetch(`/api/rider/search-rides/?pickup_location=${pickupLocation}&car_make=${carMake}`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        const data = await response.json();

        if (data.success) {
            displayRides(data.rides);
        } else {
            alert(`Error: ${data.message}`);
            document.getElementById('rides-list').innerHTML = '<p>No rides found</p>';
        }
    } catch (error) {
        console.error('Search rides error:', error);
        document.getElementById('rides-list').innerHTML = '<p>Error searching rides</p>';
    }
}

// Display Rides Function
function displayRides(rides) {
    const ridesList = document.getElementById('rides-list');
    ridesList.innerHTML = ''; // Clear previous results

    if (!rides || rides.length === 0) {
        ridesList.innerHTML = '<p>No rides found</p>';
        return;
    }

    rides.forEach(ride => {
        const rideElement = document.createElement('div');
        rideElement.classList.add('ride-card');
        rideElement.innerHTML = `
            <h3>Driver: ${ride.name || 'N/A'}</h3>
            <p>Car Model: ${ride.car_model || 'N/A'}</p>
            <p>Seats Available: ${ride.seats_available || 'N/A'}</p>
            <p>Route: ${ride.route || 'N/A'}</p>
            <p>Timing: ${ride.timing || 'N/A'}</p>
            <p>Rating: ${ride.average_rating || 'N/A'}</p>
            <button onclick="bookRide('${ride.username}')">Book Ride</button>
        `;
        ridesList.appendChild(rideElement);
    });
}

// Book Ride Function
async function bookRide(driverUsername) {
    try {
        const riderUsername = localStorage.getItem('username');
        const response = await fetch('/api/book-ride/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                rider_username: riderUsername,
                driver_username: driverUsername
            })
        });

        const data = await response.json();
        console.log('Book Ride Response:', data);

        if (data.success) {
            alert('Ride booked successfully!');
            fetchMyBookings(); // Refresh bookings
        } else {
            alert(data.message || 'Booking failed');
        }
    } catch (error) {
        console.error('Book ride error:', error);
        alert('An error occurred while booking the ride');
    }
}

// Cancel Booking Function
async function cancelBooking(bookingId) {
    try {
        const response = await fetch('/api/rider/cancel-booking/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ 
                booking_id: bookingId 
            })
        });
        const data = await response.json();
        if (data.success) {
            alert('Booking cancelled successfully!');
            // Refresh bookings list after cancellation
            fetchMyBookings();
        } else {
            alert(data.message || 'Failed to cancel booking');
        }
    } catch (error) {
        console.error('Cancel booking error:', error);
        alert('An error occurred while cancelling the booking');
    }
}

// Logout Function
async function logout() {
    try {
        const response = await fetch('/api/logout/', {
            method: 'POST',
            headers: { 
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            credentials: 'include'
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
}

// Event Listeners and Initial Load
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const userType = localStorage.getItem('user_type');

    // Debug logging
    console.log('Username:', username);
    console.log('User Type:', userType);

    if (!username || userType !== 'Rider') {
        console.warn('Redirecting to login - invalid session');
        window.location.href = '/login/';
        return;
    }

    // Call the profile fetch function
    fetchRiderProfile();

    // Add event listeners
    document.getElementById('search-rides-btn')?.addEventListener('click', searchRides);
    document.getElementById('fetch-bookings-btn')?.addEventListener('click', fetchMyBookings);
    document.getElementById('logout-btn')?.addEventListener('click', logout);
});