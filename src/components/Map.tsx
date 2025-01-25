"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';

const Map = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      const map = L.map(mapRef.current).setView([51.505, -0.09], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    }
  }, []);

  return <div id="map" ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
};

export default Map;
