import { CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useState, useRef, useEffect } from "react";
import { LatLngExpression } from "leaflet";
import { Locate, Plus, Minus, Search } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
} from "@/components/ui/command";
import useLocationStore from "@/lib/locationStore";

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

const Button = ({
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
        (error) => {
          reject(error);
        },
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
      .then((userLocation) => {
        map.setView(userLocation);
      })
      .catch(() => {});
  }, [map]);

  return null;
};

const LocateButton = () => {
  const map = useMap();

  const handleLocateUser = () => {
    locateUser()
      .then((userLocation) => {
        map.setView(userLocation);
      })
      .catch(() => {});
  };

  return (
    <Button onClick={handleLocateUser}>
      <Locate />
    </Button>
  );
};

type SearchResult = {
  place_id: string | number;
  display_name: string;
  lat: string;
  lon: string;
  place_rank: number;
};

type SearchResultsProps = {
  query: string;
  onSelect: (result: SearchResult) => void;
};

const SearchResults = ({ query, onSelect }: SearchResultsProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        if (searchAbortControllerRef.current) {
          searchAbortControllerRef.current.abort();
        }
        const controller = new AbortController();
        searchAbortControllerRef.current = controller;
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query,
          )}`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        )
          .then((res) => res.json())
          .then((data: SearchResult[]) => setResults(data))
          .catch((err) => {
            if (err.name !== "AbortError") {
              console.error(err);
            }
          });
      } else {
        setResults([]);
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, [query]);

  return (
    <CommandList className="max-h-auto overflow-y-scroll">
      <CommandGroup>
        {results.map((result) => (
          <CommandItem key={result.place_id} onSelect={() => onSelect(result)}>
            {result.display_name}
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
};

const SearchControl = () => {
  const map = useMap();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const addLocation = useLocationStore((state) => state.addLocation);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    map.setView([lat, lon]);
    addLocation({ address: result.display_name, position: [lat, lon] });
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <Button onClick={() => setOpen((prev) => !prev)}>
        <Search />
      </Button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          ></div>
          <div
            className="fixed z-50 top-20 left-1/2 transform -translate-x-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="w-96 shadow-lg rounded-lg">
              <CommandInput
                ref={inputRef}
                placeholder="Search everywhere..."
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
              />
              <SearchResults
                query={searchQuery}
                onSelect={handleSelectResult}
              />
            </Command>
          </div>
        </>
      )}
    </>
  );
};

export {
  PointsOfInterestMarker,
  ZoomControl,
  LocateButton,
  SearchControl,
  AutoLocate,
};
