import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CuboidCollider, RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { CITY_DATA, MISSIONS, VEHICLE_SPECS } from '../utils/cityGenerator';
import { VehicleInstanceData } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

const SingleVehicle: React.FC<{ data: VehicleInstanceData }> = ({ data }) => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const headingRef = useRef(data.rotation);
  const interactCooldown = useRef(0);

  const keys = useKeyboard();
  const { camera } = useThree();

  const currentVehicleId = useGameStore((s) => s.currentVehicleId);
  const upgradeLevel = useGameStore((s) => s.upgradeLevel);
  const cameraMode = useGameStore((s) => s.cameraMode);
  const timeOfDay = useGameStore((s) => s.timeOfDay);

  const isPlayerDriving = currentVehicleId === data.id;
  const spec = VEHICLE_SPECS[data.type];
  const isNight = timeOfDay < 6 || timeOfDay > 19.5;

  useFrame((_, dt) => {
    const store = useGameStore.getState();
    if (store.screen !== 'playing' || store.activeModal !== 'none') return;

    interactCooldown.current = Math.max(0, interactCooldown.current - dt);

    const rb = bodyRef.current;
    if (!rb) return;

    const pos = rb.translation();
    const vel = rb.linvel();

    if (!isPlayerDriving) {
      return;
    }

    if (keys.current.interact && interactCooldown.current <= 0) {
      interactCooldown.current = 0.5;
      store.exitVehicle([pos.x - 2.6, 1.2, pos.z]);
      return;
    }

    const forward = new THREE.Vector3(
      Math.sin(headingRef.current),
      0,
      Math.cos(headingRef.current)
    );
    const right = new THREE.Vector3(
      Math.cos(headingRef.current),
      0,
      -Math.sin(headingRef.current)
    );

    const currentVelVec = new THREE.Vector3(vel.x, 0, vel.z);
    let forwardSpeed = currentVelVec.dot(forward);
    let lateralSpeed = currentVelVec.dot(right);

    const upgradeMultiplier = 1 + (upgradeLevel - 1) * 0.08;
    const maxSpd = spec.maxSpeed * upgradeMultiplier;
    const accel = spec.acceleration * upgradeMultiplier;

    const throttle = (keys.current.forward ? 1 : 0) - (keys.current.backward ? 1 : 0);
    const steerInput = (keys.current.left ? 1 : 0) - (keys.current.right ? 1 : 0);
    const isNitro = keys.current.sprint && spec.hasNitro;

    if (throttle > 0) {
      forwardSpeed += accel * (isNitro ? 1.45 : 1) * dt;
    } else if (throttle < 0) {
      if (forwardSpeed > 1) {
        forwardSpeed -= accel * 1.9 * dt;
      } else {
        forwardSpeed -= accel * 0.75 * dt;
      }
    } else {
      forwardSpeed *= 0.985;
    }

    if (keys.current.handbrake) {
      forwardSpeed *= 0.93;
    }

    forwardSpeed = Math.max(-maxSpd * 0.4, Math.min(maxSpd * (isNitro ? 1.25 : 1), forwardSpeed));

    const gripFactor = keys.current.handbrake ? 0.92 : 0.74;
    lateralSpeed *= gripFactor;

    if (Math.abs(forwardSpeed) > 0.6) {
      const dirSign = forwardSpeed >= 0 ? 1 : -1;
      headingRef.current +=
        steerInput * spec.handling * dirSign * dt * Math.min(1, Math.abs(forwardSpeed) / 7);
    }

    const finalVel = new THREE.Vector3()
      .addScaledVector(forward, forwardSpeed)
      .addScaledVector(right, lateralSpeed);

    rb.setLinvel({ x: finalVel.x, y: vel.y, z: finalVel.z }, true);

    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      headingRef.current
    );
    rb.setRotation(q, true);

    soundEngine.updateEngineSound(forwardSpeed, true, isNitro);
    store.updateVehicleTransform(
      data.id,
      [pos.x, pos.y, pos.z],
      headingRef.current,
      Math.abs(forwardSpeed) * 2.4
    );

    let prompt: string | null = null;
    for (const lm of CITY_DATA.landmarks) {
      const d = Math.hypot(lm.position[0] - pos.x, lm.position[2] - pos.z);
      if (d < 7) {
        if (lm.category === 'garage' || lm.category === 'gas') {
          prompt = 'Press [F] Quick Repair Vehicle ($150)';
          if (keys.current.attack && interactCooldown.current <= 0) {
            interactCooldown.current = 0.5;
            store.repairCurrentVehicle(150);
          }
        } else if (lm.category === 'dealership') {
          prompt = 'Press [F] Open Vehicle Dealership';
          if (keys.current.attack && interactCooldown.current <= 0) {
            interactCooldown.current = 0.5;
            store.setActiveModal('dealership');
          }
        }
      }
    }

    if (!store.activeMissionId) {
      for (const m of MISSIONS) {
        const d = Math.hypot(m.startLocation[0] - pos.x, m.startLocation[2] - pos.z);
        if (d < 6.5) {
          prompt = `Press [F] Start ${m.title}`;
          if (keys.current.attack && interactCooldown.current <= 0) {
            interactCooldown.current = 0.5;
            store.startMission(m.id);
          }
        }
      }
    }
    store.setInteractionPrompt(prompt);

    const dist = cameraMode === 'hood' ? -0.8 : cameraMode === 'close' ? 6.5 : 9.5;
    const height = cameraMode === 'hood' ? 1.7 : cameraMode === 'close' ? 2.8 : 4.1;

    const camTarget = new THREE.Vector3(
      pos.x - Math.sin(headingRef.current) * dist,
      pos.y + height,
      pos.z - Math.cos(headingRef.current) * dist
    );

    camera.position.lerp(camTarget, 0.16);
    camera.lookAt(
      pos.x + Math.sin(headingRef.current) * 6,
      pos.y + 1.0,
      pos.z + Math.cos(headingRef.current) * 6
    );
  });

  const [w, h, l] = spec.dimensions;

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      position={data.position}
      mass={spec.mass}
      enabledRotations={[false, true, false]}
      linearDamping={0.5}
    >
      <CuboidCollider args={[w / 2, h / 2, l / 2]} position={[0, h / 2, 0]} />
      <group>
        <mesh position={[0, h * 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h * 0.55, l]} />
          <meshStandardMaterial color={data.color} metalness={0.55} roughness={0.3} />
        </mesh>

        <mesh position={[0, h * 0.85, -l * 0.06]} castShadow>
          <boxGeometry args={[w * 0.84, h * 0.45, l * 0.52]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>

        {data.type === 'police' && (
          <group position={[0, h + 0.18, -0.2]}>
            <mesh position={[-0.4, 0, 0]}>
              <boxGeometry args={[0.45, 0.16, 0.25]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.4, 0, 0]}>
              <boxGeometry args={[0.45, 0.16, 0.25]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
          </group>
        )}

        <mesh position={[-w * 0.35, h * 0.45, l / 2 + 0.02]}>
          <boxGeometry args={[0.3, 0.18, 0.05]} />
          <meshBasicMaterial color={isNight ? '#fef08a' : '#e2e8f0'} />
        </mesh>
        <mesh position={[w * 0.35, h * 0.45, l / 2 + 0.02]}>
          <boxGeometry args={[0.3, 0.18, 0.05]} />
          <meshBasicMaterial color={isNight ? '#fef08a' : '#e2e8f0'} />
        </mesh>

        <mesh position={[-w * 0.35, h * 0.45, -l / 2 - 0.02]}>
          <boxGeometry args={[0.32, 0.18, 0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[w * 0.35, h * 0.45, -l / 2 - 0.02]}>
          <boxGeometry args={[0.32, 0.18, 0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
    </RigidBody>
  );
};

export const VehicleManager: React.FC = () => {
  const vehicles = useGameStore((s) => s.vehicles);
  return (
    <group>
      {vehicles.map((v) => (
        <SingleVehicle key={v.id} data={v} />
      ))}
    </group>
  );
};