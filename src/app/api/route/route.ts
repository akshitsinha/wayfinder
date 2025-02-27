import { NextResponse } from "next/server";

export type Position = [number, number] | [number, number, number];

export interface GeoJSONLineString {
  type: "LineString";
  coordinates: Position[];
}

export interface RouteGeometry {
  type: "LineString";
  coordinates: Position[];
}

export type RouteInstruction = {
  text: string;
  distance: number;
  time: number;
  instruction: string;
};

export type RouteInfo = {
  distance: number;
  duration: number;
  geometry: RouteGeometry;
  instructions?: RouteInstruction[];
};

type Coordinates = [number, number];

export interface JSONSchema {
  type: string;
  bbox: number[];
  features: Feature[];
  metadata: Metadata;
}

export interface Feature {
  bbox: number[];
  type: string;
  properties: Properties;
  geometry: Geometry;
}

export interface Geometry {
  coordinates: Array<number[]>;
  type: string;
}

export interface Properties {
  ascent: number;
  descent: number;
  segments: Segment[];
  extras: Extras;
  warnings: Warning[];
  way_points: number[];
  summary: PropertiesSummary;
}

export interface Extras {
  roadaccessrestrictions: Roadaccessrestrictions;
}

export interface Roadaccessrestrictions {
  values: Array<number[]>;
  summary: SummaryElement[];
}

export interface SummaryElement {
  value: number;
  distance: number;
  amount: number;
}

export interface Segment {
  distance: number;
  duration: number;
  steps: Step[];
  ascent: number;
  descent: number;
}

export interface Step {
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  name: string;
  way_points: number[];
  exit_number?: number;
}

export interface PropertiesSummary {
  distance: number;
  duration: number;
}

export interface Warning {
  code: number;
  message: string;
}

export interface Metadata {
  attribution: string;
  service: string;
  timestamp: number;
  query: Query;
  engine: Engine;
  system_message: string;
}

export interface Engine {
  version: string;
  build_date: Date;
  graph_date: Date;
}

export interface Query {
  coordinates: Array<number[]>;
  profile: string;
  profileName: string;
  preference: string;
  format: string;
  units: string;
  language: string;
  geometry: boolean;
  instructions: boolean;
  elevation: boolean;
}

type RouteRequest = {
  fromCoords: [number, number];
  toCoords: [number, number];
};

type RouteResponse = {
  geometry: RouteGeometry;
  routeInfo: RouteInfo;
};

type RouteError = {
  message: string;
  code?: string;
  name?: string;
  stack?: string;
};

async function calculateRoute(
  fromCoords: Coordinates,
  toCoords: Coordinates,
): Promise<{ geometry: RouteGeometry; routeInfo: RouteInfo }> {
  try {
    const apiKey = process.env.ORS_KEY || "";
    const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;

    const body = {
      coordinates: [fromCoords, toCoords],
      instructions: true,
      preference: "fastest",
      units: "km",
      language: "en",
      geometry: true,
      elevation: true,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate route: ${response.statusText}`);
    }

    const data = (await response.json()) as JSONSchema;

    if (data.features && data.features.length > 0) {
      const route = data.features[0];

      const geometry: RouteGeometry = {
        type: "LineString",
        coordinates: route.geometry.coordinates as Position[],
      };

      const routeInstructions: RouteInstruction[] =
        route.properties.segments[0].steps.map(
          (step: Step): RouteInstruction => ({
            text: step.instruction,
            distance: step.distance,
            time: step.duration,
            instruction: step.name,
          }),
        );

      const routeInfo: RouteInfo = {
        distance: route.properties.summary.distance,
        duration: route.properties.summary.duration,
        geometry,
        instructions: routeInstructions,
      };

      return {
        geometry,
        routeInfo,
      };
    } else {
      throw new Error("No route found");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error calculating route:", error.message);
    } else {
      console.error("Error calculating route:", String(error));
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { fromCoords, toCoords } = (await request.json()) as RouteRequest;

    if (!fromCoords || !toCoords) {
      return NextResponse.json(
        { error: "Missing coordinates" },
        { status: 400 },
      );
    }

    const routeData = await calculateRoute(fromCoords, toCoords);
    return NextResponse.json(routeData satisfies RouteResponse);
  } catch (error: unknown) {
    const routeError: RouteError =
      error instanceof Error
        ? { message: error.message, name: error.name, stack: error.stack }
        : { message: String(error) };

    console.error("Route calculation error:", routeError);
    return NextResponse.json({ error: routeError.message }, { status: 500 });
  }
}
