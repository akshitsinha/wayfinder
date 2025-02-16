"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { LatLng, LatLngExpression, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  AutoLocate,
  LocateButton,
  SearchControl,
  ZoomControl,
} from "@/components/MapUtils";
import AppSidebar, { MapSidebarButton } from "@/components/Sidebar";
import CustomMarker from "@/components/Marker";
import useLocationStore from "@/lib/locationStore";

type MapProps = {
  posix: LatLngExpression | LatLngTuple;
  zoom?: number;
};

const defaults = {
  zoom: 14,
};

const Map = (mapProps: MapProps) => {
  const { zoom = defaults.zoom, posix } = mapProps;
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

  const MapEvents = () => {
    const map = useMap();

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
        {locations.map((location, idx) => (
          <CustomMarker
            key={idx}
            position={location.position}
            address={location.address}
          />
        ))}
        <div className="absolute top-0 right-0 p-4 z-[999] flex flex-col items-center space-y-3">
          <MapSidebarButton />
          <ZoomControl />
          <LocateButton />
          <SearchControl />
        </div>
        <MapEvents />
        <AutoLocate />
      </MapContainer>
    </SidebarProvider>
  );
};

export default Map;
