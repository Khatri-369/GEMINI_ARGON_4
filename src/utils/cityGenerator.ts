import { BuildingData, DistrictType, LandmarkData, MissionDefinition, VehicleSpec, VehicleType } from '../types/game';

export const GRID_RADIUS = 4;
export const BLOCK_STEP = 60;
export const BLOCK_SIZE = 46;
export const ROAD_WIDTH = 14;

export const VEHICLE_SPECS: Record<VehicleType, VehicleSpec> = {
  sports: {
    type: 'sports',
    name: 'Infernus GT',
    price: 25000,
    maxSpeed: 46,
    acceleration: 38,
    handling: 4.0,
    mass: 1100,
    maxHealth: 100,
    hasNitro: true,
    color: '#ef4444',
    dimensions: [2.2, 1.15, 4.6],
  },
  sedan: {
    type: 'sedan',
    name: 'Stratum Sedan',
    price: 8500,
    maxSpeed: 32,
    acceleration: 24,
    handling: 3.2,
    mass: 1350,
    maxHealth: 120,
    hasNitro: false,
    color: '#3b82f6',
    dimensions: [2.1, 1.4, 4.5],
  },
  suv: {
    type: 'suv',
    name: 'Patriot XL',
    price: 16000,
    maxSpeed: 30,
    acceleration: 22,
    handling: 2.8,
    mass: 1900,
    maxHealth: 180,
    hasNitro: false,
    color: '#10b981',
    dimensions: [2.4, 1.85, 4.9],
  },
  motorcycle: {
    type: 'motorcycle',
    name: 'Akuma 900',
    price: 12000,
    maxSpeed: 48,
    acceleration: 45,
    handling: 4.8,
    mass: 450,
    maxHealth: 75,
    hasNitro: true,
    color: '#f59e0b',
    dimensions: [0.95, 1.2, 2.3],
  },
  police: {
    type: 'police',
    name: 'LSPD Interceptor',
    price: 35000,
    maxSpeed: 43,
    acceleration: 35,
    handling: 3.8,
    mass: 1500,
    maxHealth: 150,
    hasNitro: true,
    color: '#111827',
    dimensions: [2.2, 1.45, 4.7],
  },
};

export const MISSIONS: MissionDefinition[] = [
  {
    id: 'm1_first_drive',
    title: 'Mission 1: First Drive',
    description: 'Get behind the wheel and drive through Downtown to the Ocean Beach Dealership.',
    reward: 2500,
    startLocation: [16, 0.5, 16],
    checkpoints: [
      [0, 0.5, -60],
      [60, 0.5, -60],
      [120, 0.5, -45],
    ],
  },
  {
    id: 'm2_delivery_rush',
    title: 'Mission 2: Delivery Rush',
    description: 'Deliver the high-priority package across three drop-offs before the 75-second timer runs out!',
    reward: 5000,
    startLocation: [105, 0.5, -45],
    timeLimit: 75,
    checkpoints: [
      [0, 0.5, -120],
      [-120, 0.5, -60],
      [-120, 0.5, 60],
      [0, 0.5, 120],
    ],
  },
  {
    id: 'm3_street_race',
    title: 'Mission 3: Street Race',
    description: 'Blast through the highway loop checkpoints against the clock and rival street racers.',
    reward: 8500,
    startLocation: [-16, 0.5, 105],
    timeLimit: 95,
    checkpoints: [
      [120, 0.5, 120],
      [180, 0.5, 0],
      [120, 0.5, -180],
      [-120, 0.5, -180],
      [-180, 0.5, 0],
      [0, 0.5, 0],
    ],
  },
  {
    id: 'm4_police_escape',
    title: 'Mission 4: Police Escape',
    description: 'A heist alarm triggered a 3-Star Wanted Level! Break line-of-sight and reach the hideout clear of cops.',
    reward: 12000,
    startLocation: [-45, 0.5, -45],
    requiredWanted: 3,
    checkpoints: [[180, 0.5, 180]],
  },
  {
    id: 'm5_city_explorer',
    title: 'Mission 5: City Explorer',
    description: 'Tour the five major landmarks of Urban Legends: Police HQ, Hospital, Central Park, North Bridge, and Ocean Pier.',
    reward: 15000,
    startLocation: [45, 0.5, 45],
    checkpoints: [
      [-60, 0.5, 42],
      [60, 0.5, 42],
      [-60, 0.5, -60],
      [0, 0.5, -180],
      [210, 0.5, 0],
    ],
  },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999.123) * 10000;
  return x - Math.floor(x);
}

