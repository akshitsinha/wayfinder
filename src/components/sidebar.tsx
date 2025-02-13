import { LatLngExpression } from "leaflet";
import { X } from "lucide-react";
import store from "store2";
import { MarkedLocation } from "@/components/map";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
      <Separator className="mb-4" />
      <div>
        <h3 className="text-2xl font-semibold mb-2">Marked Locations</h3>
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
        <h3 className="text-2xl font-semibold mb-2">Preferences</h3>
        <div className="w-full space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">Sample Category</h3>
            <div className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <div>Sample 1</div>
                </div>
                <div>
                  <Switch />
                </div>
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <div>Sample 2</div>
                </div>
                <div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;
