import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarSeparator, useSidebar } from "@/components/ui/sidebar";
import useLocationStore from "@/lib/locationStore";
import usePreferencesStore from "@/lib/preferenceStore";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const MapSidebarButton = () => {
  const { toggleSidebar } = useSidebar();
  return <Menu onClick={toggleSidebar}>Reset View</Menu>;
};

const AppSidebar = () => {
  const { locations, clearLocations, setSelectedLocation } = useLocationStore();
  const {
    markers,
    setMarker,
    addMarker,
    removeMarker,
    enableTTS,
    setAssistantTTS,
  } = usePreferencesStore();
  const [open, setOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [customPoi, setCustomPoi] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [customTooltip, setCustomTooltip] = useState("");

  const handleSave = () => {
    if (!customKey.trim() || !customPoi.trim()) {
      alert("Key and POI are required!");
      return;
    }

    const conflictMarker = Object.entries(markers).find(
      ([key, config]) =>
        key === customKey.trim() ||
        config.poi === customPoi.trim() ||
        config.color === customColor.trim(),
    );
    if (conflictMarker) {
      setConflictOpen(true);
      return;
    }

    addMarker(customKey, {
      poi: customPoi,
      color: customColor,
      tooltip: customTooltip,
      visible: true,
    });

    setCustomKey("");
    setCustomPoi("");
    setCustomColor("");
    setCustomTooltip("");
    setOpen(false);
  };

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
          {locations.length > 0 ? (
            <SidebarGroupContent className="space-y-2">
              {locations.map((loc, idx) => (
                <div
                  key={idx}
                  className="p-2 cursor-pointer rounded-md bg-gray-100 hover:bg-gray-200"
                  onClick={() => setSelectedLocation(loc.position)}
                >
                  {loc.address}
                </div>
              ))}
            </SidebarGroupContent>
          ) : (
            <div className="px-2 text-gray-500">No locations saved</div>
          )}
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
            {Object.entries(markers).map(([key, config]) => (
              <ContextMenu key={key}>
                <ContextMenuTrigger asChild>
                  <div className="flex items-center justify-between cursor-context-menu">
                    <label
                      htmlFor={`marker-${key}`}
                      className="text-sm font-medium"
                    >
                      Show {key}
                    </label>
                    <Switch
                      id={`marker-${key}`}
                      checked={config.visible}
                      onCheckedChange={(v) => setMarker(key, v)}
                    />
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="bg-white shadow-lg rounded-md border mt-1">
                  <ContextMenuItem
                    onClick={() => removeMarker(key)}
                    className="px-3 py-1 rounded hover:bg-gray-200 cursor-pointer"
                  >
                    Remove Marker
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Assistant TTS</label>
              <Switch
                checked={enableTTS}
                onCheckedChange={(v) => setAssistantTTS(v)}
              />
            </div>
            <Button
              onClick={() => setOpen(true)}
              variant="secondary"
              className="w-full"
            >
              Add POI
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/10 data-[state=open]:animate-overlayShow z-[999]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-100 p-6 z-[999]">
            <Dialog.Title className="text-lg font-medium">
              Show Custom Points of Interests
            </Dialog.Title>
            <Dialog.Description className="mb-5 mt-2.5 text-[15px] leading-normal text-mauve11">
              Show any custom POI of your choice using the Overpass API
            </Dialog.Description>
            <fieldset className="mb-[15px] flex items-center gap-5">
              <label
                className="w-[90px] text-right text-[15px] text-black"
                htmlFor="key"
              >
                Key
              </label>
              <input
                className="inline-flex h-[35px] w-full flex-1 items-center justify-center rounded px-2.5 text-[15px] text-violet shadow-md"
                id="poi"
                placeholder="Key (ex. elevators)"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
              />
            </fieldset>
            <fieldset className="mb-[15px] flex items-center gap-5">
              <label
                className="w-[90px] text-right text-[15px] text-black"
                htmlFor="poi"
              >
                Overpass config
              </label>
              <input
                className="inline-flex h-[35px] w-full flex-1 items-center justify-center rounded px-2.5 text-[15px] text-violet shadow-md"
                id="poi"
                placeholder="Point of Interest (ex. elevators=yes)"
                value={customPoi}
                onChange={(e) => setCustomPoi(e.target.value)}
              />
            </fieldset>
            <fieldset className="mb-[15px] flex items-center gap-5">
              <label
                className="w-[90px] text-right text-[15px] text-black"
                htmlFor="color"
              >
                Color
              </label>
              <input
                className="inline-flex h-[35px] w-full flex-1 items-center justify-center rounded px-2.5 text-[15px] text-violet shadow-md"
                id="color"
                placeholder="Color (ex. red, green, blue)"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
              />
            </fieldset>
            <fieldset className="mb-[15px] flex items-center gap-5">
              <label
                className="w-[90px] text-right text-[15px] text-black"
                htmlFor="tooltip"
              >
                Tooltip
              </label>
              <input
                className="inline-flex h-[35px] w-full flex-1 items-center justify-center rounded px-2.5 text-[15px] text-violet shadow-md"
                id="tooltip"
                placeholder="Tooltip for POI"
                value={customTooltip}
                onChange={(e) => setCustomTooltip(e.target.value)}
              />
            </fieldset>
            <div className="mt-[25px] flex justify-end">
              <Button variant="outline" onClick={handleSave}>
                Save
              </Button>
            </div>
            <Dialog.Close asChild>
              <Button className="absolute right-5 top-5 inline-flex rounded-full text-black bg-gray hover:bg-black-100">
                <X />
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <AlertDialog.Root open={conflictOpen} onOpenChange={setConflictOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-[999]" />
          <AlertDialog.Content className="fixed top-1/3 left-1/2 -translate-x-1/2 bg-white p-6 rounded shadow-md z-[1000]">
            <AlertDialog.Title className="text-lg font-bold">
              Conflict Detected
            </AlertDialog.Title>
            <AlertDialog.Description>
              A marker with the same key, POI, or color already exists.
            </AlertDialog.Description>
            <div className="mt-4 flex justify-end">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 bg-gray-200 rounded">Ok</button>
              </AlertDialog.Cancel>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </Sidebar>
  );
};

export default AppSidebar;
