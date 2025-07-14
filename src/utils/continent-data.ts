/**
 * continent-data.ts
 * Simplified continent outline data for neon wireframe globe
 * Uses basic geometric approximations of continent shapes
 */

export interface ContinentOutline {
  name: string;
  color: string;
  paths: Array<{
    lat: number;
    lng: number;
  }[]>;
}

// Convert lat/lng to 3D sphere coordinates
export function latLngToSphere(lat: number, lng: number, radius: number = 1.005) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta)
  };
}

// Simplified continent outlines using key geographic points
export const continentOutlines: ContinentOutline[] = [
  {
    name: "North America",
    color: "#00ff00",
    paths: [
      [
        // Rough outline of North America
        { lat: 70, lng: -140 },  // Alaska
        { lat: 60, lng: -120 },  // Western Canada
        { lat: 50, lng: -125 },  // Pacific Coast
        { lat: 35, lng: -118 },  // California
        { lat: 25, lng: -100 },  // Mexico
        { lat: 25, lng: -80 },   // Florida
        { lat: 40, lng: -75 },   // East Coast
        { lat: 45, lng: -65 },   // Maritime Canada
        { lat: 60, lng: -65 },   // Labrador
        { lat: 70, lng: -90 },   // Arctic
        { lat: 70, lng: -140 }   // Close path
      ]
    ]
  },
  {
    name: "South America",
    color: "#00ff00",
    paths: [
      [
        // Rough outline of South America
        { lat: 12, lng: -70 },   // Colombia/Venezuela
        { lat: 5, lng: -60 },    // Guyana
        { lat: -10, lng: -35 },  // Brazil east coast
        { lat: -25, lng: -40 },  // Brazil southeast
        { lat: -35, lng: -55 },  // Argentina
        { lat: -55, lng: -65 },  // Southern tip
        { lat: -45, lng: -75 },  // Chile
        { lat: -20, lng: -70 },  // Peru/Chile
        { lat: 0, lng: -80 },    // Ecuador
        { lat: 12, lng: -70 }    // Close path
      ]
    ]
  },
  {
    name: "Africa",
    color: "#00ff00",
    paths: [
      [
        // Rough outline of Africa
        { lat: 35, lng: -5 },    // Morocco
        { lat: 35, lng: 30 },    // Egypt
        { lat: 15, lng: 45 },    // Horn of Africa
        { lat: -35, lng: 30 },   // South Africa east
        { lat: -35, lng: 20 },   // South Africa
        { lat: 5, lng: 10 },     // West Africa
        { lat: 35, lng: -5 }     // Close path
      ]
    ]
  },
  {
    name: "Europe",
    color: "#00ff00",
    paths: [
      [
        // Rough outline of Europe
        { lat: 70, lng: 25 },    // Northern Scandinavia
        { lat: 60, lng: 30 },    // Finland
        { lat: 45, lng: 40 },    // Eastern Europe
        { lat: 35, lng: 25 },    // Greece
        { lat: 35, lng: -10 },   // Spain
        { lat: 50, lng: -5 },    // France/UK
        { lat: 60, lng: 5 },     // Norway
        { lat: 70, lng: 25 }     // Close path
      ]
    ]
  },
  {
    name: "Asia",
    color: "#00ff00",
    paths: [
      [
        // Rough outline of Asia
        { lat: 70, lng: 40 },    // Northern Russia
        { lat: 70, lng: 180 },   // Eastern Siberia
        { lat: 60, lng: 140 },   // Far East Russia
        { lat: 35, lng: 140 },   // Japan area
        { lat: 20, lng: 120 },   // Southeast Asia
        { lat: 10, lng: 100 },   // Malaysia
        { lat: 25, lng: 70 },    // India
        { lat: 35, lng: 60 },    // Iran
        { lat: 40, lng: 40 },    // Turkey
        { lat: 70, lng: 40 }     // Close path
      ]
    ]
  },
  {
    name: "Australia",
    color: "#00ff00",
    paths: [
      [
        // Rough outline of Australia
        { lat: -10, lng: 130 },  // Northern Australia
        { lat: -25, lng: 150 },  // Eastern Australia
        { lat: -40, lng: 145 },  // Tasmania area
        { lat: -35, lng: 115 },  // Western Australia
        { lat: -20, lng: 115 },  // Northwestern Australia
        { lat: -10, lng: 130 }   // Close path
      ]
    ]
  }
];

// Latitude and longitude grid lines for the retro effect
export const gridLines = {
  latitudes: [-60, -30, 0, 30, 60], // Major latitude lines
  longitudes: [-120, -60, 0, 60, 120, 180] // Major longitude lines
};

// Generate grid line paths
export function generateGridLines() {
  const lines: Array<{ lat: number; lng: number }[]> = [];
  
  // Latitude lines (horizontal)
  gridLines.latitudes.forEach(lat => {
    const line: { lat: number; lng: number }[] = [];
    for (let lng = -180; lng <= 180; lng += 5) {
      line.push({ lat, lng });
    }
    lines.push(line);
  });
  
  // Longitude lines (vertical)
  gridLines.longitudes.forEach(lng => {
    const line: { lat: number; lng: number }[] = [];
    for (let lat = -80; lat <= 80; lat += 5) {
      line.push({ lat, lng });
    }
    lines.push(line);
  });
  
  return lines;
}