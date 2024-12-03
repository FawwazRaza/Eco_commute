// // document.addEventListener('DOMContentLoaded', () => {
// //     // Utility function to get CSRF token
// //     function getCookie(name) {
// //         let cookieValue = null;
// //         if (document.cookie && document.cookie !== '') {
// //             const cookies = document.cookie.split(';');
// //             for (let i = 0; i < cookies.length; i++) {
// //                 const cookie = cookies[i].trim();
// //                 if (cookie.substring(0, name.length + 1) === (name + '=')) {
// //                     cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
// //                     break;
// //                 }
// //             }
// //         }
// //         return cookieValue;
// //     }

// //     // Logout Functionality
// //     document.getElementById('logout-btn')?.addEventListener('click', async () => {
// //         try {
// //             const response = await fetch('/api/logout/', {
// //                 method: 'POST',
// //                 headers: {
// //                     'X-CSRFToken': getCookie('csrftoken'),
// //                     'Content-Type': 'application/json'
// //                 }
// //             });
// //             const data = await response.json();
            
// //             if (data.success) {
// //                 localStorage.removeItem('username');
// //                 localStorage.removeItem('user_type');
// //                 window.location.href = '/login/';
// //             } else {
// //                 alert('Logout failed');
// //             }
// //         } catch (error) {
// //             console.error('Logout error:', error);
// //             alert('An error occurred during logout');
// //         }
// //     });

// //     // Fetch Driver Profile
// //     async function fetchDriverProfile() {
// //         try {
// //             const username = localStorage.getItem('username');
            
// //             if (!username) {
// //                 console.error('No username found');
// //                 window.location.href = '/login/';
// //                 return;
// //             }

// //             const response = await fetch(`/api/driver/profile/?username=${username}`, {
// //                 method: 'GET',
// //                 headers: {
// //                     'X-CSRFToken': getCookie('csrftoken')
// //                 }
// //             });

// //             const data = await response.json();
// //             console.log('Profile Data:', data);

// //             if (data.success) {
// //                 document.getElementById('profile-name').textContent = `Name: ${data.profile.name}`;
// //                 document.getElementById('profile-email').textContent = `Email: ${data.profile.email}`;
// //                 document.getElementById('profile-phone').textContent = `Phone: ${data.profile.phone}`;
// //                 document.getElementById('profile-car-model').textContent = `Car Model: ${data.profile.car_model}`;
// //                 document.getElementById('profile-car-license').textContent = `Car License: ${data.profile.car_license}`;
// //                 document.getElementById('profile-seats').textContent = `Seats Available: ${data.profile.seats_available}`;
// //                 document.getElementById('profile-route').textContent = `Route: ${data.profile.route}`;
// //                 document.getElementById('profile-schedule').textContent = `Schedule: ${data.profile.schedule}`;
// //             } else {
// //                 console.error('Failed to fetch profile');
// //             }
// //         } catch (error) {
// //             console.error('Profile fetch error:', error);
// //         }
// //     }

// //     // Fetch Driver Bookings
// //     async function fetchDriverBookings() {
// //         try {
// //             const username = localStorage.getItem('username');
            
// //             if (!username) {
// //                 console.error('No username found');
// //                 window.location.href = '/login/';
// //                 return;
// //             }

// //             const response = await fetch(`/api/driver/bookings/?username=${username}`, {
// //                 method: 'GET',
// //                 headers: {
// //                     'X-CSRFToken': getCookie('csrftoken'),
// //                     'Content-Type': 'application/json'
// //                 }
// //             });

// //             const data = await response.json();
// //             console.log('Driver Bookings Data:', data);

// //             const bookingsList = document.getElementById('bookings-list');
// //             bookingsList.innerHTML = ''; // Clear previous results

