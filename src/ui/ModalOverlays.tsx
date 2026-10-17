import React from 'react';
import { X, Wrench, ShoppingBag, Volume2, Compass } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { VEHICLE_SPECS } from '../utils/cityGenerator';
import { VehicleType } from '../types/game';
import { MinimapCanvas } from './MinimapCanvas';

export const ModalOverlays: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const money = useGameStore((s) => s.money);
  const ownedVehicles = useGameStore((s) => s.ownedVehicles);
  const upgradeLevel = useGameStore((s) => s.upgradeLevel);
  const buyVehicle = useGameStore((s) => s.buyVehicle);
  const spawnGarageVehicle = useGameStore((s) => s.spawnGarageVehicle);
  const upgradeVehicles = useGameStore((s) => s.upgradeVehicles);
  const repairCurrentVehicle = useGameStore((s) => s.repairCurrentVehicle);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const setWaypoint = useGameStore((s) => s.setWaypoint);

  if (activeModal === 'none') return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 p-6 border border-slate-700 shadow-2xl">
        <button
          onClick={() => setActiveModal('none')}
          className="absolute right-4 top-4 rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-rose-600 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {activeModal === 'map' && (
          <div className="flex flex-col items-center">
            <h2 className="flex items-center gap-2 text-xl font-bold text-amber-400 mb-2">
              <Compass className="h-5 w-5" /> INTERACTIVE CITY GPS MAP
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Click anywhere on the city grid to set a custom navigation waypoint.
            </p>
            <MinimapCanvas fullScreen />
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300">Blue: Police HQ</span>
              <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-300">Red: Hospital</span>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300">Orange: Garage</span>
              <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300">Purple: Dealership</span>
              <button
                onClick={() => setWaypoint(null)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
              >
                Clear Waypoint
              </button>
            </div>
          </div>
        )}

        {activeModal === 'garage' && (
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-amber-400 mb-1">
              <Wrench className="h-6 w-6" /> CUSTOM GARAGE & PAY-N-SPRAY
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Spawn owned vehicles, repair chassis damage, or tune engine performance.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => repairCurrentVehicle(150)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 p-3 font-bold text-sm"
              >
                Full Repair & Respray ($150)
              </button>
              <button
                onClick={() => upgradeVehicles()}
                className="rounded-xl bg-sky-600 hover:bg-sky-500 p-3 font-bold text-sm"
              >
                Engine Tune Stage {upgradeLevel}/5 (${(upgradeLevel * 3000).toLocaleString()})
              </button>
            </div>

            <h3 className="text-sm font-bold uppercase text-slate-400 mb-2">
              Owned Vehicles (Click to Spawn & Drive)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {ownedVehicles.map((type) => {
                const spec = VEHICLE_SPECS[type];
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-xl bg-slate-800 p-3 border border-slate-700"
                  >
                    <div>
                      <div className="font-bold text-white">{spec.name}</div>
                      <div className="text-xs text-slate-400">
                        Top Speed: {Math.round(spec.maxSpeed * 2.4)} MPH
                      </div>
                    </div>
                    <button
                      onClick={() => spawnGarageVehicle(type)}
                      className="rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950"
                    >
                      DRIVE
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeModal === 'dealership' && (
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-purple-400 mb-1">
              <ShoppingBag className="h-6 w-6" /> LUXURY MOTORSPORT DEALERSHIP
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Available Balance: <span className="text-emerald-400 font-bold">${money.toLocaleString()}</span>
            </p>

            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-1">
              {(Object.keys(VEHICLE_SPECS) as VehicleType[]).map((type) => {
                const spec = VEHICLE_SPECS[type];
                const isOwned = ownedVehicles.includes(type);
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-xl bg-slate-800/90 p-3.5 border border-slate-700"
                  >
                    <div>
                      <div className="font-bold text-base text-white">{spec.name}</div>
                      <div className="text-xs text-slate-400">
                        Max Speed: {Math.round(spec.maxSpeed * 2.4)} MPH | Handling: {spec.handling} |{' '}
                        {spec.hasNitro ? 'Nitro Equipped' : 'Standard'}
                      </div>
                    </div>
                    {isOwned ? (
                      <button
                        onClick={() => spawnGarageVehicle(type)}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold"
                      >
                        OWNED (SPAWN)
                      </button>
                    ) : (
                      <button
                        onClick={() => buyVehicle(type)}
                        disabled={money < spec.price}
                        className="rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 px-4 py-2 text-xs font-black text-slate-950"
                      >
                        BUY ${spec.price.toLocaleString()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeModal === 'settings' && (
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-sky-400 mb-4">
              <Volume2 className="h-6 w-6" /> AUDIO & GRAPHICS SETTINGS
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 mb-1">
                  Master Volume ({Math.round(settings.masterVolume * 100)}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.masterVolume}
                  onChange={(e) => updateSettings({ masterVolume: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">
                  SFX & Engine Volume ({Math.round(settings.sfxVolume * 100)}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.sfxVolume}
                  onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Weather Mode</span>
                <button
                  onClick={() =>
                    updateSettings({
                      weather: settings.weather === 'clear' ? 'rain' : 'clear',
                    })
                  }
                  className="rounded-lg bg-slate-800 px-4 py-2 font-bold text-amber-400 border border-slate-600"
                >
                  {settings.weather.toUpperCase()}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>Graphics Quality</span>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() =>
                        updateSettings({
                          graphicsQuality: q,
                          drawDistance: q === 'low' ? 140 : q === 'medium' ? 190 : 250,
                        })
                      }
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase ${
                        settings.graphicsQuality === q
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};