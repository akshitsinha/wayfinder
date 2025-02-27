import { create } from "zustand";
import { RouteGeometry, RouteInfo } from "@/app/api/route/route";

interface RouteState {
  route: RouteGeometry | null;
  routeInfo: RouteInfo | null;
  isNavigating: boolean;
  startNavigation: (geometry: RouteGeometry, info: RouteInfo) => void;
  endNavigation: () => void;
}

const useRouteStore = create<RouteState>((set) => ({
  route: null,
  routeInfo: null,
  isNavigating: false,

  startNavigation: (geometry, info) =>
    set({
      route: geometry,
      routeInfo: info,
      isNavigating: true,
    }),

  endNavigation: () =>
    set({
      route: null,
      routeInfo: null,
      isNavigating: false,
    }),
}));

export default useRouteStore;