// //             if (data.success && data.bookings && data.bookings.length > 0) {
// //                 data.bookings.forEach(booking => {
// //                     const bookingElement = document.createElement('div');
// //                     bookingElement.classList.add('booking-item');
// //                     bookingElement.innerHTML = `
// //                         <div class="booking-details">
// //                             <h3>Booking with ${booking.rider_name}</h3>
// //                             <p>Rider Username: ${booking.rider_username}</p>
// //                             <p>Booking Time: ${booking.created_at}</p>
// //                             <div class="booking-actions">
// //                                 <button onclick="cancelBooking(${booking.id})">Cancel Booking</button>
// //                                 <button onclick="createRiderRatingModal('${booking.rider_username}')">Rate Rider</button>
// //                             </div>
// //                         </div>
// //                     `;
// //                     bookingsList.appendChild(bookingElement);
// //                 });
// //             } else {
// //                 bookingsList.innerHTML = '<p>No bookings found</p>';
// //             }
// //         } catch (error) {
// //             console.error('Fetch driver bookings error:', error);
// //             document.getElementById('bookings-list').innerHTML = '<p>Error fetching bookings</p>';
// //         }
// //     }

// //     // Create Rider Rating Modal
// //     window.createRiderRatingModal = function(riderUsername) {
// //         const ratingsList = document.getElementById('rider-ratings-list');
// //         ratingsList.innerHTML = `
// //             <div class="rating-modal">
// //                 <h3>Rate Rider</h3>
// //                 <form id="rider-rating-form">
// //                     <div class="rating-stars">
// //                         <input type="radio" name="rating" value="1" id="star1">
// //                         <label for="star1">★</label>
// //                         <input type="radio" name="rating" value="2" id="star2">
// //                         <label for="star2">★</label>
// //                         <input type="radio" name="rating" value="3" id="star3">
// //                         <label for="star3">★</label>
// //                         <input type="radio" name="rating" value="4" id="star4">
// //                         <label for="star4">★</label>
// //                         <input type="radio" name="rating" value="5" id="star5">
// //                         <label for="star5">★</label>
// //                     </div>
// //                     <textarea id="rating-feedback" placeholder="Optional feedback"></textarea>
// //                     <div class="rating-actions">
// //                         <button type="button" onclick="submitRiderRating('${riderUsername}')">Submit Rating</button>
// //                         <button type="button" onclick="closeRatingModal()">Cancel</button>
// //                     </div>
// //                 </form>
// //             </div>
// //         `;
// //     }

// //     // Submit Rider Rating
// //     window.submitRiderRating = async function(riderUsername) {
// //         try {
// //             const selectedRating = document.querySelector('input[name="rating"]:checked');
// //             const feedbackElement = document.getElementById('rating-feedback');
            
// //             if (!selectedRating) {
// //                 alert('Please select a rating');
// //                 return;
// //             }

// //             const response = await fetch('/api/driver/rate-rider/', {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                     'X-CSRFToken': getCookie('csrftoken')
// //                 },
// //                 body: JSON.stringify({
// //                     from_username: localStorage.getItem('username'),
// //                     to_username: riderUsername,
// //                     score: parseInt(selectedRating.value),
// //                     feedback: feedbackElement.value || ''
// //                 })
// //             });

// //             const data = await response.json();

// //             if (data.success) {
// //                 alert('Rating submitted successfully');
// //                 closeRatingModal();
// //             } else {
// //                 alert('Failed to submit rating');
// //             }
// //         } catch (error) {
// //             console.error('Rating submission error:', error);
// //             alert('An error occurred while submitting rating');
// //         }
// //     }

// //     // Close Rating Modal
// //     window.closeRatingModal = function() {
// //         const ratingsList = document.getElementById('rider-ratings-list');
// //         ratingsList.innerHTML = '';
// //     }

// //     // Cancel Booking
// //     window.cancelBooking = async function(bookingId) {
// //         try {
// //             const response = await fetch('/api/cancel-booking/', {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                     'X-CSRFToken': getCookie('csrftoken')
// //                 },
// //                 body: JSON.stringify({ booking_id: bookingId })
// //             });

