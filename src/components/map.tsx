"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { LatLng, LatLngExpression, LatLngTuple, polygon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import { geocoder as geoCoder } from "leaflet-control-geocoder";
import { useEffect, useState, useRef } from "react";
import { Locate, Menu } from "lucide-react";
import { useSearchParams } from "next/navigation";
import store from "store2";
import Marker from "@/components/marker";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/sidebar";

interface MapProps {
  posix: LatLngExpression | LatLngTuple;
  zoom?: number;
}

export type MarkedLocation = {
  address: string;
  position: LatLngExpression;
};

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
        },
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
  const mapRef = useRef<L.Map>(null);
  const searchParams = useSearchParams();
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const zoomStr = searchParams.get("zoom");
  const initialPosix =
    latStr && lngStr
      ? new LatLng(parseFloat(latStr), parseFloat(lngStr))
      : posix;
  const initialZoom = zoomStr ? parseInt(zoomStr) : zoom;

  const [markerPosition, setMarkerPosition] = useState<MarkedLocation | null>(
    null,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [markedLocations, setMarkedLocations] = useState<MarkedLocation[]>(
    store.get("markedLocations") || [],
  );

  useEffect(() => {
    setMarkedLocations(
      markedLocations.map((location) => {
        const { lat, lng } = location.position as LatLng;
        return {
          ...location,
          position: new LatLng(lat, lng),
        };
      }),
    );
  }, []);

  const handleLocationClick = (position: LatLngExpression) => {
    if (mapRef.current) {
      mapRef.current.setView(position);
      setMenuOpen(false);
    }
  };

  const MapEvents = () => {
    const map = useMap();
    mapRef.current = map;

    useEffect(() => {
      const handleMoveEnd = () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        const searchParams = new URLSearchParams();
        searchParams.set("lat", center.lat.toString());
        searchParams.set("lng", center.lng.toString());
        searchParams.set("zoom", zoom.toString());
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, "", newUrl);
      };

      map.on("moveend", handleMoveEnd);
      handleMoveEnd();

      return () => {
        map.off("moveend", handleMoveEnd);
      };
    }, [map]);

    return null;
  };

  return (
    <div id="map" className="h-screen w-full relative">
      <MapContainer
        center={initialPosix}
        zoom={initialZoom}
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
            position={location.position}
            address={location.address}
            onClear={() => {
              setMarkedLocations((prev) => prev.filter((_, i) => i !== index));
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
        {menuOpen && (
          <UserMenu
            onClose={() => setMenuOpen(false)}
            onLocationClick={handleLocationClick}
          />
        )}
        <MapEvents />
      </MapContainer>
    </div>
  );
};

export default Map;
