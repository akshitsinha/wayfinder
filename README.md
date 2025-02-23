# Wayfinder

## Overview

Wayfinder is an open-source maps application built with OpenStreetMaps. It offers a customizable and unopinionated alternative to popular map services with an intuitive user interface and experience.

## Features

- **Dynamic Map View:** Powered by React Leaflet, the map supports smooth panning, zooming, and interactive tile layers.
- **Tile Layers:** Uses OpenStreetMap tiles for up-to-date imagery and data.
- **Auto Locate:** Automatically centers the map on the user's current location using geolocation services.
- **Locate Button:** Manually center the map on your current position with a user-friendly button.
- **Address Search:** Search for locations using the Nominatim API to translate addresses into coordinates.
- **POI Search:** Fetch and display points of interest dynamically via the Overpass API.
- **Custom Marker Placement:** Right-click on the map to open a context menu for placing custom markers.
- **Reverse Geocoding:** Retrieve detailed place information via reverse geocoding for selected map areas.
- **Sidebar Integration:** Side navigation for accessing additional options and functionalities.
- **Assistant Integration:** An integrated assistant offers guidance and support during map exploration using `Llama-3.2 1B Instruct` LLM running on the WebGPU.
- **Context Menus:** Right-click anywhere on the map to add markers or view location details.
- **Zustand Stores:** Utilizes Zustand for efficient and persistent state management, keeping marker preferences and map settings.
- **Marker Settings:** Manage and customize marker configurations including type, style, and behavior through the preferences store.

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
