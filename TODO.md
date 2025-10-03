# Property Posting and Display Improvements

## Overview
Implement location-based property sorting on home page, improve upload functionality, make map interactive, and add detailed property view with reservation.

## Tasks

### 1. Backend: Location-based Property Sorting
- [ ] Modify `propertyController.js` getAllProperties to sort by distance when user location provided
- [ ] Add geolocation endpoint to get user's coordinates
- [ ] Update Property model if needed for better geo queries

### 2. Frontend: Home Page Property Listings
- [ ] Modify `Home.jsx` to fetch and display properties instead of social posts
- [ ] Add geolocation permission and user location detection
- [ ] Sort properties by distance from user location
- [ ] Replace PostCardEnhanced with PropertyCard components

### 3. Property Upload Improvements
- [ ] Create ImageUploader component with drag-drop for photos
- [ ] Add video upload functionality to PropertyForm
- [ ] Add story/highlight creation for properties
- [ ] Implement file validation and progress indicators
- [ ] Update backend to handle multiple file types

### 4. Interactive Map Integration
- [ ] Integrate Google Maps API in MapaInteractivo.jsx
- [ ] Add real markers with property data
- [ ] Implement map click interactions
- [ ] Add clustering for multiple properties

### 5. Detailed Property View and Reservation
- [ ] Enhance PropertyDetail component with host info, reviews, amenities
- [ ] Add reservation/booking widget to detailed view
- [ ] Create booking flow with date selection
- [ ] Add reserve button to PropertyCard components
- [ ] Implement booking confirmation and payment integration

### 6. UI/UX Improvements
- [ ] Ensure responsive design for all new components
- [ ] Add loading states and error handling
- [ ] Implement smooth animations and transitions
- [ ] Add accessibility features (ARIA labels, keyboard navigation)

## Dependencies
- Google Maps API key needed for map integration
- File upload service (Cloudinary, AWS S3, or similar)
- Payment gateway for reservations (Stripe, PayPal, etc.)

## Testing
- [ ] Test geolocation permissions and fallbacks
- [ ] Test file uploads with various formats
- [ ] Test map interactions and property markers
- [ ] Test booking flow end-to-end
- [ ] Test responsive design on mobile devices
