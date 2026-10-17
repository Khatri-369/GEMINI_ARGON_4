import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { CITY_DATA, MISSIONS } from '../utils/cityGenerator';

export const PlayerController: React.FC = () => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  const keys = useKeyboard();
  const { camera } = useThree();

  const cameraYaw = useRef(0);
  const cameraPitch = useRef(0.35);
  const interactCooldown = useRef(0);
  const shootCooldown = useRef(0);

  const currentVehicleId = useGameStore((s) => s.currentVehicleId);
  const screen = useGameStore((s) => s.screen);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (useGameStore.getState().screen !== 'playing') return;
      if (useGameStore.getState().activeModal !== 'none') return;
      if (document.pointerLockElement || e.buttons === 1) {
        cameraYaw.current -= e.movementX * 0.0032;
        cameraPitch.current = Math.max(
          0.08,
          Math.min(1.15, cameraPitch.current + e.movementY * 0.0025)
        );
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const state = useGameStore.getState();
      if (state.screen !== 'playing' || state.activeModal !== 'none') return;
      if (e.button === 0 && !state.currentVehicleId) {
        if (document.pointerLockElement) {
          const forward = new THREE.Vector3(
            -Math.sin(cameraYaw.current),
            0,
            -Math.cos(cameraYaw.current)
          ).normalize();
          state.fireWeapon(
            [state.playerPos[0], state.playerPos[1] + 0.6, state.playerPos[2]],
            [forward.x, forward.y, forward.z],
            true
          );
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  useEffect(() => {
    if (!currentVehicleId && bodyRef.current) {
      const pos = useGameStore.getState().playerPos;
      bodyRef.current.setTranslation({ x: pos[0], y: pos[1] + 0.8, z: pos[2] }, true);
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [currentVehicleId]);

  useFrame((state, dt) => {
    const store = useGameStore.getState();
    if (store.screen !== 'playing' || store.activeModal !== 'none') return;

    interactCooldown.current = Math.max(0, interactCooldown.current - dt);
    shootCooldown.current = Math.max(0, shootCooldown.current - dt);

    if (store.currentVehicleId) {
      return;
    }

    const rb = bodyRef.current;
    if (!rb) return;

    const pos = rb.translation();
    const vel = rb.linvel();

    const inputZ = (keys.current.forward ? 1 : 0) - (keys.current.backward ? 1 : 0);
    const inputX = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);

    const isMoving = inputZ !== 0 || inputX !== 0;
    const isSprinting = isMoving && keys.current.sprint && store.stamina > 5;
    const baseSpeed = keys.current.crouch ? 4.2 : isSprinting ? 12.5 : 7.5;

    if (isSprinting) {
      store.useStamina(-18 * dt);
    } else {
      store.useStamina(12 * dt);
    }

    const forwardDir = new THREE.Vector3(
      -Math.sin(cameraYaw.current),
      0,
      -Math.cos(cameraYaw.current)
    );
    const rightDir = new THREE.Vector3(
      Math.cos(cameraYaw.current),
      0,
      -Math.sin(cameraYaw.current)
    );

    const moveVec = new THREE.Vector3()
      .addScaledVector(forwardDir, inputZ)
      .addScaledVector(rightDir, inputX);

    if (moveVec.lengthSq() > 0) {
      moveVec.normalize().multiplyScalar(baseSpeed);
      const targetYaw = Math.atan2(moveVec.x, moveVec.z);
      if (meshGroupRef.current) {
        meshGroupRef.current.rotation.y = targetYaw;
      }
      store.updatePlayerTransform([pos.x, pos.y, pos.z], targetYaw);
    } else {
      store.updatePlayerTransform([pos.x, pos.y, pos.z], cameraYaw.current);
    }

    let nextVy = vel.y;
    if (keys.current.jump && Math.abs(vel.y) < 0.15) {
      nextVy = 6.8;
    }

    rb.setLinvel({ x: moveVec.x, y: nextVy, z: moveVec.z }, true);

    const t = state.clock.getElapsedTime();
    if (leftLegRef.current && rightLegRef.current) {
      if (isMoving) {
        const freq = isSprinting ? 14 : 9;
        leftLegRef.current.rotation.x = Math.sin(t * freq) * 0.65;
        rightLegRef.current.rotation.x = -Math.sin(t * freq) * 0.65;
      } else {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }

    if (keys.current.attack && shootCooldown.current <= 0) {
      shootCooldown.current = 0.25;
      store.fireWeapon(
        [pos.x, pos.y + 0.6, pos.z],
        [forwardDir.x, 0, forwardDir.z],
        true
      );
    }

    let prompt: string | null = null;

    let closestVehicleId: string | null = null;
    let closestDist = 4.6;
    for (const v of store.vehicles) {
      const d = Math.hypot(v.position[0] - pos.x, v.position[2] - pos.z);
      if (d < closestDist) {
        closestDist = d;
        closestVehicleId = v.id;
      }
    }

    if (closestVehicleId) {
      prompt = 'Press [E] to Enter Vehicle';
      if (keys.current.interact && interactCooldown.current <= 0) {
        interactCooldown.current = 0.5;
        store.enterVehicle(closestVehicleId);
        return;
      }
    }

    for (const lm of CITY_DATA.landmarks) {
      const d = Math.hypot(lm.position[0] - pos.x, lm.position[2] - pos.z);
      if (d < 6) {
        if (lm.category === 'garage') {
          prompt = 'Press [E] to Open Player Garage & Upgrades';
          if (keys.current.interact && interactCooldown.current <= 0) {
            interactCooldown.current = 0.5;
            store.setActiveModal('garage');
          }
        } else if (lm.category === 'dealership') {
          prompt = 'Press [E] to Browse Vehicle Dealership';
          if (keys.current.interact && interactCooldown.current <= 0) {
            interactCooldown.current = 0.5;
            store.setActiveModal('dealership');
          }
        } else if (lm.category === 'gas' || lm.category === 'hospital') {
          prompt = 'Press [E] to Restore Health ($100)';
          if (keys.current.interact && interactCooldown.current <= 0) {
            interactCooldown.current = 0.5;
            store.repairCurrentVehicle(100);
          }
        }
      }
    }

    if (!store.activeMissionId) {
      for (const m of MISSIONS) {
        const d = Math.hypot(m.startLocation[0] - pos.x, m.startLocation[2] - pos.z);
        if (d < 5.5) {
          prompt = `Press [E] Start ${m.title} ($${m.reward.toLocaleString()})`;
          if (keys.current.interact && interactCooldown.current <= 0) {
            interactCooldown.current = 0.5;
            store.startMission(m.id);
          }
        }
      }
    }

    store.setInteractionPrompt(prompt);

    const camDist = 6.8;
    const desiredCamPos = new THREE.Vector3(
      pos.x + Math.sin(cameraYaw.current) * camDist * Math.cos(cameraPitch.current),
      pos.y + 1.4 + Math.sin(cameraPitch.current) * camDist,
      pos.z + Math.cos(cameraYaw.current) * camDist * Math.cos(cameraPitch.current)
    );
    camera.position.lerp(desiredCamPos, 0.18);
    camera.lookAt(pos.x, pos.y + 1.1, pos.z);
  });

  if (currentVehicleId || screen === 'menu') return null;

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      mass={75}
      position={[0, 2, 0]}
      enabledRotations={[false, false, false]}
      linearDamping={4}
    >
      <CapsuleCollider args={[0.55, 0.42]} position={[0, 0.95, 0]} />
      <group ref={meshGroupRef}>
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[0.62, 0.78, 0.35]} />
          <meshStandardMaterial color="#2563eb" />
        </mesh>
        <mesh position={[0, 1.78, 0]} castShadow>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
        <mesh ref={leftLegRef} position={[-0.17, 0.42, 0]} castShadow>
          <boxGeometry args={[0.24, 0.72, 0.26]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh ref={rightLegRef} position={[0.17, 0.42, 0]} castShadow>
          <boxGeometry args={[0.24, 0.72, 0.26]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    </RigidBody>
  );
};