import { Button } from "@/components/ui/button";
import { Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { MapPinCheck, MapPinMinus, Navigation } from "lucide-react";
import useLocationStore from "@/lib/locationStore";

interface MarkerProps {
  position: LatLngExpression;
  address: string;
}

const CustomMarker = ({ position, address }: MarkerProps) => {
  const locations = useLocationStore((state) => state.locations);
  const addLocation = useLocationStore((state) => state.addLocation);
  const removeLocation = useLocationStore((state) => state.removeLocation);

  const markLocation = () => {
    const isDuplicate = locations.some(
      (location) => location.address === address,
    );
    if (!isDuplicate) {
      addLocation({ address, position });
    } else {
      console.log("Location already marked");
    }
  };

  const clearLocation = () => {
    const index = locations.findIndex(
      (location) => location.address === address,
    );
    if (index !== -1) {
      removeLocation(index);
    }
  };

  return (
    <Marker position={position}>
      <Popup>
        <div>
          <h2>{address}</h2>
          <p>Geolocation: {position.toString()}</p>
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
