import React from 'react';
import { Play, RotateCcw, Settings, Keyboard, ShieldAlert } from 'lucide-react';
import { useGameStore } from './stores/useGameStore';
import { GameScene } from './game/GameScene';
import { HUD } from './ui/HUD';
import { ModalOverlays } from './ui/ModalOverlays';

export const App: React.FC = () => {
  const screen = useGameStore((s) => s.screen);
  const startGame = useGameStore((s) => s.startGame);
  const setScreen = useGameStore((s) => s.setScreen);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const healPlayer = useGameStore((s) => s.healPlayer);
  const hasSavedGame = useGameStore((s) => s.hasSavedGame);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 select-none">
      <GameScene />

      {screen === 'playing' && <HUD />}

      <ModalOverlays />

      {screen === 'menu' && (
        <div className="fixed inset-0 z-20 flex items-center justify-between bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-transparent p-12 backdrop-blur-sm">
          <div className="max-w-lg">
            <div className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold tracking-widest text-amber-400 border border-amber-500/40 mb-3">
              3D OPEN-WORLD SANDBOX
            </div>
            <h1 className="text-6xl font-black italic tracking-tight text-white drop-shadow-lg">
              URBAN <span className="text-amber-400">LEGENDS</span>
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Explore a procedural 9x9 district metropolis. Drive 5 physics-tuned vehicles,
              complete 5 action missions, upgrade your garage fleet, and evade 5-star police
              pursuits.
            </p>

            <div className="mt-8 flex flex-col gap-3 w-72">
              <button
                onClick={() => startGame(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 py-3.5 text-base font-black text-slate-950 shadow-lg transition transform hover:scale-[1.02]"
              >
                <Play className="h-5 w-5 fill-current" /> PLAY NEW GAME
              </button>

              {hasSavedGame() && (
                <button
                  onClick={() => startGame(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg"
                >
                  <RotateCcw className="h-4 w-4" /> CONTINUE SAVED GAME
                </button>
              )}

              <button
                onClick={() => setActiveModal('settings')}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-3 text-sm font-bold text-slate-200 border border-slate-700"
              >
                <Settings className="h-4 w-4" /> SETTINGS
              </button>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-900/90 p-4 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-bold text-amber-400 mb-2">
                <Keyboard className="h-4 w-4" /> CONTROLS QUICK GUIDE
              </div>
              <div className="grid grid-cols-2 gap-y-1.5">
                <span><strong className="text-white">WASD / Arrows:</strong> Move & Drive</span>
                <span><strong className="text-white">Mouse:</strong> Aim & Rotate Camera</span>
                <span><strong className="text-white">E:</strong> Enter / Exit Vehicle & Interact</span>
                <span><strong className="text-white">Click / F:</strong> Fire Weapon / Action</span>
                <span><strong className="text-white">Shift:</strong> Sprint / Nitro Boost</span>
                <span><strong className="text-white">Space:</strong> Jump / Handbrake Drift</span>
                <span><strong className="text-white">Tab:</strong> Fullscreen GPS Map</span>
                <span><strong className="text-white">V / Esc:</strong> Camera Mode / Pause</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {screen === 'paused' && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="w-80 rounded-2xl bg-slate-900 p-6 text-center border border-slate-700 shadow-2xl">
            <h2 className="text-2xl font-black text-amber-400 mb-5">GAME PAUSED</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setScreen('playing')}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 py-3 font-black text-slate-950"
              >
                RESUME GAME
              </button>
              <button
                onClick={() => setActiveModal('settings')}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 py-3 font-bold text-white"
              >
                SETTINGS
              </button>
              <button
                onClick={() => setScreen('menu')}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 py-3 font-bold text-white"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === 'gameover' && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-rose-950/85 backdrop-blur-md">
          <ShieldAlert className="h-16 w-16 text-rose-400 mb-3 animate-bounce" />
          <h1 className="text-6xl font-black tracking-widest text-rose-500 uppercase drop-shadow">
            WASTED
          </h1>
          <p className="mt-2 text-sm text-rose-200">
            Central Medical Hospital Emergency Recovery ($250 fee)
          </p>
          <button
            onClick={healPlayer}
            className="mt-6 rounded-xl bg-white hover:bg-rose-100 px-8 py-3.5 text-sm font-black text-slate-950 shadow-xl"
          >
            RESPAWN AT HOSPITAL
          </button>
        </div>
      )}
    </div>
  );
};

export default App;