export function generateCityData(): {
  buildings: BuildingData[];
  landmarks: LandmarkData[];
  trees: [number, number, number][];
  streetlights: [number, number, number][];
} {
  const buildings: BuildingData[] = [];
  const landmarks: LandmarkData[] = [];
  const trees: [number, number, number][] = [];
  const streetlights: [number, number, number][] = [];

  for (let gx = -GRID_RADIUS; gx <= GRID_RADIUS; gx++) {
    for (let gz = -GRID_RADIUS; gz <= GRID_RADIUS; gz++) {
      const cx = gx * BLOCK_STEP;
      const cz = gz * BLOCK_STEP;
      const seed = (gx + 10) * 100 + (gz + 10);

      streetlights.push([cx - BLOCK_SIZE / 2 + 1.5, 0, cz - BLOCK_SIZE / 2 + 1.5]);
      streetlights.push([cx + BLOCK_SIZE / 2 - 1.5, 0, cz + BLOCK_SIZE / 2 - 1.5]);

      if (gx === 4) {
        if (gz === 0) {
          landmarks.push({
            id: 'landmark_beach_pier',
            name: 'Ocean Beach Pier',
            category: 'beach',
            position: [cx, 0.5, cz],
            color: '#38bdf8',
          });
        }
        trees.push([cx - 10, 0, cz - 10], [cx - 8, 0, cz + 12]);
        continue;
      }

      if ((gx === -1 && gz === -1) || (gx === 1 && gz === 1)) {
        for (let t = 0; t < 7; t++) {
          const tx = cx + (seededRandom(seed + t * 3) - 0.5) * 34;
          const tz = cz + (seededRandom(seed + t * 7) - 0.5) * 34;
          trees.push([tx, 0, tz]);
        }
        continue;
      }

      if (gx === -1 && gz === 1) {
        buildings.push({
          id: 'b_police_hq',
          position: [cx, 11, cz],
          size: [28, 22, 24],
          color: '#1e3a8a',
          district: 'civic',
          label: 'LSPD HQ',
        });
        landmarks.push({
          id: 'lm_police',
          name: 'Police Station HQ',
          category: 'police',
          position: [cx, 0.5, cz + 18],
          color: '#3b82f6',
        });
        continue;
      }

      if (gx === 1 && gz === 0) {
        buildings.push({
          id: 'b_hospital',
          position: [cx, 13, cz],
          size: [26, 26, 24],
          color: '#f8fafc',
          district: 'civic',
          label: 'CENTRAL HOSPITAL',
        });
        landmarks.push({
          id: 'lm_hospital',
          name: 'Central Medical Hospital',
          category: 'hospital',
          position: [cx, 0.5, cz + 18],
          color: '#ef4444',
        });
        continue;
      }

      if (gx === 0 && gz === 2) {
        buildings.push({
          id: 'b_garage',
          position: [cx, 5, cz - 6],
          size: [26, 10, 18],
          color: '#d97706',
          district: 'commercial',
          label: 'CUSTOM GARAGE & REPAIR',
        });
        landmarks.push({
          id: 'lm_garage',
          name: 'Player Garage & Pay-N-Spray',
          category: 'garage',
          position: [cx, 0.5, cz + 12],
          color: '#f59e0b',
        });
        continue;
      }

      if (gx === 2 && gz === -1) {
        buildings.push({
          id: 'b_dealership',
          position: [cx, 6, cz - 6],
          size: [28, 12, 18],
          color: '#7c3aed',
          district: 'commercial',
          label: 'LUXURY MOTORSPORT DEALERSHIP',
        });
        landmarks.push({
          id: 'lm_dealership',
          name: 'Motorsport Vehicle Dealership',
          category: 'dealership',
          position: [cx, 0.5, cz + 12],
          color: '#a855f7',
        });
        continue;
      }

      if (gx === -2 && gz === 0) {
        buildings.push({
          id: 'b_gas_station',
          position: [cx, 4, cz - 8],
          size: [20, 8, 12],
          color: '#dc2626',
          district: 'commercial',
          label: 'RON GAS & REPAIR',
        });
        landmarks.push({
          id: 'lm_gas',
          name: 'Gas Station & Quick Repair',
          category: 'gas',
          position: [cx, 0.5, cz + 10],
          color: '#22c55e',
        });
        continue;
      }

      const isDowntown = Math.abs(gx) <= 1 && Math.abs(gz) <= 1;
      const isResidential = gx <= -2;
      const district: DistrictType = isDowntown
        ? 'downtown'
        : isResidential
        ? 'residential'
        : 'commercial';

      const subOffsets = [
        [-10, -10],
        [10, -10],
        [-10, 10],
        [10, 10],
      ];

      subOffsets.forEach(([ox, oz], idx) => {
        const r = seededRandom(seed + idx * 19);
        const h = isDowntown
          ? 28 + Math.floor(r * 45)
          : isResidential
          ? 7 + Math.floor(r * 10)
          : 14 + Math.floor(r * 18);

        const w = 13 + Math.floor(seededRandom(seed + idx * 23) * 4);
        const d = 13 + Math.floor(seededRandom(seed + idx * 29) * 4);

        const palette = isDowntown
          ? ['#1e293b', '#334155', '#0f172a', '#1e3a5f']
          : isResidential
          ? ['#78350f', '#9a3412', '#713f12', '#475569']
          : ['#374151', '#4b5563', '#1f2937'];

        const color = palette[Math.floor(r * palette.length)];

        buildings.push({
          id: `b_${gx}_${gz}_${idx}`,
          position: [cx + ox, h / 2, cz + oz],
          size: [w, h, d],
          color,
          district,
        });
      });
    }
  }

  return { buildings, landmarks, trees, streetlights };
}

export const CITY_DATA = generateCityData();