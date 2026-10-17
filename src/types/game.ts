export type VehicleType = 'sports' | 'sedan' | 'suv' | 'motorcycle' | 'police';

export interface VehicleSpec {
  type: VehicleType;
  name: string;
  price: number;
  maxSpeed: number;
  acceleration: number;
  handling: number;
  mass: number;
  maxHealth: number;
  hasNitro: boolean;
  color: string;
  dimensions: [number, number, number];
}

export interface VehicleInstanceData {
  id: string;
  type: VehicleType;
  position: [number, number, number];
  rotation: number;
  color: string;
  health: number;
  maxHealth: number;
  isOwned?: boolean;
}

export type MissionId =
  | 'm1_first_drive'
  | 'm2_delivery_rush'
  | 'm3_street_race'
  | 'm4_police_escape'
  | 'm5_city_explorer';

export interface MissionDefinition {
  id: MissionId;
  title: string;
  description: string;
  reward: number;
  startLocation: [number, number, number];
  checkpoints: [number, number, number][];
  timeLimit?: number;
  requiredWanted?: number;
}

export type DistrictType =
  | 'downtown'
  | 'residential'
  | 'commercial'
  | 'park'
  | 'beach'
  | 'civic'
  | 'industrial';

export interface BuildingData {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  district: DistrictType;
  label?: string;
}

export interface LandmarkData {
  id: string;
  name: string;
  category: 'police' | 'hospital' | 'garage' | 'dealership' | 'gas' | 'mission' | 'beach';
  position: [number, number, number];
  color: string;
}

export interface BulletData {
  id: string;
  origin: [number, number, number];
  direction: [number, number, number];
  createdAt: number;
  fromPlayer: boolean;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  weather: 'clear' | 'rain';
  drawDistance: number;
}