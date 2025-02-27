"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/MapUtils";
import { Button as UiButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, NavigationIcon, Locate, X } from "lucide-react";
import { RouteGeometry, RouteInfo } from "@/app/api/route/route";

interface NavigationProps {
  onRouteCalculated: (route: RouteGeometry, routeInfo: RouteInfo) => void;
}

export const NavigationButton = ({ onClick }: { onClick: () => void }) => (
  <Button onClick={onClick} aria-label="Toggle navigation">
    <NavigationIcon />
  </Button>
);

type SearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

const Navigation = ({ onRouteCalculated }: NavigationProps) => {
  const [from, setFrom] = useState<[number, number] | null>(null);
  const [to, setTo] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = async () => {
    if (!from || !to) {
      setError("Both starting and destination points are required");
      return;
    }

    setError(null);

    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromCoords: from,
          toCoords: to,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to calculate route");
      }

      const data = await response.json();
      onRouteCalculated(data.geometry, data.routeInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromResults, setFromResults] = useState<SearchResult[]>([]);
  const [toResults, setToResults] = useState<SearchResult[]>([]);
  const [fromLocation, setFromLocation] = useState<SearchResult | null>(null);
  const [toLocation, setToLocation] = useState<SearchResult | null>(null);
  const [showFromResults, setShowFromResults] = useState(false);
  const [showToResults, setShowToResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromQuery.length > 2) searchLocation(fromQuery, setFromResults);
      else setFromResults([]);
    }, 500);

    return () => clearTimeout(timer);
  }, [fromQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (toQuery.length > 2) searchLocation(toQuery, setToResults);
      else setToResults([]);
    }, 500);

    return () => clearTimeout(timer);
  }, [toQuery]);

  const searchLocation = async (
    query: string,
    setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>,
  ) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          query,
        )}`,
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error searching location:", error);
      setResults([]);
    }
  };

  const handleFromSelect = (result: SearchResult) => {
    setFromLocation(result);
    setFromQuery(result.display_name);
    setShowFromResults(false);
    setFrom([parseFloat(result.lon), parseFloat(result.lat)]);
  };

  const handleToSelect = (result: SearchResult) => {
    setToLocation(result);
    setToQuery(result.display_name);
    setShowToResults(false);
    setTo([parseFloat(result.lon), parseFloat(result.lat)]);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
            );
            const data = await res.json();
            setFromQuery(data.display_name);
            setFrom([position.coords.longitude, position.coords.latitude]);
          } catch (error) {
            console.error("Error getting location name:", error);
            setFromQuery(
              `${position.coords.latitude}, ${position.coords.longitude}`,
            );
            setFrom([position.coords.longitude, position.coords.latitude]);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to get your current location. Please check your browser permissions.",
          );
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const clearFromInput = () => {
    setFromQuery("");
    setFromLocation(null);
    setFrom(null);
    setFromResults([]);
  };

  const clearToInput = () => {
    setToQuery("");
    setToLocation(null);
    setTo(null);
    setToResults([]);
  };

  return (
    <div className="absolute top-4 left-4 z-[999] bg-white p-3 rounded shadow-lg w-80">
      <div className="flex flex-col space-y-3">
        <div className="relative">
          <div className="flex items-center relative">
            <Input
              type="text"
              value={fromQuery}
              onChange={(e) => {
                setFromQuery(e.target.value);
                setShowFromResults(true);
                setFromLocation(null);
              }}
              onFocus={() => setShowFromResults(true)}
              placeholder="Starting point"
              className="flex-1 pr-8"
            />
            {fromQuery && (
              <button
                onClick={clearFromInput}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                type="button"
              >
                <X size={16} />
              </button>
            )}
            <UiButton
              variant="ghost"
              size="sm"
              onClick={getUserLocation}
              className="h-8 w-8 p-0 ml-2"
              title="Use my location"
            >
              <Locate size={16} />
            </UiButton>
          </div>

          {showFromResults && fromResults.length > 0 && (
            <div className="absolute mt-1 w-full bg-white border rounded-md shadow-lg z-[1000] max-y-50 overflow-y-scroll">
              {fromResults.map((result) => (
                <div
                  key={result.place_id}
                  className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
                  onClick={() => handleFromSelect(result)}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="flex items-center relative">
            <Input
              type="text"
              value={toQuery}
              onChange={(e) => {
                setToQuery(e.target.value);
                setShowToResults(true);
                setToLocation(null);
              }}
              onFocus={() => setShowToResults(true)}
              placeholder="Destination"
              className="flex-1 pr-8"
            />
            {toQuery && (
              <button
                onClick={clearToInput}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                type="button"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {showToResults && toResults.length > 0 && (
            <div className="absolute mt-1 w-full bg-white border rounded-md shadow-lg z-[1000] max-y-50 overflow-y-scroll">
              {toResults.map((result) => (
                <div
                  key={result.place_id}
                  className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
                  onClick={() => handleToSelect(result)}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <UiButton
          onClick={calculateRoute}
          disabled={!fromLocation || !toLocation}
          className="w-full flex items-center justify-center"
        >
          <Search className="mr-2" size={16} />
          Get Directions
        </UiButton>
      </div>
    </div>
  );
};

export default Navigation;
