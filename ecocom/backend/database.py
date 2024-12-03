
from abc import ABC, abstractmethod
from backend.models import Person, Driver, Rider, Booking, Rating
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from datetime import time
from django.db.models import Avg

#Database Interfaces:
class DriverDatabaseInterface(ABC):
    @abstractmethod
    def registerDriver(self, data):
        pass
    #remaining function names

class RiderDatabaseInterface(ABC):
    @abstractmethod
    def register_rider(self, data):
        pass
    #add rest of functions here too

#Implementation Classes for databases+ 
class DriverDatabase(DriverDatabaseInterface):
    
    def authenticateLogin(self, username, password):
        try:
            # Fetch the person based on username
            try:
                person = Person.objects.get(username=username)
            except Person.DoesNotExist:
                print(f"User not found: {username}")
                return False
            
            # Simple password check (IMPORTANT: Use proper hashing in production)
            if person.password == password:
                # Additional check for user type
                if self.person_type == 'Driver':
                    try:
                        Driver.objects.get(person=person)
                    except Driver.DoesNotExist:
                        print(f"Driver profile not found for {username}")
                        return False
                elif self.person_type == 'Rider':
                    try:
                        Rider.objects.get(person=person)
                    except Rider.DoesNotExist:
                        print(f"Rider profile not found for {username}")
                        return False
                
                return True
            else:
                print(f"Invalid password for {username}")
                return False
        except Exception as e:
            print(f"Authentication error: {e}")
            return False
        
    def registerDriver(self, data):
        
        try:
            # Create Person object
            person = Person(
                username=data['username'],
                name=data['name'],
                email=data['email'],
                phone=data['phone'],
                password=data['password'],  # Assuming the password is plain text
                person_type='Driver'  # Assuming you have a 'person_type' field to differentiate users
            )
            person.save()

            # Create Driver object
            driver = Driver(
                person=person,
                car_model=data['car_model'],
                car_license=data['car_license'],
                seats_available=data['seats_available'],
                route=data['route'],  # Assuming this is a list of locations
                timing=data['timing']  # Schedule as a string
            )
            driver.save()

            return True
        except Exception as e:
            print(f"Error in registering driver: {e}")
            return False
    
    def getProfileData(self, username):
        try:
            # First, try fetching the Driver object
            driver = Driver.objects.get(person__username=username)
            
            # If Driver is found, prepare the driver profile data
            profile_data = {
                'username': driver.person.username,
                'name': driver.person.name,
                'email': driver.person.email,
                'phone': driver.person.phone,
                'car_model': driver.car_model,
                'car_license': driver.car_license,
                'seats_available': driver.seats_available,
                'route': driver.route,
                'schedule': driver.timing  # Driver's schedule
            }
            return profile_data
        except Driver.DoesNotExist:
            return None

    def setEmail(self, username, new_email):
            try:
                driver = Driver.objects.get(person__username=username)
                driver.person.email = new_email
                driver.person.save()
                return True
            except Driver.DoesNotExist:
                return False
            
    def setPhone(self, username, new_phone):
        try:
            driver = Driver.objects.get(person__username=username)
            driver.person.phone = new_phone
            driver.person.save()
            return True
        except Driver.DoesNotExist:
            return False

    def setCarModel(self, username, new_car_model):
        try:
            driver = Driver.objects.get(person__username=username)
            driver.car_model = new_car_model
            driver.save()
            return True
        except Driver.DoesNotExist:
            return False

    def setRoute(self, username, new_route):
        try:
            driver = Driver.objects.get(person__username=username)
            driver.route = new_route
            driver.save()
            return True
        except Driver.DoesNotExist:
            return False
        
    # def deleteBooking(self, driver_username, rider_username):
    #     try:
    #         # Fetch Rider and Driver objects based on their usernames
    #         rider = Rider.objects.get(person__username=rider_username)
    #         driver = Driver.objects.get(person__username=driver_username)

    #         # Find the bookings associated with both the rider and the driver
    #         bookings = Booking.objects.filter(driver=driver, riders=rider)

    #         if bookings.exists():
    #             bookings.delete()  # Delete the booking
    #             driver.seats_available += 1  # Increase available seats by 1 for the driver
    #             driver.save()  # Save the updated driver object
    #             return True  # Return True if deletion was successful
    #         else:
    #             return False  # No booking found for the given driver and rider
    #     except Rider.DoesNotExist:
    #         return False  # Rider not found
    #     except Driver.DoesNotExist:
    #         return False  # Driver not found
    #     except Exception as e:
    #         return False 

    def deleteBooking(self, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)
            driver = booking.driver
            
            # Increase available seats
            driver.seats_available += 1
            driver.save()
            
            # Delete booking
            booking.delete()
            return True
        except Booking.DoesNotExist:
            return False
        except Exception as e:
            print(f"Booking deletion error: {e}")
            return False

    def storeRating(self, from_username, to_username, score, feedback=""):
        
        try:
            # Validate the score range
            if score < 1 or score > 5:
                print("Score must be between 1 and 5.")
                return False

            # Retrieve Person objects for from_person and to_person
            from_person = Person.objects.get(username=from_username)
            to_person = Person.objects.get(username=to_username)

            # Create and save the rating
            Rating.objects.create(
                from_person=from_person,
                to_person=to_person,
                score=score,
                feedback=feedback
            )

            return True

        except Person.DoesNotExist as e:
            print(f"Error: {str(e)}")
            return False
        except Exception as e:
            print(f"An unexpected error occurred: {str(e)}")
            return False

    def setSchedule(self, username, new_schedule):
        try:
            driver = Driver.objects.get(person__username=username)
            driver.timing = new_schedule
            driver.save()
            return True
        except Driver.DoesNotExist:
            return False

    def getBookings(self, username):
            try:
                # Fetch the Person object associated with the given username
                person = Person.objects.get(username=username)
                
                # Fetch the Driver object associated with the Person
                driver = Driver.objects.get(person=person)
                
                # Fetch all bookings where the driver is associated
                bookings = Booking.objects.filter(driver=driver)
                
                # Return the Booking objects
                return bookings
            except Person.DoesNotExist:
                return None  # Handle case where Person does not exist
            except Driver.DoesNotExist:
                return None  # Handle case where Driver does not exist

