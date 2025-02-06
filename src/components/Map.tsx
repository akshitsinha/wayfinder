"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { LatLngExpression, LatLngTuple, polygon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import { geocoder as geoCoder } from "leaflet-control-geocoder";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Locate, Menu } from "lucide-react";
import Marker from "@/components/Marker";
import UserMenu from "@/components/UserMenu";
import store from "store2";

interface MapProps {
  posix: LatLngExpression | LatLngTuple;
  zoom?: number;
}

const defaults = {
  zoom: 14,
};

const SearchControl = ({
  setMarkerPosition,
}: {
  setMarkerPosition: (position: LatLngExpression, address: string) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const geocoder = geoCoder({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", function (e) {
        const bbox = e.geocode.bbox;
        const poly = polygon([
          bbox.getSouthEast(),
          bbox.getNorthEast(),
          bbox.getNorthWest(),
          bbox.getSouthWest(),
        ]);
        map.fitBounds(poly.getBounds());

        const center = e.geocode.center;
        const address = e.geocode.name;
        setMarkerPosition(center, address);
      })
      .addTo(map);

    geocoder.setPosition("bottomright");

    return () => {
      map.removeControl(geocoder);
    };
  }, [map, setMarkerPosition]);

  return null;
};

const LocateButton = () => {
  const map = useMap();

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation: LatLngExpression = [latitude, longitude];
          map.setView(userLocation);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={locateUser}
      className="absolute top-20 left-2.5 z-[1000]"
    >
      <Locate size={24} />
    </Button>
  );
};

const Map = (map: MapProps) => {
  const { zoom = defaults.zoom, posix } = map;
  const [markerPosition, setMarkerPosition] = useState<{
    position: LatLngExpression;
    address: string;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [markedLocations, setMarkedLocations] = useState<{
    position: LatLngExpression;
    address: string;
  }[]>([]);
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    const storedLocations = store.get("markedLocations") || [];
    setMarkedLocations(storedLocations);
  }, []);

  const handleLocationClick = (position: [number, number]) => {
    if (mapRef.current) {
      mapRef.current.setView(position);
      setMenuOpen(false);
    }
  };

  const MapEvents = () => {
    const map = useMap();
    mapRef.current = map;
    return null;
  };

  return (
    <div id="map" className="h-screen w-full relative">
      <MapContainer
        center={posix}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SearchControl
          setMarkerPosition={(position, address) =>
            setMarkerPosition({ position, address })
          }
        />
        {markerPosition && (
          <Marker
            position={markerPosition.position}
            address={markerPosition.address}
            onClear={() => setMarkerPosition(null)}
          />
        )}
        {markedLocations.map((location, index) => (
          <Marker
            key={index}
            position={location.position as LatLngExpression}
            address={location.address}
            onClear={() => {
              setMarkedLocations((prev) =>
                prev.filter((_, i) => i !== index)
              );
            }}
          />
        ))}
        <LocateButton />
        <Button
          variant="secondary"
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute top-4 right-4 z-[1000]"
        >
          <Menu size={24} />
        </Button>
        {menuOpen && <UserMenu onClose={() => setMenuOpen(false)} onLocationClick={handleLocationClick} />}
        <MapEvents />
      </MapContainer>
    </div>
  );
};

export default Map;
