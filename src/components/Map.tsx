"use client";

import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  Polyline,
  Popup,
} from "react-leaflet";
import { LatLng, LatLngExpression, LatLngTuple, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  AutoLocate,
  LocateButton,
  PointsOfInterestMarker,
  POISearchControl,
  SearchControl,
  ZoomControl,
} from "@/components/MapUtils";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar, { MapSidebarButton } from "@/components/Sidebar";
import CustomMarker from "@/components/Marker";
import useLocationStore, { MarkedLocation } from "@/lib/locationStore";
import usePreferencesStore from "@/lib/preferenceStore";
import { Button } from "@/components/ui/button";
import Assistant from "@/components/Assistant";
import Navigation, { NavigationButton } from "@/components/Navigation";
import { X } from "lucide-react";
import { RouteGeometry, Position, RouteInfo } from "@/app/api/route/route";

type MapProps = {
  posix: LatLngExpression | LatLngTuple;
  zoom?: number;
};

type OSMResponse = {
  display_name: string;
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};

const formatDistance = (kilometers: number): string => {
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)} m`;
  }
  return `${kilometers.toFixed(1)} km`;
};

const RouteDisplay = ({
  route,
  routeInfo,
}: {
  route: RouteGeometry | null;
  routeInfo: RouteInfo | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (route && route.coordinates && route.coordinates.length > 0) {
      const latlngs: LatLngTuple[] = route.coordinates.map(
        (coord: Position): LatLngTuple => {
          return [coord[1], coord[0]];
        },
      );

      const bounds = latlngs.reduce(
        (bounds: LatLngBounds, point: LatLngTuple) => {
          return bounds.extend(point);
        },

        new LatLngBounds(latlngs[0], latlngs[0]),
      );

      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);

  return route ? (
    <Polyline
      positions={route.coordinates.map(
        (coord: Position): LatLngTuple => [coord[1], coord[0]],
      )}
      color="#3b82f6"
      weight={6}
      opacity={0.8}
    >
      <Popup>
        <div className="text-sm">
          <p>
            <strong>Distance:</strong>{" "}
            {formatDistance(routeInfo?.distance || 0)}
          </p>
          <p>
            <strong>Duration:</strong>{" "}
            {formatDuration(routeInfo?.duration || 0)}
          </p>
        </div>
      </Popup>
    </Polyline>
  ) : null;
};

const Map = (mapProps: MapProps) => {
  const { zoom = 15, posix } = mapProps;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const zoomStr = searchParams.get("zoom");
  const initialPosix =
    latStr && lngStr
      ? new LatLng(parseFloat(latStr), parseFloat(lngStr))
      : posix;
  const initialZoom = zoomStr ? parseInt(zoomStr) : zoom;
  const locations = useLocationStore((state) => state.locations);
  const markers = usePreferencesStore((state) => state.markers);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    latlng: LatLng | null;
  }>({ visible: false, x: 0, y: 0, latlng: null });
  const [customMarkers, setCustomMarkers] = useState<MarkedLocation[]>([]);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoContent, setInfoContent] = useState("");
  const [route, setRoute] = useState<RouteGeometry | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [showNavigationPanel, setShowNavigationPanel] = useState(false);
  const [showNavigationControls, setShowNavigationControls] = useState(false);

  const handleRouteCalculated = (geometry: RouteGeometry, info: RouteInfo) => {
    setRoute(geometry);
    setRouteInfo(info);
    setShowNavigationPanel(true);
  };

  const clearRoute = () => {
    setShowNavigationPanel(false);
    setRoute(null);
    setRouteInfo(null);
  };

  const fetchReverseGeocode = async (
    position: LatLng,
    fallback: string = "No information found",
  ): Promise<OSMResponse> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.lat}&lon=${position.lng}`,
      );

      return res.json();
    } catch (error) {
      console.error(error);
      return { display_name: fallback };
    }
  };

  const MapEvents = () => {
    const map = useMap();
    const selectedLocation = useLocationStore(
      (state) => state.selectedLocation,
    );
    const clearSelectedLocation = useLocationStore(
      (state) => state.setSelectedLocation,
    );

    useEffect(() => {
      const handleMoveEnd = () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        const searchParams = new URLSearchParams();
        searchParams.set("lat", center.lat.toString());
        searchParams.set("lng", center.lng.toString());
        searchParams.set("zoom", zoom.toString());
        const newUrl = `${pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, "", newUrl);
      };

      map.on("moveend", handleMoveEnd);

      return () => {
        map.off("moveend", handleMoveEnd);
      };
    }, [map]);

    useEffect(() => {
      if (selectedLocation) {
        map.panTo(selectedLocation);
        clearSelectedLocation(null);
      }
    }, [selectedLocation, map, clearSelectedLocation]);

    return null;
  };

  const ContextMenuHandler = () => {
    useMapEvents({
      contextmenu: (e) => {
        e.originalEvent.preventDefault();
        setContextMenu({
          visible: true,
          x: e.containerPoint.x,
          y: e.containerPoint.y,
          latlng: e.latlng,
        });
      },
    });
    return null;
  };

  return (
    <SidebarProvider
      id="map"
      className="h-screen w-full relative"
      defaultOpen={false}
    >
      <AppSidebar />
      <MapContainer
        center={initialPosix}
        zoom={initialZoom}
        scrollWheelZoom={true}
        doubleClickZoom={false}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showNavigationControls && (
          <Navigation onRouteCalculated={handleRouteCalculated} />
        )}

        {route && <RouteDisplay route={route} routeInfo={routeInfo} />}

        {locations.map((location, idx) => (
          <CustomMarker
            key={idx}
            position={location.position}
            address={location.address}
          />
        ))}
        {customMarkers.map((marker, idx) => (
          <CustomMarker
            key={`custom-${idx}`}
            position={marker.position}
            address={marker.address}
          />
        ))}
        <div className="absolute top-0 right-0 p-4 z-[999] flex flex-col items-center space-y-3">
          <MapSidebarButton />
          <ZoomControl />
          <LocateButton />
          <SearchControl />
          <NavigationButton
            onClick={() => setShowNavigationControls(!showNavigationControls)}
          />
          <POISearchControl />
          <Assistant />
        </div>
        <MapEvents />
        <AutoLocate />
        {Object.entries(markers).map(([key, config]) =>
          config.visible ? (
            <PointsOfInterestMarker
              key={key}
              poi={config.poi}
              color={config.color}
              tooltip={config.tooltip}
            />
          ) : null,
        )}
        <ContextMenuHandler />
        {contextMenu.visible && contextMenu.latlng && (
          <div
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="absolute z-[1000] bg-white rounded border p-2 shadow"
            onMouseLeave={() =>
              setContextMenu((prev) => ({ ...prev, visible: false }))
            }
          >
            <div
              className="cursor-pointer p-1 rounded hover:bg-gray-200"
              onClick={async () => {
                await fetchReverseGeocode(contextMenu.latlng!)
                  .then((res) => {
                    if (!contextMenu.latlng) return;
                    setCustomMarkers((prev) => [
                      ...prev,
                      {
                        position: [
                          contextMenu.latlng!.lat,
                          contextMenu.latlng!.lng,
                        ],
                        address: res.display_name,
                      },
                    ]);
                  })
                  .finally(() =>
                    setContextMenu((prev) => ({ ...prev, visible: false })),
                  );
              }}
            >
              Mark Place
            </div>
            <div
              className="cursor-pointer p-1 hover:bg-gray-200"
              onClick={async () => {
                await fetchReverseGeocode(contextMenu.latlng!)
                  .then((res) => {
                    setInfoContent(res.display_name);
                    setInfoDialogOpen(true);
                  })
                  .finally(() =>
                    setContextMenu((prev) => ({ ...prev, visible: false })),
                  );
              }}
            >
              Show Information
            </div>
          </div>
        )}
      </MapContainer>

      {showNavigationPanel && routeInfo && (
        <div className="absolute bottom-10 left-4 z-[1001] bg-white p-3 rounded shadow-lg max-w-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Navigation</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearRoute();
              }}
              className="h-6 w-6 p-0"
            >
              <X size={16} />
            </Button>
          </div>
          <div className="text-sm max-h-60 overflow-y-scroll">
            <p>
              <strong>Total distance:</strong>{" "}
              {formatDistance(routeInfo.distance)}
            </p>
            <p>
              <strong>Estimated time:</strong>{" "}
              {formatDuration(routeInfo.duration)}
            </p>

            {routeInfo.instructions && routeInfo.instructions.length > 0 && (
              <div className="mt-2">
                <strong>Directions:</strong>
                <ul className="mt-1 space-y-1">
                  {routeInfo.instructions.map((step, index) => (
                    <li key={index} className="border-b border-gray-100 pb-1">
                      <p>{step.text}</p>
                      <small className="text-gray-500">
                        {formatDistance(step.distance)} ·{" "}
                        {formatDuration(step.time)}
                      </small>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <AlertDialog.Root open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black bg-opacity-30 z-[1000]" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-lg z-[1000]">
            <AlertDialog.Title className="font-bold text-lg">
              Place Information
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-4">
              {infoContent}
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end space-x-2">
              <AlertDialog.Action asChild>
                <Button
                  variant="secondary"
                  onClick={() => setInfoDialogOpen(false)}
                >
                  OK
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </SidebarProvider>
  );
};

export default Map;
