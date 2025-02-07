import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LatLngExpression } from "leaflet";
import { X } from "lucide-react";
import store from "store2";
import { MarkedLocation } from "@/components/Map";

const UserMenu = ({
  onClose,
  onLocationClick,
}: {
  onClose: () => void;
  onLocationClick: (position: LatLngExpression) => void;
}) => {
  const markedLocations: MarkedLocation[] = store.get("markedLocations");

  return (
    <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-lg z-[1000] p-4 transition-transform transform translate-x-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Wayfinder</h2>
        <Button variant="secondary" onClick={onClose}>
          <X size={24} />
        </Button>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Marked Locations</h3>
        <ul>
          {markedLocations &&
            markedLocations.map((location, index) => (
              <li key={index} className="mb-2">
                <Card
                  className="p-2 rounded cursor-pointer"
                  onClick={() => onLocationClick(location.position)}
                >
                  {location.address}
                </Card>
              </li>
            ))}
        </ul>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Preferences</h3>
        <Button
          variant="secondary"
          onClick={() => console.log("Edit Preferences")}
        >
          Edit Preferences
        </Button>
      </div>
    </div>
  );
};

export default UserMenu;
