import React from 'react';
import { Star, ShieldAlert, Crosshair, Car, MapPin } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { MISSIONS, VEHICLE_SPECS } from '../utils/cityGenerator';
import { MinimapCanvas } from './MinimapCanvas';

export const HUD: React.FC = () => {
  const health = useGameStore((s) => s.health);
  const stamina = useGameStore((s) => s.stamina);
  const money = useGameStore((s) => s.money);
  const wantedLevel = useGameStore((s) => s.wantedLevel);
  const ammo = useGameStore((s) => s.ammo);
  const maxAmmo = useGameStore((s) => s.maxAmmo);
  const isReloading = useGameStore((s) => s.isReloading);
  const currentVehicleId = useGameStore((s) => s.currentVehicleId);
  const currentSpeed = useGameStore((s) => s.currentSpeed);
  const vehicles = useGameStore((s) => s.vehicles);
  const activeMissionId = useGameStore((s) => s.activeMissionId);
  const missionStage = useGameStore((s) => s.missionStage);
  const missionTimer = useGameStore((s) => s.missionTimer);
  const missionBanner = useGameStore((s) => s.missionBanner);
  const interactionPrompt = useGameStore((s) => s.interactionPrompt);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const currentVehicle = vehicles.find((v) => v.id === currentVehicleId);
  const activeMission = MISSIONS.find((m) => m.id === activeMissionId);

  const hours = Math.floor(timeOfDay);
  const mins = Math.floor((timeOfDay % 1) * 60);
  const timeFormatted = `${hours.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}`;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-5 font-sans">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg bg-slate-900/85 px-3 py-2 border border-slate-700 backdrop-blur">
            <span className="font-mono text-xs text-sky-400">{timeFormatted}</span>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setActiveModal('map')}
              className="text-xs font-semibold text-slate-200 hover:text-amber-400"
            >
              [TAB] Map
            </button>
            <button
              onClick={() => setActiveModal('garage')}
              className="text-xs font-semibold text-slate-200 hover:text-amber-400"
            >
              Garage
            </button>
            <button
              onClick={() => setActiveModal('dealership')}
              className="text-xs font-semibold text-slate-200 hover:text-amber-400"
            >
              Shop
            </button>
          </div>

          {activeMission ? (
            <div className="max-w-xs rounded-xl bg-slate-900/90 p-3.5 border-l-4 border-amber-400 shadow-lg">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {activeMission.title}
              </div>
              <p className="mt-1 text-xs text-slate-200">{activeMission.description}</p>
              <div className="mt-2 flex items-center justify-between text-xs font-mono text-slate-300">
                <span>
                  Checkpoint: {missionStage + 1} / {activeMission.checkpoints.length}
                </span>
                {missionTimer > 0 && (
                  <span className="text-rose-400 font-bold">
                    {missionTimer.toFixed(1)}s
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-xs rounded-xl bg-slate-900/75 px-3.5 py-2.5 border border-slate-800 text-xs text-slate-300">
              <MapPin className="inline w-3.5 h-3.5 text-amber-400 mr-1" />
              Drive to any glowing yellow beacon to start a Mission.
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-900/85 px-3 py-1.5 border border-slate-800">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= wantedLevel
                    ? 'fill-amber-400 text-amber-400 animate-pulse'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="font-mono text-3xl font-extrabold tracking-tight text-emerald-400 drop-shadow">
            ${money.toLocaleString()}
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-900/85 px-3 py-1.5 border border-slate-800 text-xs font-mono">
            <Crosshair className="h-4 w-4 text-sky-400" />
            <span>PISTOL</span>
            <span className="text-amber-400 font-bold">
              {isReloading ? 'RELOADING...' : `${ammo}/${maxAmmo}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        {missionBanner && (
          <div className="mb-12 rounded-2xl bg-slate-950/90 px-10 py-6 text-center border-2 border-amber-400 shadow-2xl">
            <h2 className="text-3xl font-black tracking-wider text-amber-400 uppercase">
              {missionBanner.title}
            </h2>
            <p className="mt-1 text-sm text-slate-200">{missionBanner.subtitle}</p>
            {missionBanner.reward && (
              <p className="mt-2 font-mono text-xl font-bold text-emerald-400">
                +${missionBanner.reward.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {!currentVehicleId && (
          <div className="h-1.5 w-1.5 rounded-full bg-white/80 ring-2 ring-slate-900/60" />
        )}

        {interactionPrompt && (
          <div className="mt-24 rounded-full bg-slate-950/90 px-5 py-2 text-sm font-bold text-amber-300 border border-amber-400/50 shadow-lg">
            {interactionPrompt}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-end gap-4">
          <MinimapCanvas />
          <div className="flex flex-col gap-2 w-44 rounded-xl bg-slate-900/85 p-3 border border-slate-800">
            <div>
              <div className="flex justify-between text-xs font-bold text-rose-400 mb-1">
                <span>HEALTH</span>
                <span>{Math.round(health)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all"
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-sky-400 mb-1">
                <span>STAMINA / NITRO</span>
                <span>{Math.round(stamina)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-sky-400 transition-all"
                  style={{ width: `${stamina}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {currentVehicle && (
          <div className="flex items-center gap-4 rounded-2xl bg-slate-900/90 px-5 py-3.5 border border-slate-700 shadow-xl">
            <Car className="h-8 w-8 text-amber-400" />
            <div>
              <div className="text-xs font-bold uppercase text-slate-400">
                {VEHICLE_SPECS[currentVehicle.type].name}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-3xl font-black text-white">
                  {Math.round(currentSpeed)}
                </span>
                <span className="text-xs font-bold text-amber-400">MPH</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Armor: {Math.round(currentVehicle.health)}/{currentVehicle.maxHealth} | [V] Cam
              </div>
            </div>
          </div>
        )}

        {wantedLevel > 0 && !currentVehicle && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-950/90 px-4 py-2 border border-rose-500 text-xs font-bold text-rose-200">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            POLICE PURSUIT IN PROGRESS
          </div>
        )}
      </div>
    </div>
  );
};