// //             const data = await response.json();
// //             console.log('Cancel Booking Response:', data);

// //             if (data.success) {
// //                 alert('Booking cancelled successfully!');
// //                 fetchDriverBookings(); // Refresh bookings
// //             } else {
// //                 alert(data.message || 'Cancellation failed');
// //             }
// //         } catch (error) {
// //             console.error('Cancel booking error:', error);
// //         }
// //     }

// //     // Initial Load
// //     const username = localStorage.getItem('username');
// //     const userType = localStorage.getItem('user_type');

// //     if (!username || userType !== 'Driver') {
// //         window.location.href = '/login/';
// //     } else {
// //         fetchDriverProfile();
// //         fetchDriverBookings();
// //     }
// // });
// // Fetch Driver Bookings with multiple identifier support
// async function fetchDriverBookings() {
//     try {
//         // Try to get username and name from localStorage or profile
//         const username = localStorage.getItem('username');
//         const name = localStorage.getItem('name');
        
//         if (!username && !name) {
//             console.error('No identifier found');
//             document.getElementById('bookings-list').innerHTML = '<p>Unable to fetch bookings</p>';
//             return;
//         }

//         // Construct URL with multiple identifiers
//         const url = new URL('/api/driver/bookings/', window.location.origin);
//         const params = new URLSearchParams();
        
//         if (username) params.append('username', username);
//         if (name) params.append('name', name);
        
//         url.search = params.toString();

//         const response = await fetch(url.toString(), {
//             method: 'GET',
//             headers: {
//                 'X-CSRFToken': getCookie('csrftoken'),
//                 'Content-Type': 'application/json'
//             }
//         });

//         const data = await response.json();
//         console.log('Driver Bookings Data:', data);

//         const bookingsList = document.getElementById('bookings-list');
//         bookingsList.innerHTML = ''; // Clear previous results

//         if (data.success && data.bookings && data.bookings.length > 0) {
//             data.bookings.forEach(booking => {
//                 const bookingElement = document.createElement('div');
//                 bookingElement.classList.add('booking-item');
//                 bookingElement.innerHTML = `
//                     <div class="booking-details">
//                         <h3>Booking with ${booking.rider_name}</h3>
//                         <p>Rider Username: ${booking.rider_username}</p>
//                         <p>Booking Time: ${booking.created_at}</p>
//                         <div class="booking-actions">
//                             <button onclick="cancelBooking(${booking.id})">Cancel Booking</button>
//                             <button onclick="rateRider('${booking.rider_username}')">Rate Rider</button>
//                         </div>
//                     </div>
//                 `;
//                 bookingsList.appendChild(bookingElement);
//             });
//         } else {
//             bookingsList.innerHTML = '<p>No bookings found</p>';
//         }
//     } catch (error) {
//         console.error('Fetch driver bookings error:', error);
//         document.getElementById('bookings-list').innerHTML = '<p>Error fetching bookings</p>';
//     }
// }

// // Modify the DOMContentLoaded event listener to store name in localStorage
// document.addEventListener('DOMContentLoaded', () => {
//     const username = localStorage.getItem('username');
//     const userType = localStorage.getItem('user_type');

//     if (!username || userType !== 'Driver') {
//         window.location.href = '/login/';
//         return;
//     }

//     // Fetch driver profile first to ensure name is available
//     fetchDriverProfile().then(() => {
//         // Fetch bookings after profile is loaded
//         fetchDriverBookings();
//     });

//     // Add logout event listener
//     document.getElementById('logout-btn')?.addEventListener('click', async () => {
//         try {
//             const response = await fetch('/api/logout/', {
//                 method: 'POST',
//                 headers: {
//                     'X-CSRFToken': getCookie('csrftoken'),
//                     'Content-Type': 'application/json'
//                 }
//             });

//             const data = await response.json();
            
