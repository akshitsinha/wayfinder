"use client";

import { useEffect } from "react";

const ServiceWorkerRegistrar = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Registered SW"))
        .catch((error) => console.error("SW registration failed:", error));
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistrar;
