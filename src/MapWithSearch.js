import React, { useEffect, useState, useRef } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const GOOGLE_MAPS_API_KEY = 'AIzaSyBH7KkDPxwOxIsuhPg53s6c54uFUsACHlQ';

const MapWithRouteAndPOIs = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [places, setPlaces] = useState([]);
  const mapRef = useRef(null);

  // Get current location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Handle map click to drop destination
  const handleMapClick = (e) => {
    const destinationPoint = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setDestination(destinationPoint);
    setDirections(null);
    setPlaces([]);
    getRoute(userLocation, destinationPoint);
  };

  // Fetch route between origin and destination
  const getRoute = (origin, destination) => {
    if (!origin || !destination) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          const path = result.routes[0].overview_path;
          searchPOIs(path);
        } else {
          console.error('Directions error:', status);
        }
      }
    );
  };


  const searchPOIs = (pathPoints) => {
    if (!mapRef.current || !window.google) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const types = ['school', 'hospital', 'bus_station'];
    const radius = 300;

    const sampledPoints = pathPoints.filter((_, i) => i % 10 === 0);

    sampledPoints.forEach((point) => {
      types.forEach((type) => {
        service.nearbySearch(
          {
            location: point,
            radius,
            type
          },
          (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              setPlaces((prev) => [...prev, ...results]);
            }
          }
        );
      });
    });
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || { lat: 20.5937, lng: 78.9629 }}
        zoom={14}
        onLoad={(map) => (mapRef.current = map)}
        onClick={handleMapClick}
      >
        {userLocation && <Marker position={userLocation} label="You" />}
        {destination && <Marker position={destination} label="Destination" />}
        {directions && <DirectionsRenderer directions={directions} />}
        {places.map((place, i) => (
          <Marker
            key={i}
            position={place.geometry.location}
            title={place.name}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapWithRouteAndPOIs;
