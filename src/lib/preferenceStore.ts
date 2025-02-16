import { create } from "zustand";
import { persist } from "zustand/middleware";

type Preferences = {
  showWheelchairs: boolean;
  showElevators: boolean;
  setShowWheelchairs: (value: boolean) => void;
  setShowElevators: (value: boolean) => void;
};

const usePreferencesStore = create<Preferences>()(
  persist(
    (set) => ({
      showWheelchairs: false,
      showElevators: false,
      setShowWheelchairs: (value) => set({ showWheelchairs: value }),
      setShowElevators: (value) => set({ showElevators: value }),
    }),
    { name: "user-preferences" },
  ),
);

export default usePreferencesStore;