class RiderDatabase(RiderDatabaseInterface):
    
    def getProfileData(self, username):
        try:
            # Fetch the Person object associated with the given username
            person = Person.objects.get(username=username)
            
            # Fetch the Rider object associated with the Person
            rider = Rider.objects.get(person=person)
            
            # Prepare and return the rider's profile data
            profile_data = {
                'username': person.username,
                'name': person.name,
                'email': person.email,
                'phone': person.phone,
                'pickup_location': rider.pickup_location or 'N/A',
            }
            print(f"Retrieved profile data for {username}: {profile_data}")
            
            return profile_data
        except Person.DoesNotExist:
            print(f"Person not found for username: {username}")
            return {"error": "Person not found"}
        except Rider.DoesNotExist:
            print(f"Rider profile not found for username: {username}")
            return {"error": "Rider profile not found"}
        except Exception as e:
            print(f"Unexpected error retrieving profile for {username}: {str(e)}")
            return {"error": str(e)}
        
    # Register Rider profile
    def register_rider(self, data):
        try:
            # Create Person object with more robust error handling
            try:
                person = Person(
                    username=data['username'],
                    name=data['name'],
                    email=data['email'],
                    phone=data['phone'],
                    password=data['password'],  
                    person_type='Rider'
                )
                
                # Validate before saving
                person.full_clean()
                person.save()
            except Exception as person_error:
                print(f"Person creation error: {person_error}")
                return False

            # Create Rider object
            try:
                rider = Rider(
                    person=person,
                    pickup_location=data.get('pickup_location', '')  # Optional field
                )
                rider.save()
            except Exception as rider_error:
                print(f"Rider creation error: {rider_error}")
                # Rollback person creation if rider creation fails
                person.delete()
                return False

            return True
        except Exception as e:
            print(f"Unexpected error in rider registration: {e}")
            return False
    # Authenticate Rider Login
    def authenticateLogin(self, username, password):
        try:
            person = Person.objects.get(username=username)
            if person.password == password:  # Simplified, no password hashing
                return True  # Successful login
            else:
                return False  # Incorrect password
        except ObjectDoesNotExist:
            return False  # Username not found


    def updateLocation(self, username, new_location):
        try:
            person = Person.objects.get(username=username)
            rider = Rider.objects.get(person=person)
            rider.pickup_location = new_location
            rider.save()
            return True  # Location updated successfully
        except ObjectDoesNotExist:
            return False  # User not found

    def updatePhone(self, username, new_phone):
        try:
            person = Person.objects.get(username=username)
            person.phone = new_phone
            person.save()
            return True  # Phone number updated successfully
        except ObjectDoesNotExist:
            return False  # User not found

    def updateEmail(self, username, new_email):
        try:
            person = Person.objects.get(username=username)
            person.email = new_email
            person.save()
            return True  # Email updated successfully
        except ObjectDoesNotExist:
            return False  # User not found

    def getBookings(self, username):
        try:
            person = Person.objects.get(username=username)
            print(person)
            rider = Rider.objects.get(person=person)
            print(rider)
            bookings = Booking.objects.filter(riders=rider)
            print(bookings)
            return bookings  # Return Booking objects
        except ObjectDoesNotExist:
            return None  # If user is not found or no bookings, return None

    # Get Rider Pickup Location
    def getLocation(self, username):
        try:
            person = Person.objects.get(username=username)
            rider = Rider.objects.get(person=person)
            return rider.pickup_location  # Return pickup location directly
        except ObjectDoesNotExist:
            return None  # If user not found, return None

    # Get Rider Rating (Average Rating)
    def getRating(self, username):
        try:
            person = Person.objects.get(username=username)
            ratings = Rating.objects.filter(to_person=person)
            if ratings.exists():
                average_rating = sum(rating.score for rating in ratings) / ratings.count()
                return average_rating  # Return the average rating
            else:
                return 0  # No ratings found, return 0
        except ObjectDoesNotExist:
            return None  # User not found
    
    def deleteBooking(self, username):
        try:
            
            person = Person.objects.get(username=username)
            rider = Rider.objects.get(person=person)
            bookings = Booking.objects.filter(riders=rider)

            if bookings.exists():
                for booking in bookings:
                    driver = booking.driver
                    driver.seats_available += 1  # Increase seat count by 1
                    driver.save()  # Update the driver's seat count in the database

                bookings.delete()  # Delete all bookings associated with the rider
                return True  # Deletion successful
            else:
                return False  # No bookings found to delete
        except ObjectDoesNotExist:
            return False  # User not found
           
    # def searchRides(self, pickup_location=None, carMake=None):
    #     try:
    #         # Start with all drivers who have available seats
    #         drivers = Driver.objects.filter(seats_available__gt=0)
            
    #         # Filter by pickup location (case-insensitive)
    #         if pickup_location:
    #             drivers = drivers.filter(route__icontains=pickup_location.lower())
            
    #         # Filter by car make (case-insensitive)
    #         if carMake:
    #             drivers = drivers.filter(car_model__icontains=carMake.lower())
            
    #         available_drivers = []
            
    #         for driver in drivers:
    #             # Fetch and calculate average rating
    #             ratings = Rating.objects.filter(to_person=driver.person)
    #             average_rating = ratings.aggregate(Avg('score'))['score__avg'] if ratings.exists() else None
                
    #             # Prepare driver information dictionary
    #             driver_info = {
    #                 'username': driver.person.username,
    #                 'name': driver.person.name,
    #                 'phone': driver.person.phone,
    #                 'car_model': driver.car_model,
    #                 'seats_available': driver.seats_available,
    #                 'timing': driver.timing,
    #                 'route': driver.route,
    #                 'average_rating': round(average_rating, 2) if average_rating is not None else None
    #             }
                
    #             available_drivers.append(driver_info)
            
    #         return available_drivers
        
    #     except Exception as e:
    #         print(f"Search Rides Error: {str(e)}")
    #         return []
            
    def searchRides(self, pickup_location=None, carMake = None, picktime = None):

        try:
            # Get available drivers based on filters
            drivers = Driver.objects.all()

            drivers = drivers.filter(seats_available__gt=0)
       
           
            # Apply filter on pickup_location (must match drivers' route
            if pickup_location:
                filtered = []
                for driver in drivers:
                    for loc in driver.route:
                        if pickup_location in loc.lower():
                            filtered.append(driver)
                drivers = filtered  

            
            if picktime:
                filtered = []
                for driver in drivers:
                    if picktime == driver.timing:
                        filtered.append(driver)
                drivers = filtered  

            if carMake:
                filtered = []
                for driver in drivers:
                    if carMake.lower() == driver.car_model.lower():
                        filtered.append(driver)
                drivers = filtered 

            available_drivers = []    

            for driver in drivers:
                # Fetch ratings for the driver (from the rider's perspective)
                ratings = Rating.objects.filter(to_person=driver.person)  # Get ratings for the current driver
                average_rating = ratings.aggregate(Avg('score'))['score__avg'] if ratings.exists() else None
                

            for driver in drivers:
                driver_info = {
                    'username': driver.person.username,
                    'name': driver.person.name,
                    'phone': driver.person.phone,
                    'car_model': driver.car_model,
                    'seats_available': driver.seats_available,
                    'timing': driver.timing,  # Complete schedule of the driver
                    'route': driver.route,  # Complete route of the driver
                    'average_rating': average_rating,  # Average rating of the driver                    
                }
                available_drivers.append(driver_info)
            
            return available_drivers  # Return list of available drivers
        except Exception as e:
            print("Exception")
            return []  # Return empty list if any error occurs

    def storeRating(self, from_username, to_username, score, feedback=""):
    
        try:
            # Validate the score range
            if score < 1 or score > 5:
                print("Score must be between 1 and 5.")
                return False

            # Retrieve Person objects for from_person and to_person
            from_person = Person.objects.get(username=from_username)
            to_person = Person.objects.get(username=to_username)

            # Create and save the rating
            Rating.objects.create(
                from_person=from_person,
                to_person=to_person,
                score=score,
                feedback=feedback
            )

            return True

        except Person.DoesNotExist as e:
            print(f"Error: {str(e)}")
            return False
        except Exception as e:
            print(f"An unexpected error occurred: {str(e)}")
            return False

    def storeBooking(self, rider_username, driver_username):
        try:
            rider = Rider.objects.get(person__username=rider_username)
            driver = Driver.objects.get(person__username=driver_username)

            if driver.seats_available > 0:
                booking = Booking.objects.create(driver=driver)
                booking.riders.add(rider)
                booking.save()
                driver.seats_available -= 1
                driver.save()
                return True
            return False

        except (Rider.DoesNotExist, Driver.DoesNotExist):
            return False
        except Exception as e:
            print(f"Error: {e}")
            return False

