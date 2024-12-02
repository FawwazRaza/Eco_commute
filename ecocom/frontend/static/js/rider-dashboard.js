// // Utility Functions
// function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');
//         for (let i = 0; i < cookies.length; i++) {
//             const cookie = cookies[i].trim();
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

// // Logout Functionality
// document.getElementById('logout-btn').addEventListener('click', async () => {
//     try {
//         // Call backend logout endpoint
//         const response = await fetch('/api/logout/', {
//             method: 'POST',
//             headers: {
//                 'X-CSRFToken': getCookie('csrftoken')
//             }
//         });

//         const data = await response.json();
        
//         if (data.success) {
//             // Clear local storage
//             localStorage.removeItem('username');
//             localStorage.removeItem('user_type');
            
//             // Redirect to login page
//             window.location.href = '/login/';
//         } else {
//             alert('Logout failed');
//         }
//     } catch (error) {
//         console.error('Logout error:', error);
//         alert('An error occurred during logout');
//     }
// });

// // Fetch Rider Profile
// async function fetchRiderProfile() {
//     try {
//         const username = localStorage.getItem('username');
        
//         if (!username) {
//             console.error('No username found');
//             window.location.href = '/login/';
//             return;
//         }

//         const response = await fetch(`/api/rider/profile/?username=${username}`, {
//             method: 'GET',
//             headers: {
//                 'X-CSRFToken': getCookie('csrftoken')
//             }
//         });

//         const data = await response.json();
//         console.log('Profile Data:', data);

//         if (data.success) {
//             document.getElementById('profile-name').textContent = `Name: ${data.profile.name}`;
//             document.getElementById('profile-email').textContent = `Email: ${data.profile.email}`;
//             document.getElementById('profile-phone').textContent = `Phone: ${data.profile.phone}`;
//             document.getElementById('profile-location').textContent = `Pickup Location: ${data.profile.pickup_location}`;
//         } else {
//             console.error('Failed to fetch profile');
//         }
//     } catch (error) {
//         console.error('Profile fetch error:', error);
//     }
// }

// // Search Rides
// document.getElementById('ride-search-form').addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const pickupLocation = document.getElementById('pickup-location').value;
//     const pickupTime = document.getElementById('pickup-time').value;

//     try {
//         const response = await fetch(`/api/search-rides/?pickup_location=${pickupLocation}&pickup_time=${pickupTime}`, {
//             method: 'GET',
//             headers: {
//                 'X-CSRFToken': getCookie('csrftoken')
//             }
//         });

//         const data = await response.json();
//         console.log('Rides Data:', data);

//         const ridesList = document.getElementById('rides-list');
//         ridesList.innerHTML = ''; // Clear previous results

//         if (data.success && data.rides && data.rides.length > 0) {
//             data.rides.forEach(ride => {
//                 const rideElement = document.createElement('div');
//                 rideElement.classList.add('ride-item');
//                 rideElement.innerHTML = `
//                     <h3>Driver: ${ride.name}</h3>
//                     <p>Car: ${ride.car_model}</p>
//                     <p>Seats Available: ${ride.seats_available}</p>
//                     <p>Route: ${ride.route}</p>
//                     <p>Timing: ${ride.timing}</p>
//                     <button onclick="bookRide('${ride.username}')">Book Ride</button>
//                 `;
//                 ridesList.appendChild(rideElement);
//             });
//         } else {
//             ridesList.innerHTML = '<p>No rides available</p>';
//         }
//     } catch (error) {
//         console.error('Search rides error:', error);
//     }
// });

// // Book Ride
// async function bookRide(driverUsername) {
//     try {
//         const riderUsername = localStorage.getItem('username');
//         const response = await fetch('/api/book-ride/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': getCookie('csrftoken')
//             },
//             body: JSON.stringify({
//                 rider_username: riderUsername,
//                 driver_username: driverUsername
//             })
//         });

//         const data = await response.json();
//         console.log('Book Ride Response:', data);

//         if (data.success) {
//             alert('Ride booked successfully!');
//             fetchMyBookings(); // Refresh bookings
//         } else {
//             alert(data.message || 'Booking failed');
//         }
//     } catch (error) {
//         console.error('Book ride error:', error);
//     }
// }

// // Fetch My Bookings
// async function fetchMyBookings() {
//     try {
//         const username = localStorage.getItem('username');
//         const response = await fetch(`/api/rider/bookings/?username=${username}`, {
//             method: 'GET',
//             headers: {
//                 'X-CSRFToken': getCookie('csrftoken')
//             }
//         });

