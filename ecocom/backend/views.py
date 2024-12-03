import json
import logging
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Avg
from django.contrib.auth import logout
from .models import Person, Rider, Driver, Booking, Rating
from .database import DriverDatabase, RiderDatabase

# Setup logger
logger = logging.getLogger(__name__)

@csrf_protect
@require_http_methods(["POST"])
@csrf_protect
@require_http_methods(["POST"])
def login_view(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user_type = data.get('user_type')

        # Validate input
        if not all([username, password, user_type]):
            return JsonResponse({
                'success': False, 
                'message': 'Missing username, password, or user type'
            })

        # Choose appropriate database interface based on user type
        if user_type == 'Driver':
            db = DriverDatabase()
        else:
            db = RiderDatabase()

        # Set person_type for authentication
        db.person_type = user_type

        # Authenticate user
        if db.authenticateLogin(username, password):
            # Create session or token (simplified for this example)
            request.session['username'] = username
            request.session['user_type'] = user_type
            
            return JsonResponse({
                'success': True, 
                'message': 'Login successful',
                'user_type': user_type
            })
        else:
            return JsonResponse({
                'success': False, 
                'message': 'Invalid credentials'
            })
    except Exception as e:
        print(f"Login error: {e}")
        return JsonResponse({
            'success': False, 
            'message': f'Unexpected error: {str(e)}'
        })
    
@csrf_protect
@require_http_methods(["POST"])
def logout_view(request):
    try:
        # Django logout
        logout(request)
        
        # Clear session
        request.session.flush()
        
        return JsonResponse({
            'success': True, 
            'message': 'Logged out successfully'
        })
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'message': str(e)
        })
    



@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['username', 'name', 'email', 'phone', 'password', 'person_type']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({
                        'success': False, 
                        'message': f'Missing required field: {field}'
                    }, status=400)
            
            # Create Person object
            person = Person(
                username=data['username'],
                name=data['name'],
                email=data['email'],
                phone=data['phone'],
                password=data['password'],
                person_type=data['person_type']
            )
            
            # Validate and save Person
            person.full_clean()
            person.save()
            
            # Create additional profile based on person type
            if data['person_type'] == 'Driver':
                # Validate driver-specific fields
                driver_fields = ['car_model', 'car_license', 'seats_available']
                for field in driver_fields:
                    if field not in data:
                        # Rollback person creation if driver fields are missing
                        person.delete()
                        return JsonResponse({
                            'success': False, 
                            'message': f'Missing driver field: {field}'
                        }, status=400)
                
                # Create Driver profile
                driver = Driver(
                    person=person,
                    car_model=data['car_model'],
                    car_license=data['car_license'],
                    seats_available=data['seats_available'],
                    route=data.get('route', []),
                    timing=data.get('timing', '')
                )
                driver.save()
            
            elif data['person_type'] == 'Rider':
                # Create Rider profile
                rider = Rider(
                    person=person,
                    pickup_location=data.get('pickup_location', '')
                )
                rider.save()
            
            return JsonResponse({
                'success': True, 
                'message': 'Registration successful'
            })
        
        except Exception as e:
            # Comprehensive error handling
            return JsonResponse({
                'success': False, 
                'message': str(e)
            }, status=500)
    
    # Handle non-POST requests
    return JsonResponse({
        'success': False, 
        'message': 'Invalid request method'
    }, status=405)



@csrf_protect
@require_http_methods(["GET"])
def search_rides(request):
    try:
        pickup_location = request.GET.get('pickup_location')
        pickup_time = request.GET.get('pickup_time')
        
        db = RiderDatabase()
        rides = db.searchRides(
            pickup_location=pickup_location, 
            picktime=pickup_time
        )
        
        return JsonResponse({'success': True, 'rides': rides})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})


@csrf_protect
@require_http_methods(["GET"])
def rider_profile_view(request):
    try:
        # Get username from the request
        username = request.GET.get('username')
        
        if not username:
            return JsonResponse({
                'success': False,
                'message': 'Username is required'
            }, status=400)
        
        # Use RiderDatabase to fetch profile data
        rider_db = RiderDatabase()
        profile_data = rider_db.getProfileData(username)
        
        # Check if profile data was successfully retrieved
        if isinstance(profile_data, dict) and 'error' in profile_data:
            return JsonResponse({
                'success': False,
                'message': profile_data.get('error', 'Profile not found')
            }, status=404)
        
        # Prepare the response with full profile details
        return JsonResponse({
            'success': True,
            'profile': {
                'username': profile_data.get('username', 'N/A'),
                'name': profile_data.get('name', 'N/A'),
                'email': profile_data.get('email', 'N/A'),
                'phone': profile_data.get('phone', 'N/A'),
                'pickup_location': profile_data.get('pickup_location', 'N/A')
            }
        })
    
    except Exception as e:
        # Log the full error
        import traceback
        traceback.print_exc()
        
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500) 

