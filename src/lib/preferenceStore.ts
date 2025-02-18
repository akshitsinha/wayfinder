import { create } from "zustand";
import { persist } from "zustand/middleware";

type MarkerConfig = {
  poi: string;
  color: string;
  tooltip: string;
  visible: boolean;
};

type Preferences = {
  markers: Record<string, MarkerConfig>;
  setMarker: (marker: string, value: boolean) => void;
  addMarker: (marker: string, config: MarkerConfig) => void;
  removeMarker: (marker: string) => void;
};

const usePreferencesStore = create<Preferences>()(
  persist(
    (set) => ({
      markers: {
        wheelchairs: {
          poi: "wheelchair=yes",
          color: "blue",
          tooltip: "Wheelchair accessible",
          visible: false,
        },
        elevators: {
          poi: "elevator=yes",
          color: "yellow",
          tooltip: "Elevator accessible",
          visible: false,
        },
        washrooms: {
          poi: "amenity=toilets",
          color: "green",
          tooltip: "Washroom accessible",
          visible: false,
        },
      },
      setMarker: (marker, value) =>
        set((state) => ({
          markers: {
            ...state.markers,
            [marker]: {
              ...state.markers[marker],
              visible: value,
            },
          },
        })),
      addMarker: (marker, config) =>
        set((state) => ({
          markers: {
            ...state.markers,
            [marker]: config,
          },
        })),
      removeMarker: (marker) =>
        set((state) => {
          const newMarkers = { ...state.markers };
          delete newMarkers[marker];
          return { markers: newMarkers };
        }),
    }),
    { name: "user-preferences" },
  ),
);

export default usePreferencesStore;
