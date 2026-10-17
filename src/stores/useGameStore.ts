import { create } from 'zustand';
import {
  BulletData,
  GameSettings,
  MissionId,
  VehicleInstanceData,
  VehicleType,
} from '../types/game';
import { MISSIONS, VEHICLE_SPECS } from '../utils/cityGenerator';
import { soundEngine } from '../audio/soundEngine';

const SAVE_KEY = 'URBAN_LEGENDS_SAVE_V1';

const INITIAL_VEHICLES: VehicleInstanceData[] = [
  {
    id: 'veh_starter_sports',
    type: 'sports',
    position: [10, 1.2, 8],
    rotation: 0,
    color: '#ef4444',
    health: 100,
    maxHealth: 100,
    isOwned: true,
  },
  {
    id: 'veh_downtown_sedan',
    type: 'sedan',
    position: [-14, 1.2, 22],
    rotation: Math.PI / 2,
    color: '#3b82f6',
    health: 120,
    maxHealth: 120,
  },
  {
    id: 'veh_park_suv',
    type: 'suv',
    position: [45, 1.5, -20],
    rotation: 0,
    color: '#10b981',
    health: 180,
    maxHealth: 180,
  },
  {
    id: 'veh_moto_1',
    type: 'motorcycle',
    position: [-22, 1.1, -15],
    rotation: -Math.PI / 4,
    color: '#f59e0b',
    health: 75,
    maxHealth: 75,
  },
  {
    id: 'veh_police_hq',
    type: 'police',
    position: [-60, 1.2, 48],
    rotation: Math.PI / 2,
    color: '#111827',
    health: 150,
    maxHealth: 150,
  },
];

export type ActiveModal = 'none' | 'map' | 'garage' | 'dealership' | 'settings' | 'controls';

interface GameState {
  screen: 'menu' | 'playing' | 'paused' | 'gameover';
  activeModal: ActiveModal;
  playerPos: [number, number, number];
  playerYaw: number;
  health: number;
  maxHealth: number;
  stamina: number;
  money: number;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  isCrouching: boolean;
  isSprinting: boolean;
  currentVehicleId: string | null;
  currentSpeed: number;
  cameraMode: 'third' | 'close' | 'hood';
  nitroAmount: number;
  timeOfDay: number;
  trafficLightPhase: 'NS_GREEN' | 'EW_GREEN';
  vehicles: VehicleInstanceData[];
  ownedVehicles: VehicleType[];
  upgradeLevel: number;
  wantedLevel: number;
  wantedDecayTimer: number;
  activeMissionId: MissionId | null;
  missionStage: number;
  missionTimer: number;
  completedMissions: MissionId[];
  missionBanner: { title: string; subtitle: string; reward?: number } | null;
  waypoint: [number, number] | null;
  interactionPrompt: string | null;
  bullets: BulletData[];
  settings: GameSettings;
  startGame: (loadSaved?: boolean) => void;
  setScreen: (screen: GameState['screen']) => void;
  setActiveModal: (modal: ActiveModal) => void;
  updatePlayerTransform: (pos: [number, number, number], yaw: number) => void;
  damagePlayer: (amount: number) => void;
  healPlayer: () => void;
  useStamina: (amount: number) => void;
  addMoney: (amount: number) => void;
  enterVehicle: (id: string) => void;
  exitVehicle: (exitPos: [number, number, number]) => void;
  updateVehicleTransform: (
    id: string,
    pos: [number, number, number],
    rotation: number,
    speed: number
  ) => void;
  damageVehicle: (id: string, amount: number) => void;
  repairCurrentVehicle: (cost: number) => boolean;
  buyVehicle: (type: VehicleType) => boolean;
  spawnGarageVehicle: (type: VehicleType) => void;
  upgradeVehicles: () => boolean;
  cycleCameraMode: () => void;
  reportCrime: (starsToAdd?: number) => void;
  clearWanted: () => void;
  startMission: (id: MissionId) => void;
  advanceMissionCheckpoint: () => void;
  failMission: (reason: string) => void;
  clearMissionBanner: () => void;
  fireWeapon: (origin: [number, number, number], direction: [number, number, number], fromPlayer?: boolean) => void;
  reloadWeapon: () => void;
  tickWorld: (dt: number) => void;
  setWaypoint: (wp: [number, number] | null) => void;
  setInteractionPrompt: (prompt: string | null) => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  saveGame: () => void;
  hasSavedGame: () => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  activeModal: 'none',
  playerPos: [0, 1.2, 0],
  playerYaw: 0,
  health: 100,
  maxHealth: 100,
  stamina: 100,
  money: 3500,
  ammo: 18,
  maxAmmo: 18,
  isReloading: false,
  isCrouching: false,
  isSprinting: false,
  currentVehicleId: null,
  currentSpeed: 0,
  cameraMode: 'third',
  nitroAmount: 100,
  timeOfDay: 13.5,
  trafficLightPhase: 'NS_GREEN',
  vehicles: INITIAL_VEHICLES,
  ownedVehicles: ['sports'],
  upgradeLevel: 1,
  wantedLevel: 0,
  wantedDecayTimer: 0,
  activeMissionId: null,
  missionStage: 0,
  missionTimer: 0,
  completedMissions: [],
  missionBanner: null,
  waypoint: null,
  interactionPrompt: null,
  bullets: [],
  settings: {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    graphicsQuality: 'high',
    weather: 'clear',
    drawDistance: 230,
  },

