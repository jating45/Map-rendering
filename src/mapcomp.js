import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const SetView = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 14);
    }
  }, [location, map]);
  return null;
};

const GoMapsSearchMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const inputRef = useRef();

  // Get user's live location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        console.error('Geolocation error:', err);
        setUserLocation({ lat: 40.7128, lng: -74.006 }); 
      }
    );
  }, []);

  const handleSearch = async () => {
    const query = inputRef.current.value;
    if (!query || !userLocation) return;

    try {
      const res = await axios.get(
        `https://maps.gomaps.pro/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${userLocation.lat},${userLocation.lng}`,
            radius: 5000,
            keyword: query,
            key: 'AlzaSyBvxzgZLuQRkpIp9Tuw5Usd67GLLseIveD'
          }
        }
      );

      if (res.data.status === 'OK') {
        setPlaces(res.data.results);
      } else {
        console.error('GoMaps search failed:', res.data.status);
      }
    } catch (error) {
      console.error('Error fetching from GoMaps:', error);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search (e.g., school)"
          style={{ padding: '8px', width: '250px' }}
        />
        <button onClick={handleSearch} style={{ marginLeft: '10px' }}>
          🔍 Search
        </button>
      </div>

      <MapContainer
        center={userLocation || [40.7128, -74.006]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <>
            <SetView location={userLocation} />
            <Marker position={userLocation} icon={markerIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          </>
        )}

        {places.map((place, i) => (
          <Marker
            key={i}
            position={[
              place.geometry.location.lat,
              place.geometry.location.lng
            ]}
            icon={markerIcon}
          >
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.vicinity}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default GoMapsSearchMap;