@csrf_protect
@require_http_methods(["GET"])
def rider_bookings_view(request):
    try:
        username = request.GET.get('username')
        
        # Use RiderDatabase to fetch bookings
        rider_db = RiderDatabase()
        
        # Fetch bookings
        bookings = rider_db.getBookings(username)
        
        # If no bookings found or error occurred
        if bookings is None:
            return JsonResponse({
                'success': False,
                'message': 'No bookings found'
            })
        
        # Convert bookings to a list of dictionaries
        booking_list = []
        for booking in bookings:
            booking_list.append({
                'id': booking.id,
                'driver_name': booking.driver.person.name,
                'driver_username': booking.driver.person.username,
                'car_model': booking.driver.car_model,
                'created_at': booking.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return JsonResponse({
            'success': True,
            'bookings': booking_list
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })

@csrf_protect
@require_http_methods(["POST"])
def book_ride_view(request):
    try:
        data = json.loads(request.body)
        rider_username = data.get('rider_username')
        driver_username = data.get('driver_username')
        
        try:
            # Fetch Rider and Driver
            rider = Rider.objects.get(person__username=rider_username)
            driver = Driver.objects.get(person__username=driver_username)
            
            # Check if driver has available seats
            if driver.seats_available > 0:
                # Create booking
                booking = Booking.objects.create(driver=driver)
                booking.riders.add(rider)
                
                # Reduce available seats
                driver.seats_available -= 1
                driver.save()
                
                return JsonResponse({
                    'success': True, 
                    'message': 'Ride booked successfully'
                })
            else:
                return JsonResponse({
                    'success': False, 
                    'message': 'No seats available'
                })
        except (Rider.DoesNotExist, Driver.DoesNotExist):
            return JsonResponse({
                'success': False, 
                'message': 'Rider or Driver not found'
            })
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'message': str(e)
        })

@csrf_protect
@require_http_methods(["POST"])
def cancel_booking_view(request):
    try:
        data = json.loads(request.body)
        booking_id = data.get('booking_id')
        
        try:
            # Fetch and delete booking
            booking = Booking.objects.get(id=booking_id)
            driver = booking.driver
            
            # Increase available seats
            driver.seats_available += 1
            driver.save()
            
            # Remove rider from booking
            booking.delete()
            
            return JsonResponse({
                'success': True, 
                'message': 'Booking cancelled successfully'
            })
        except Booking.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'message': 'Booking not found'
            })
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'message': str(e)
        })

@csrf_exempt
@require_http_methods(["GET"])
def search_rides_view(request):
    try:
        # Get search parameters
        pickup_location = request.GET.get('pickup_location', '').lower()
        car_make = request.GET.get('car_make', '').lower()
        
        # Use RiderDatabase to search rides
        rider_db = RiderDatabase()
        rides = rider_db.searchRides(
            pickup_location=pickup_location, 
            carMake=car_make
        )
        
        # Return search results
        return JsonResponse({
            'success': True, 
            'rides': rides
        })
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'message': str(e)
        })

@csrf_protect
@require_http_methods(["POST"])
def book_ride(request):
    try:
        data = json.loads(request.body)
        rider_username = data.get('rider_username')
        driver_username = data.get('driver_username')
        
        db = RiderDatabase()
        success = db.storeBooking(rider_username, driver_username)
        
        if success:
            return JsonResponse({'success': True, 'message': 'Ride booked successfully'})
        else:
            return JsonResponse({'success': False, 'message': 'Booking failed'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})


#driver dashboard  -----------------------------------------------------------------------
def driver_profile_view(request):
    try:
        # Get username from request
        username = request.GET.get('username')
        
        # Initialize DriverDatabase
        driver_db = DriverDatabase()
        
        # Fetch profile data
        profile_data = driver_db.getProfileData(username)
        
        if 'error' not in profile_data:
            return JsonResponse({
                'success': True,
                'profile': profile_data
            })
        else:
            return JsonResponse({
                'success': False,
                'message': profile_data['error']
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })
    
# def driver_bookings_view(request):
#     """
#     Fetch driver's current bookings with multiple identifier support
#     """
#     try:
#         # Try to get username, if not present try name
#         username = request.GET.get('username')
#         name = request.GET.get('name')
        