  startGame: (loadSaved = false) => {
    soundEngine.playUiClick();
    if (loadSaved) {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          set({
            screen: 'playing',
            activeModal: 'none',
            playerPos: data.playerPos ?? [0, 1.2, 0],
            money: data.money ?? 3500,
            completedMissions: data.completedMissions ?? [],
            ownedVehicles: data.ownedVehicles ?? ['sports'],
            upgradeLevel: data.upgradeLevel ?? 1,
            settings: { ...get().settings, ...(data.settings ?? {}) },
            health: 100,
            wantedLevel: 0,
            currentVehicleId: null,
          });
          return;
        } catch {
          // Fallback to new game
        }
      }
    }
    set({
      screen: 'playing',
      activeModal: 'none',
      health: 100,
      stamina: 100,
      wantedLevel: 0,
      currentVehicleId: null,
    });
  },

  setScreen: (screen) => set({ screen }),
  setActiveModal: (activeModal) => {
    soundEngine.playUiClick();
    set({ activeModal });
  },

  updatePlayerTransform: (pos, yaw) => set({ playerPos: pos, playerYaw: yaw }),

  damagePlayer: (amount) => {
    const next = Math.max(0, get().health - amount);
    if (next <= 0 && get().screen === 'playing') {
      soundEngine.playMissionChime(false);
      set({
        health: 0,
        screen: 'gameover',
        currentVehicleId: null,
        wantedLevel: 0,
        activeMissionId: null,
      });
    } else {
      set({ health: next });
    }
  },

  healPlayer: () => {
    set({
      health: 100,
      stamina: 100,
      screen: 'playing',
      playerPos: [60, 1.5, 44],
      money: Math.max(0, get().money - 250),
    });
  },

  useStamina: (amount) => {
    set((s) => ({ stamina: Math.max(0, Math.min(100, s.stamina + amount)) }));
  },

  addMoney: (amount) => {
    set((s) => ({ money: Math.max(0, s.money + amount) }));
    get().saveGame();
  },

  enterVehicle: (id) => {
    soundEngine.playUiClick();
    set({ currentVehicleId: id, interactionPrompt: null });
  },

  exitVehicle: (exitPos) => {
    soundEngine.playUiClick();
    soundEngine.updateEngineSound(0, false, false);
    set({
      currentVehicleId: null,
      currentSpeed: 0,
      playerPos: exitPos,
    });
  },

  updateVehicleTransform: (id, pos, rotation, speed) => {
    set((state) => ({
      currentSpeed: state.currentVehicleId === id ? speed : state.currentSpeed,
      playerPos: state.currentVehicleId === id ? pos : state.playerPos,
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, position: pos, rotation } : v
      ),
    }));
  },

  damageVehicle: (id, amount) => {
    soundEngine.playCrash();
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, health: Math.max(10, v.health - amount) } : v
      ),
    }));
  },

  repairCurrentVehicle: (cost) => {
    const state = get();
    if (state.money < cost) return false;
    soundEngine.playMissionChime(true);
    set({
      money: state.money - cost,
      health: 100,
      vehicles: state.vehicles.map((v) =>
        v.id === state.currentVehicleId ? { ...v, health: v.maxHealth } : v
      ),
    });
    get().saveGame();
    return true;
  },

  buyVehicle: (type) => {
    const state = get();
    const spec = VEHICLE_SPECS[type];
    if (state.ownedVehicles.includes(type) || state.money < spec.price) return false;
    soundEngine.playMissionChime(true);
    set({
      money: state.money - spec.price,
      ownedVehicles: [...state.ownedVehicles, type],
    });
    get().saveGame();
    return true;
  },

  spawnGarageVehicle: (type) => {
    const state = get();
    const spec = VEHICLE_SPECS[type];
    const spawnPos: [number, number, number] = [
      state.playerPos[0] + 4,
      1.4,
      state.playerPos[2] + 4,
    ];
    const newId = `veh_owned_${type}_${Date.now()}`;
    const newVeh: VehicleInstanceData = {
      id: newId,
      type,
      position: spawnPos,
      rotation: state.playerYaw,
      color: spec.color,
      health: spec.maxHealth,
      maxHealth: spec.maxHealth,
      isOwned: true,
    };
    set({
      vehicles: [...state.vehicles.slice(-8), newVeh],
      currentVehicleId: newId,
      activeModal: 'none',
    });
  },

  upgradeVehicles: () => {
    const state = get();
    const cost = state.upgradeLevel * 3000;
    if (state.money < cost || state.upgradeLevel >= 5) return false;
    soundEngine.playMissionChime(true);
    set({
      money: state.money - cost,
      upgradeLevel: state.upgradeLevel + 1,
    });
    get().saveGame();
    return true;
  },

  cycleCameraMode: () => {
    const modes: GameState['cameraMode'][] = ['third', 'close', 'hood'];
    const next = modes[(modes.indexOf(get().cameraMode) + 1) % modes.length];
    set({ cameraMode: next });
  },

  reportCrime: (starsToAdd = 1) => {
    set((s) => ({
      wantedLevel: Math.min(5, Math.max(s.wantedLevel + starsToAdd, 1)),
      wantedDecayTimer: 22,
    }));
  },

  clearWanted: () => set({ wantedLevel: 0, wantedDecayTimer: 0 }),

  startMission: (id) => {
    const mission = MISSIONS.find((m) => m.id === id);
    if (!mission) return;
    soundEngine.playMissionChime(true);
    set({
      activeMissionId: id,
      missionStage: 0,
      missionTimer: mission.timeLimit ?? 0,
      wantedLevel: mission.requiredWanted ? Math.max(get().wantedLevel, mission.requiredWanted) : get().wantedLevel,
      wantedDecayTimer: mission.requiredWanted ? 25 : get().wantedDecayTimer,
      waypoint: [mission.checkpoints[0][0], mission.checkpoints[0][2]],
      missionBanner: {
        title: mission.title,
        subtitle: mission.description,
      },
    });
    setTimeout(() => get().clearMissionBanner(), 4000);
  },

  advanceMissionCheckpoint: () => {
    const state = get();
    if (!state.activeMissionId) return;
    const mission = MISSIONS.find((m) => m.id === state.activeMissionId);
    if (!mission) return;

    const nextStage = state.missionStage + 1;

    if (mission.id === 'm4_police_escape' && state.wantedLevel > 0) {
      set({
        wantedLevel: 0,
        wantedDecayTimer: 0,
      });
    }

    if (nextStage >= mission.checkpoints.length) {
      soundEngine.playMissionChime(true);
      const alreadyDone = state.completedMissions.includes(mission.id);
      const updatedCompleted = alreadyDone
        ? state.completedMissions
        : [...state.completedMissions, mission.id];

      set({
        activeMissionId: null,
        missionStage: 0,
        missionTimer: 0,
        money: state.money + mission.reward,
        completedMissions: updatedCompleted,
        waypoint: null,
        missionBanner: {
          title: 'MISSION PASSED!',
          subtitle: mission.title,
          reward: mission.reward,
        },
      });
      get().saveGame();
      setTimeout(() => get().clearMissionBanner(), 4500);
    } else {
      soundEngine.playUiClick();
      const nextPt = mission.checkpoints[nextStage];
      set({
        missionStage: nextStage,
        waypoint: [nextPt[0], nextPt[2]],
      });
    }
  },

  failMission: (reason) => {
    soundEngine.playMissionChime(false);
    set({
      activeMissionId: null,
      missionStage: 0,
      missionTimer: 0,
      waypoint: null,
      missionBanner: {
        title: 'MISSION FAILED',
        subtitle: reason,
      },
    });
    setTimeout(() => get().clearMissionBanner(), 4000);
  },

  clearMissionBanner: () => set({ missionBanner: null }),

  fireWeapon: (origin, direction, fromPlayer = true) => {
    const state = get();
    if (fromPlayer) {
      if (state.isReloading || state.ammo <= 0) {
        if (state.ammo <= 0 && !state.isReloading) get().reloadWeapon();
        return;
      }
      soundEngine.playGunshot();
      set({ ammo: state.ammo - 1 });
    }

    const newBullet: BulletData = {
      id: `b_${Date.now()}_${Math.random()}`,
      origin,
      direction,
      createdAt: performance.now(),
      fromPlayer,
    };

    set((s) => ({ bullets: [...s.bullets.slice(-24), newBullet] }));
  },

  reloadWeapon: () => {
    if (get().isReloading) return;
    set({ isReloading: true });
    setTimeout(() => {
      set({ ammo: get().maxAmmo, isReloading: false });
    }, 1200);
  },

  tickWorld: (dt) => {
    const state = get();
    if (state.screen !== 'playing') return;

    const nextTime = (state.timeOfDay + dt * 0.065) % 24;
    const phase: GameState['trafficLightPhase'] =
      Math.floor(nextTime * 60) % 2 === 0 ? 'NS_GREEN' : 'EW_GREEN';

    let nextWanted = state.wantedLevel;
    let nextDecay = state.wantedDecayTimer;
    if (nextWanted > 0) {
      nextDecay -= dt;
      if (nextDecay <= 0) {
        nextWanted = Math.max(0, nextWanted - 1);
        nextDecay = nextWanted > 0 ? 18 : 0;
      }
    }

    let nextMissionTimer = state.missionTimer;
    if (state.activeMissionId && nextMissionTimer > 0) {
      nextMissionTimer -= dt;
      if (nextMissionTimer <= 0) {
        get().failMission('Time Expired!');
        return;
      }
    }

    const now = performance.now();
    const activeBullets = state.bullets.filter((b) => now - b.createdAt < 1400);

    soundEngine.updatePoliceSiren(nextWanted, dt);

    set({
      timeOfDay: nextTime,
      trafficLightPhase: phase,
      wantedLevel: nextWanted,
      wantedDecayTimer: nextDecay,
      missionTimer: nextMissionTimer,
      bullets: activeBullets,
    });
  },

  setWaypoint: (waypoint) => set({ waypoint }),
  setInteractionPrompt: (interactionPrompt) => set({ interactionPrompt }),

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    soundEngine.setVolumes(updated.masterVolume, updated.musicVolume, updated.sfxVolume);
    set({ settings: updated });
    get().saveGame();
  },

  saveGame: () => {
    const s = get();
    const payload = {
      playerPos: s.playerPos,
      money: s.money,
      completedMissions: s.completedMissions,
      ownedVehicles: s.ownedVehicles,
      upgradeLevel: s.upgradeLevel,
      settings: s.settings,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  },

  hasSavedGame: () => Boolean(localStorage.getItem(SAVE_KEY)),
}));