//             if (data.success) {
//                 localStorage.removeItem('username');
//                 localStorage.removeItem('name');
//                 localStorage.removeItem('user_type');
//                 window.location.href = '/login/';
//             } else {
//                 alert('Logout failed');
//             }
//         } catch (error) {
//             console.error('Logout error:', error);
//             alert('An error occurred during logout');
//         }
//     });
// });

// // Modify fetchDriverProfile to store name in localStorage
// async function fetchDriverProfile() {
//     try {
//         const username = localStorage.getItem('username');
        
//         if (!username) {
//             console.error('No username found');
//             window.location.href = '/login/';
//             return;
//         }

//         const response = await fetch(`/api/driver/profile/?username=${username}`, {
//             method: 'GET',
//             headers: {
//                 'X-CSRFToken': getCookie('csrftoken')
//             }
//         });

//         const data = await response.json();

//         if (data.success) {
//             const profile = data.profile;
            
//             // Store name in localStorage
//             localStorage.setItem('name', profile.name);

//             // Update profile details
//             document.getElementById('profile-username').textContent = profile.username || 'N/A';
//             document.getElementById('profile-name').textContent = profile.name || 'N/A';
//             document.getElementById('profile-email').textContent = profile.email || 'N/A';
//             document.getElementById('profile-phone').textContent = profile.phone || 'N/A';
//             document.getElementById('profile-car-model').textContent = profile.car_model || 'N/A';
//             document.getElementById('profile-car-license').textContent = profile.car_license || 'N/A';
//             document.getElementById('profile-seats').textContent = profile.seats_available || 'N/A';
//             document.getElementById('profile-route').textContent = profile.route || 'N/A';
//             document.getElementById('profile-schedule').textContent = profile.schedule || 'N/A';

//             return profile;
//         } else {
//             console.error('Failed to fetch driver profile:', data.message);
//             return null;
//         }
//     } catch (error) {
//         console.error('Profile fetch error:', error);
//         return null;
//     }
// }
// Function to get CSRF token
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

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const userType = localStorage.getItem('user_type');

    // Check if user is logged in and is a driver
    if (!username || userType !== 'Driver') {
        window.location.href = '/login/';
        return;
    }

    // Fetch driver profile
    fetchDriverProfile().then(() => {
        // You can add additional actions after profile is loaded if needed
        console.log('Driver profile loaded');
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/logout/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                
                if (data.success) {
                    // Clear all stored user data
                    localStorage.removeItem('username');
                    localStorage.removeItem('name');
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
    }
});

// Function to fetch driver profile
async function fetchDriverProfile() {
    try {
        const username = localStorage.getItem('username');
        
        if (!username) {
            console.error('No username found');
            window.location.href = '/login/';
            return null;
        }

        const response = await fetch(`/api/driver/profile/?username=${username}`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        const data = await response.json();

        if (data.success) {
            const profile = data.profile;
            
            // Store name in localStorage
            localStorage.setItem('name', profile.name);

            // Update profile details
            updateProfileUI(profile);

            return profile;
        } else {
            console.error('Failed to fetch driver profile:', data.message);
            alert(data.message || 'Failed to load profile');
            return null;
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        alert('An error occurred while fetching profile');
        return null;
    }
}

// Function to update UI with profile details
function updateProfileUI(profile) {
    // Helper function to set text content safely
    const setElementText = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || 'N/A';
        }
    };

    // Update all profile fields
    setElementText('profile-username', profile.username);
    setElementText('profile-name', profile.name);
    setElementText('profile-email', profile.email);
    setElementText('profile-phone', profile.phone);
    setElementText('profile-car-model', profile.car_model);
    setElementText('profile-car-license', profile.car_license);
    setElementText('profile-seats', profile.seats_available);
    
    // Special handling for route (might be an array)
    const routeElement = document.getElementById('profile-route');
    if (routeElement) {
        routeElement.textContent = Array.isArray(profile.route) 
            ? profile.route.join(', ') 
            : (profile.route || 'N/A');
    }

    setElementText('profile-schedule', profile.schedule);
}