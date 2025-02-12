import { Button } from "@/components/ui/button";
import { Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { MapPinCheck, MapPinMinus, Navigation } from "lucide-react";
import { MarkedLocation } from "@/components/map";
import store from "store2";

interface MarkerProps {
  position: LatLngExpression;
  address: string;
  onClear: () => void;
}

const CustomMarker = ({ position, address, onClear }: MarkerProps) => {
  const markLocation = () => {
    const markedLocations: MarkedLocation[] =
      store.get("markedLocations") || [];

    const isDuplicate = markedLocations.some(
      (location) => location.address === address,
    );

    if (!isDuplicate) {
      markedLocations.push({ address, position });
      store.set("markedLocations", markedLocations);
    } else {
      console.log("Location already marked");
    }
  };

  const clearLocation = () => {
    let markedLocations: MarkedLocation[] = store.get("markedLocations") || [];
    markedLocations = markedLocations.filter(
      (location) => location.address !== address,
    );
    store.set("markedLocations", markedLocations);
    onClear();
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
