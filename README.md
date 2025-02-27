# Wayfinder

Wayfinder is an open-source maps application built with OpenStreetMaps. It offers a customizable and unopinionated alternative to popular map services with an intuitive user interface and experience.

## Features

- **Dynamic Map View:** Powered by React Leaflet, the map supports smooth panning, zooming, and interactive tile layers.
- **Tile Layers:** Uses OpenStreetMap tiles for up-to-date imagery and data.
- **Geocoder Search:** Search for locations using the Nominatim API to translate addresses into coordinates and vice versa.
- **POI Search:** Fetch and display points of interest dynamically via the Overpass API.
- **Custom Marker Placement:** Place custom markers anywhere on the map, which can be easily revisited using the sidebar.
- **Reverse Geocoding:** Retrieve detailed place information via reverse geocoding for selected map areas.
- **Assistant Integration:** An integrated assistant offers guidance and support during map exploration using `Llama-3.2 1B Instruct` LLM running on the WebGPU.
- **Offline Support:** The map caches the areas you've already visited, allowing you to browse and use the map offline with limited capabilities using service worker.
- **PWA:** This is a Progressive Web App (PWA) that can be easily installed on desktop or mobile devices (both iPhone and Android) as a native application.
- **Navigation:** Provides turn-by-turn navigation and route planning, leveraging the OpenRouteService API for accurate and efficient routing.
- **Zustand Stores:** Utilizes Zustand for efficient and persistent state management, keeping marker preferences and map settings.

## Installation & Usage

### In Development

1. Clone the repository:
   ```sh
   git clone https://github.com/akshitsinha/wayfinder.git
   cd wayfinder
   ```
2. Install the dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

### In Production

1. Build the project:
   ```sh
   npm run build
   ```
2. Start the production server:
   ```sh
   npm start
   ```

## License

This project is licensed under the MIT License.