#         # Use username if available, otherwise use name
#         identifier = username or name
        
#         if not identifier:
#             return JsonResponse({
#                 'success': False,
#                 'message': 'Username or name is required'
#             }, status=400)
        
#         # Initialize DriverDatabase
#         driver_db = DriverDatabase()
        
#         # Fetch bookings using flexible identifier
#         bookings = driver_db.getBookings(username)
        
#         # Convert bookings to a list of dictionaries
#         booking_list = []
#         for booking in bookings:
#             # Ensure we have at least one rider
#             if booking.riders.exists():
#                 rider = booking.riders.first()
#                 booking_list.append({
#                     'id': booking.id,
#                     'rider_name': rider.person.name,
#                     'rider_username': rider.person.username,
#                     'created_at': booking.created_at.strftime("%Y-%m-%d %H:%M:%S")
#                 })
        
#         # Return bookings or indicate no bookings found
#         return JsonResponse({
#             'success': True,
#             'bookings': booking_list
#         })
#     except Exception as e:
#         return JsonResponse({
#             'success': False,
#             'message': str(e)
#         })

# def driver_bookings_view(request):
#     """
#     Fetch driver's current bookings with multiple identifier support
#     """
#     try:
#         # Try to get username, if not present try name
#         username = request.GET.get('username')
#         name = request.GET.get('name')
        
#         # Use username if available, otherwise use name
#         identifier = username or name
        
#         if not identifier:
#             return JsonResponse({
#                 'success': False,
#                 'message': 'Username or name is required'
#             }, status=400)
        
#         # Initialize DriverDatabase
#         driver_db = DriverDatabase()
        
#         # Fetch bookings using flexible identifier
#         bookings = driver_db.getBookings(identifier)  # Changed from 'username' to 'identifier'
        
#         # Convert QuerySet to a list of dictionaries
#         booking_list = []
#         for booking in bookings:  # Directly iterate over QuerySet
#             # Ensure we have at least one rider
#             if booking.riders.exists():
#                 rider = booking.riders.first()
#                 booking_list.append({
#                     'id': booking.id,
#                     'rider_name': rider.person.name,
#                     'rider_username': rider.person.username,
#                     'created_at': booking.created_at.strftime("%Y-%m-%d %H:%M:%S")
#                 })
        
#         # Return bookings or indicate no bookings found
#         return JsonResponse({
#             'success': True,
#             'bookings': booking_list
#         })
#     except Exception as e:
#         return JsonResponse({
#             'success': False,
#             'message': str(e)
#         }, status=500)

