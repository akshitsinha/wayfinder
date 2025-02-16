import { LatLngExpression } from "leaflet";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type MarkedLocation = {
  address: string;
  position: LatLngExpression;
};

type LocationState = {
  locations: MarkedLocation[];
  addLocation: (location: MarkedLocation) => void;
  removeLocation: (index: number) => void;
  clearLocations: () => void;
};

const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      locations: [],

      addLocation: (location) =>
        set((state) => ({ locations: [...state.locations, location] })),

      removeLocation: (index) =>
        set((state) => ({
          locations: state.locations.filter((_, i) => i !== index),
        })),

      clearLocations: () => set({ locations: [] }),
    }),
    { name: "marked-locations" },
  ),
);

export default useLocationStore;
