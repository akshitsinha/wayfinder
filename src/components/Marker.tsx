import { Button } from "@/components/ui/button";
import { Marker, Popup } from "react-leaflet";
import { MapPinCheck, MapPinMinus, Navigation } from "lucide-react";
import useLocationStore, { MarkedLocation } from "@/lib/locationStore";

const CustomMarker = (marker: MarkedLocation) => {
  const locations = useLocationStore((state) => state.locations);
  const addLocation = useLocationStore((state) => state.addLocation);
  const removeLocation = useLocationStore((state) => state.removeLocation);

  const markLocation = () => {
    const isDuplicate = locations.some(
      (location) => location.address === marker.address,
    );
    if (!isDuplicate) {
      addLocation(marker);
    } else {
      console.log("Location already marked");
    }
  };

  const clearLocation = () => {
    const index = locations.findIndex(
      (location) => location.address === marker.address,
    );
    if (index !== -1) {
      removeLocation(index);
    }
  };

  return (
    <Marker position={marker.position}>
      <Popup>
        <div>
          <h2>{marker.address}</h2>
          <p>Geolocation: {marker.position.toString()}</p>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={markLocation}>
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
            <Button variant="secondary" onClick={clearLocation}>
              <MapPinMinus size={18} />
              Clear
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default CustomMarker;
