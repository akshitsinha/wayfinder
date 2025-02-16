import { Menu } from "lucide-react";
import { SidebarSeparator, useSidebar } from "@/components/ui/sidebar";
import useLocationStore from "@/lib/locationStore";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import usePreferencesStore from "@/lib/preferenceStore";
// Import Switch from shadcn ui
import { Switch } from "@/components/ui/switch";

export const MapSidebarButton = () => {
  const { toggleSidebar } = useSidebar();
  return <Menu onClick={toggleSidebar}>Reset View</Menu>;
};

const AppSidebar = () => {
  const { locations, clearLocations } = useLocationStore();
  const {
    showWheelchairs,
    showElevators,
    setShowWheelchairs,
    setShowElevators,
  } = usePreferencesStore();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-2xl font-semibold">
            Wayfinder
          </SidebarGroupLabel>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-semibold mb-2">
            Locations
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            {locations.length > 0 ? (
              locations.map((loc, idx) => (
                <div
                  key={idx}
                  className="p-2 cursor-pointer rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  {loc.address}
                </div>
              ))
            ) : (
              <div className="px-2 text-gray-500">No locations saved</div>
            )}
          </SidebarGroupContent>
          {locations.length > 0 && (
            <SidebarMenuButton
              className="mt-2"
              onClick={clearLocations}
              variant="outline"
            >
              Clear saved locations
            </SidebarMenuButton>
          )}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-semibold mb-2">
            Preferences
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3 px-2">
            <div className="flex items-center justify-between">
              <label htmlFor="wheelchairs" className="text-sm font-medium">
                Show Wheelchairs
              </label>
              <Switch
                id="wheelchairs"
                checked={showWheelchairs}
                onCheckedChange={setShowWheelchairs}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="elevators" className="text-sm font-medium">
                Show Elevators
              </label>
              <Switch
                id="elevators"
                checked={showElevators}
                onCheckedChange={setShowElevators}
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