//         const data = await response.json();
//         console.log('Bookings Data:', data);

//         const bookingsList = document.getElementById('bookings-list');
//         bookingsList.innerHTML = ''; // Clear previous results

//         if (data.success && data.bookings && data.bookings.length > 0) {
//             data.bookings.forEach(booking => {
//                 const bookingElement = document.createElement('div');
//                 bookingElement.classList.add('booking-item');
//                 bookingElement.innerHTML = `
//                     <h3>Booking with ${booking.driver_name}</h3>
//                     <p>Car: ${booking.car_model}</p>
//                     <p>Booking Time: ${booking.created_at}</p>
//                     <button onclick="cancelBooking('${booking.id}')">Cancel Booking</button>
//                 `;
//                 bookingsList.appendChild(bookingElement);
//             });
//         } else {
//             bookingsList.innerHTML = '<p>No bookings found</p>';
//         }
//     } catch (error) {
//         console.error('Fetch bookings error:', error);
//     }
// }

// // Cancel Booking
// async function cancelBooking(bookingId) {
//     try {
//         const response = await fetch('/api/cancel-booking/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': getCookie('csrftoken')
//             },
//             body: JSON.stringify({ booking_id: bookingId })
//         });

//         const data = await response.json();
//         console.log('Cancel Booking Response:', data);

//         if (data.success) {
//             alert('Booking cancelled successfully!');
//             fetchMyBookings(); // Refresh bookings
//         } else {
//             alert(data.message || 'Cancellation failed');
//         }
//     } catch (error) {
//         console.error('Cancel booking error:', error);
//     }
// }

// // Initial Load
// document.addEventListener('DOMContentLoaded', () => {
//     const username = localStorage.getItem('username');
//     const userType = localStorage.getItem('user_type');

//     if (!username || userType !== 'Rider') {
//         window.location.href = '/login/';
//     } else {
//         fetchRiderProfile();
//         fetchMyBookings();
//     }
// });

// Search Rides Functionality
async function searchRides() {
    const pickupLocation = document.getElementById('pickup-location').value;
    const pickupTime = document.getElementById('pickup-time').value;
    const carMake = document.getElementById('car-make').value;

    try {
        const response = await fetch(`/api/rider/search-rides/?pickup_location=${pickupLocation}&pickup_time=${pickupTime}&car_make=${carMake}`, {
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
        }
    } catch (error) {
        console.error('Search rides error:', error);
        alert('An error occurred while searching for rides');
    }
}

function displayRides(rides) {
    const ridesList = document.getElementById('rides-list');
    ridesList.innerHTML = ''; // Clear previous results

    if (rides.length === 0) {
        ridesList.innerHTML = '<p>No rides found</p>';
        return;
    }

    rides.forEach(ride => {
        const rideElement = document.createElement('div');
        rideElement.classList.add('ride-item');
        rideElement.innerHTML = `
            <h3>Driver: ${ride.name}</h3>
            <p>Car Model: ${ride.car_model}</p>
            <p>Seats Available: ${ride.seats_available}</p>
            <p>Route: ${ride.route}</p>
            <p>Timing: ${ride.timing}</p>
            <button onclick="bookRide('${ride.username}')">Book Ride</button>
        `;
        ridesList.appendChild(rideElement);
    });
}

// Fetch Rider Location
async function fetchRiderLocation() {
    try {
        const username = localStorage.getItem('username');
        const response = await fetch(`/api/rider/location/?username=${username}`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('current-location').textContent = data.pickup_location;
        } else {
            console.error('Location fetch error:', data.message);
        }
    } catch (error) {
        console.error('Location fetch error:', error);
    }
}

// Fetch Rider Rating
async function fetchRiderRating() {
    try {
        const username = localStorage.getItem('username');
        const response = await fetch(`/api/rider/rating/?username=${username}`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('rider-rating').textContent = data.rating.toFixed(2);
        } else {
            console.error('Rating fetch error:', data.message);
        }
    } catch (error) {
        console.error('Rating fetch error:', error);
    }
}

// Cancel Booking
async function cancelBooking() {
    try {
        const username = localStorage.getItem('username');
        const response = await fetch('/api/rider/cancel-booking/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (data.success) {
            alert('Booking cancelled successfully');
            fetchRiderBookings(); // Refresh bookings
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Cancel booking error:', error);
        alert('An error occurred while cancelling the booking');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-rides-btn').addEventListener('click', searchRides);
    
    // Initial load of rider-specific data
    fetchRiderLocation();
    fetchRiderRating();
    fetchRiderBookings();
});