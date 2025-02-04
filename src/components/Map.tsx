"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { LatLngExpression, LatLngTuple, polygon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import { geocoder as geoCoder } from "leaflet-control-geocoder";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { MapPinCheck, MapPinMinus, Navigation } from "lucide-react";

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

    const searchContainer = geocoder.getContainer();
    if (searchContainer) {
      searchContainer.style.color = "black";
    }

    return () => {
      map.removeControl(geocoder);
    };
  }, [map, setMarkerPosition]);

  return null;
};

const Map = (map: MapProps) => {
  const { zoom = defaults.zoom, posix } = map;
  const [markerPosition, setMarkerPosition] = useState<{
    position: LatLngExpression;
    address: string;
  } | null>(null);

  return (
    <div id="map" className="h-screen w-full">
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
          <Marker position={markerPosition.position}>
            <Popup>
              <div>
                <h2>{markerPosition.address}</h2>
                <p>Geolocation: {markerPosition.position.toString()}</p>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => console.log("Marked location")}
                  >
                    <MapPinCheck size={18} />
                    Mark
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => console.log("Start navigation")}
                  >
                    <Navigation size={18} />
                    Navigate
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setMarkerPosition(null)}
                  >
                    <MapPinMinus size={18} />
                    Clear
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
