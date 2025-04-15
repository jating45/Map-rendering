import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const GOOGLE_MAPS_API_KEY = 'AIzaSyBH7KkDPxwOxIsuhPg53s6c54uFUsACHlQ';

const POIMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [poiMarkers, setPoiMarkers] = useState([]);
  const mapRef = useRef(null);

 
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // When user clicks on map, search nearby POIs
  const handleMapClick = (e) => {
    const location = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    searchNearbyPOIs(location);
  };

  const searchNearbyPOIs = (location) => {
    if (!mapRef.current || !window.google) return;

    const types = ['school', 'hospital', 'bus_station', 'university'];
    const radius = 1000;
    const service = new window.google.maps.places.PlacesService(mapRef.current);

    let collectedMarkers = [];

    types.forEach((type) => {
      service.nearbySearch(
        {
          location,
          radius,
          type
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            collectedMarkers = [...collectedMarkers, ...results];
            setPoiMarkers([...collectedMarkers]);
          }
        }
      );
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
        {userLocation && (
          <Marker
            position={userLocation}
            label="You"
            icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
          />
        )}

        {poiMarkers.map((place, i) => (
          <Marker
            key={i}
            position={place.geometry.location}
            title={place.name}
            icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default POIMap;