@csrf_protect
@require_http_methods(["GET"])
def driver_bookings_view(request):
    """
    Fetch driver's current bookings with detailed rider information
    """
    try:
        username = request.GET.get('username')
        
        if not username:
            return JsonResponse({
                'success': False,
                'message': 'Username is required'
            }, status=400)
        
        # Initialize DriverDatabase
        driver_db = DriverDatabase()
        
        # Fetch bookings using the getBookings method
        bookings = driver_db.getBookings(username)
        
        # Convert bookings to a list of dictionaries with detailed information
        booking_list = []
        for booking in bookings:
            # Fetch rider details for each booking
            rider = booking.riders.first()  # Assuming one rider per booking
            
            booking_info = {
                'id': booking.id,
                'driver_username': booking.driver.person.username,
                'driver_name': booking.driver.person.name,
                'rider_username': rider.person.username,
                'rider_name': rider.person.name,
                'rider_email': rider.person.email,
                'rider_phone': rider.person.phone,
                'rider_pickup_location': rider.pickup_location,
                'created_at': booking.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
            booking_list.append(booking_info)
        
        return JsonResponse({
            'success': True,
            'bookings': booking_list
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


def cancel_booking_view(request):
    """
    Cancel a specific booking
    """
    try:
        # Parse booking ID from request
        booking_id = request.POST.get('booking_id')
        
        # Initialize DriverDatabase
        driver_db = DriverDatabase()
        
        # Delete booking
        result = driver_db.deleteBooking(booking_id)
        
        if result:
            return JsonResponse({
                'success': True,
                'message': 'Booking cancelled successfully'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Failed to cancel booking'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })

def update_driver_profile_view(request):
    """
    Update driver profile information
    """
    try:
        # Get updated profile data from request
        username = request.POST.get('username')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        car_model = request.POST.get('car_model')
        route = request.POST.get('route')
        
        # Initialize DriverDatabase
        driver_db = DriverDatabase()
        
        # Update profile methods
        email_updated = driver_db.setEmail(username, email)
        phone_updated = driver_db.setPhone(username, phone)
        car_model_updated = driver_db.setCarModel(username, car_model)
        route_updated = driver_db.setRoute(username, route)
        
        if email_updated and phone_updated and car_model_updated and route_updated:
            return JsonResponse({
                'success': True,
                'message': 'Profile updated successfully'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Failed to update profile'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })
    

def driver_bookings_view(request):
    """
    Fetch driver's current bookings
    """
    try:
        username = request.GET.get('username')
        driver_db = DriverDatabase()
        
        # Assuming you have a method to get driver bookings
        bookings = driver_db.getBookings(username)
        
        return JsonResponse({
            'success': True,
            'bookings': bookings
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })

@csrf_exempt
def driver_cancel_booking_view(request):
    """
    Cancel a specific booking
    """
    try:
        # Parse booking ID from request
        data = json.loads(request.body)
        booking_id = data.get('booking_id')
        
        # Initialize DriverDatabase
        driver_db = DriverDatabase()
        
        # Delete booking
        result = driver_db.deleteBooking(booking_id)
        
        if result:
            return JsonResponse({
                'success': True,
                'message': 'Booking cancelled successfully'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Failed to cancel booking'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })

def driver_rate_rider_view(request):
    """
    Store rating for a rider
    """
    try:
        data = json.loads(request.body)
        from_username = data.get('from_username')
        to_username = data.get('to_username')
        score = data.get('score')
        feedback = data.get('feedback', '')
        
        driver_db = DriverDatabase()
        
        result = driver_db.storeRating(from_username, to_username, score, feedback)
        
        if result:
            return JsonResponse({
                'success': True,
                'message': 'Rating stored successfully'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Failed to store rating'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })

def rider_bookings_view(request):
    """
    Fetch rider's current bookings
    """
    try:
        username = request.GET.get('username')
        rider_db = RiderDatabase()
        
        bookings = rider_db.getBookings(username)
        
        # Convert bookings to a list of dictionaries
        booking_list = []
        for booking in bookings:
            booking_list.append({
                'id': booking.id,
                'driver_name': booking.driver.person.name,
                'driver_username': booking.driver.person.username,
                'created_at': booking.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return JsonResponse({
            'success': True,
            'bookings': booking_list
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })

@csrf_exempt
@require_http_methods(["POST"])
def rider_cancel_booking_view(request):
    """
    Cancel a specific booking for a rider
    """
    try:
        # Parse booking ID from request body
        data = json.loads(request.body)
        booking_id = data.get('booking_id')
        
        if not booking_id:
            return JsonResponse({
                'success': False,
                'message': 'Booking ID is required'
            }, status=400)
        
        # Initialize RiderDatabase
        rider_db = RiderDatabase()
        
        # Delete specific booking
        result = rider_db.deleteBooking(booking_id)
        
        if result:
            return JsonResponse({
                'success': True,
                'message': 'Booking cancelled successfully'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Failed to cancel booking'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })


@csrf_exempt
@require_http_methods(["GET"])
def search_rides_view(request):
    try:
        pickup_location = request.GET.get('pickup_location', '').lower()
        car_make = request.GET.get('car_make', '').lower()
        
        # Fetch drivers
        drivers = Driver.objects.filter(seats_available__gt=0)
        if pickup_location:
            drivers = drivers.filter(route__icontains=pickup_location)
        if car_make:
            drivers = drivers.filter(car_model__icontains=car_make)
        
        # Prepare response data
        rides_list = []
        for driver in drivers:
            ratings = Rating.objects.filter(to_person=driver.person)
            avg_rating = ratings.aggregate(Avg('score'))['score__avg'] if ratings.exists() else None
            rides_list.append({
                'username': driver.person.username,
                'name': driver.person.name,
                'car_model': driver.car_model,
                'seats_available': driver.seats_available,
                'route': driver.route,
                'timing': driver.timing,
                'average_rating': round(avg_rating, 2) if avg_rating else None,
            })
        
        return JsonResponse({'success': True, 'rides': rides_list})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

def rider_location_view(request):
    """
    Get rider's pickup location
    """
    try:
        username = request.GET.get('username')
        rider_db = RiderDatabase()
        
        location = rider_db.getLocation(username)
        
        if location:
            return JsonResponse({
                'success': True,
                'pickup_location': location
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Location not found'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })

def rider_rating_view(request):
    """
    Get rider's rating
    """
    try:
        username = request.GET.get('username')
        rider_db = RiderDatabase()
        
        rating = rider_db.getRating(username)
        
        return JsonResponse({
            'success': True,
            'rating': rating
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })