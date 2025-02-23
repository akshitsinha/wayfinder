import { CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useState, useRef, useEffect } from "react";
import { LatLngExpression } from "leaflet";
import { Locate, Plus, Minus, Search, Milestone } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import CustomMarker from "@/components/Marker";

type OverpassPoint = {
  lat: number;
  lon: number;
};

const PointsOfInterestMarker = ({
  poi,
  color,
  tooltip = poi.split("=")[0],
}: {
  poi: string;
  color: string;
  tooltip?: string;
}) => {
  const map = useMap();
  const [points, setPoints] = useState<OverpassPoint[]>([]);
  const abortControllerRef = useRef<AbortController>(null);

  useEffect(() => {
    const fetchPoints = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const bounds = map.getBounds();
      const south = bounds.getSouth();
      const west = bounds.getWest();
      const north = bounds.getNorth();
      const east = bounds.getEast();
      const query = `[out:json];(node[${poi}](${south},${west},${north},${east}););out body;`;

      fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => setPoints(data.elements))
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error(err);
          }
        });
    };

    map.on("moveend", fetchPoints);
    return () => {
      map.off("moveend", fetchPoints);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [map, poi]);

  return (
    <>
      {points.map((point, i) => (
        <CircleMarker
          key={`access-circle-${i}`}
          center={[point.lat, point.lon]}
          radius={5}
          pathOptions={{ color: color }}
        >
          <Tooltip>{tooltip}</Tooltip>
        </CircleMarker>
      ))}
    </>
  );
};

export const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    className="bg-white p-2 cursor-pointer rounded shadow"
    onClick={onClick}
  >
    {children}
  </button>
);

const ZoomControl = () => {
  const map = useMap();
  const zoomIn = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={zoomIn}>
        <Plus size={16} />
      </Button>
      <Button onClick={zoomOut}>
        <Minus size={16} />
      </Button>
    </div>
  );
};

const locateUser = (): Promise<LatLngExpression> => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve([latitude, longitude]);
        },
        (error) => reject(error),
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
};

const AutoLocate = () => {
  const map = useMap();

  useEffect(() => {
    locateUser()
      .then((userLocation) => map.setView(userLocation))
      .catch(() => {});
  }, [map]);

  return null;
};

const LocateButton = () => {
  const map = useMap();

  const handleLocateUser = () => {
    locateUser()
      .then((userLocation) => map.setView(userLocation))
      .catch(() => {});
  };

  return (
    <Button onClick={handleLocateUser}>
      <Locate />
    </Button>
  );
};

type SearchResult = {
  place_id: string;
  name: string;
  display_name: string;
  lat: number;
  lon: number;
};

const SearchResultItem = ({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}) => {
  const map = useMap();
  const handleClick = () => {
    onSelect(result);
    const pos: LatLngExpression = [result.lat, result.lon];
    map.setView(pos, 14);
  };

  return (
    <div
      className="p-2 rounded-md cursor-pointer hover:bg-gray-200"
      onClick={handleClick}
    >
      {result.display_name}
    </div>
  );
};

const SearchControl = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedSearchResult, setSelectedSearchResult] =
    useState<SearchResult | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=10&q=${encodeURIComponent(
            query,
          )}`,
        )
          .then((res) => res.json())
          .then((data) => setResults(data))
          .catch(() => {});
      } else setResults([]);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "k") setOpen(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Search />
      </Button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/10 z-[999]">
            <Dialog.Content className="fixed top-20 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-[500px] bg-white p-4 shadow-md rounded-lg">
              <Dialog.Title />
              <Dialog.Description />
              <div className="flex items-center gap-2">
                <Search size={24} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search everywhere"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full p-1 border-none rounded focus:outline-none"
                />
              </div>
              {results.length > 0 && (
                <div className="max-h-[40vh] overflow-y-auto py-2">
                  {results.map((result, id) => (
                    <SearchResultItem
                      key={id}
                      result={result}
                      onSelect={(r) => {
                        setSelectedSearchResult(r);
                        setOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
      {selectedSearchResult && (
        <CustomMarker
          position={[selectedSearchResult.lat, selectedSearchResult.lon]}
          address={selectedSearchResult.name}
        />
      )}
    </>
  );
};

type POIResult = {
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
  };
};

const POISearchControl = () => {
  const map = useMap();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<POIResult[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<POIResult | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        const bounds = map.getBounds();
        const south = bounds.getSouth();
        const west = bounds.getWest();
        const north = bounds.getNorth();
        const east = bounds.getEast();
        const overpassQuery = `[out:json][timeout:25];node["${query}"](${south},${west},${north},${east});out body;`;
        fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: overpassQuery,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.elements) setResults(data.elements);
          })
          .catch(() => {});
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query, map]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const handleSelect = (poi: POIResult) => {
    setSelectedPOI(poi);
    map.setView([poi.lat, poi.lon], 14);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Milestone />
      </Button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/10 z-[999]">
            <Dialog.Content className="fixed top-20 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-[500px] bg-white p-4 shadow-md rounded-lg">
              <Dialog.Title />
              <Dialog.Description />
              <div className="flex items-center gap-2">
                <Search size={24} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search any point of interests using Overpass API"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full p-1 border-none rounded focus:outline-none"
                />
              </div>
              {results.length > 0 && (
                <div className="max-h-[30vh] overflow-y-auto py-2">
                  {results.map((poi) => (
                    <div
                      key={poi.id}
                      className="p-2 rounded-md cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSelect(poi)}
                    >
                      {poi.tags?.name || "No name"}
                    </div>
                  ))}
                </div>
              )}
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
      {selectedPOI && (
        <CustomMarker
          position={[selectedPOI.lat, selectedPOI.lon]}
          address={selectedPOI.tags?.name || "Unnamed POI"}
        />
      )}
    </>
  );
};

export {
  PointsOfInterestMarker,
  ZoomControl,
  LocateButton,
  SearchControl,
  POISearchControl,
  AutoLocate,
};
