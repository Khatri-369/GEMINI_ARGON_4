import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  jump: boolean;
  crouch: boolean;
  interact: boolean;
  attack: boolean;
  handbrake: boolean;
}

export function useKeyboard() {
  const keys = useRef<InputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    crouch: false,
    interact: false,
    attack: false,
    handbrake: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useGameStore.getState();
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = true;
          break;
        case 'Space':
          keys.current.jump = true;
          keys.current.handbrake = true;
          break;
        case 'KeyC':
          keys.current.crouch = !keys.current.crouch;
          break;
        case 'KeyE':
          keys.current.interact = true;
          break;
        case 'KeyF':
          keys.current.attack = true;
          break;
        case 'KeyR':
          state.reloadWeapon();
          break;
        case 'KeyV':
          state.cycleCameraMode();
          break;
        case 'Tab':
          e.preventDefault();
          if (state.screen === 'playing') {
            state.setActiveModal(state.activeModal === 'map' ? 'none' : 'map');
          }
          break;
        case 'Escape':
          if (state.activeModal !== 'none') {
            state.setActiveModal('none');
          } else if (state.screen === 'playing') {
            state.setScreen('paused');
          } else if (state.screen === 'paused') {
            state.setScreen('playing');
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = false;
          break;
        case 'Space':
          keys.current.jump = false;
          keys.current.handbrake = false;
          break;
        case 'KeyE':
          keys.current.interact = false;
          break;
        case 'KeyF':
          keys.current.attack = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}