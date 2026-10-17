import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

interface PoliceUnit {
  id: number;
  x: number;
  z: number;
  yaw: number;
  shootTimer: number;
}

export const PoliceSystem: React.FC = () => {
  const unitRefs = useRef<(THREE.Group | null)[]>([]);
  const wantedLevel = useGameStore((s) => s.wantedLevel);

  const units = useMemo<PoliceUnit[]>(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 80 + i * 25,
      z: 80 - i * 25,
      yaw: 0,
      shootTimer: 1.5,
    }));
  }, []);

  useFrame((_, dt) => {
    const store = useGameStore.getState();
    if (store.screen !== 'playing' || store.wantedLevel === 0) return;

    const [px, , pz] = store.playerPos;

    units.forEach((u, idx) => {
      const group = unitRefs.current[idx];
      if (!group) return;

      if (idx >= store.wantedLevel) {
        group.visible = false;
        return;
      }
      group.visible = true;

      const dx = px - u.x;
      const dz = pz - u.z;
      const dist = Math.hypot(dx, dz) || 1;

      if (dist > 140) {
        const angle = Math.random() * Math.PI * 2;
        u.x = px + Math.cos(angle) * 65;
        u.z = pz + Math.sin(angle) * 65;
        return;
      }

      const speed = 16 + store.wantedLevel * 2.8;
      if (dist > 6.5) {
        u.x += (dx / dist) * speed * dt;
        u.z += (dz / dist) * speed * dt;
      } else {
        if (store.currentVehicleId) {
          store.damageVehicle(store.currentVehicleId, 8 * dt);
        } else {
          store.damagePlayer(12 * dt);
        }
      }

      if (dist < 38) {
        u.shootTimer -= dt;
        if (u.shootTimer <= 0 && store.wantedLevel >= 2) {
          u.shootTimer = 1.6;
          store.damagePlayer(4);
        }
      }

      u.yaw = Math.atan2(dx, dz);
      group.position.set(u.x, 0.7, u.z);
      group.rotation.y = u.yaw;
    });
  });

  if (wantedLevel === 0) return null;

  return (
    <group>
      {units.map((u, idx) => (
        <group
          key={u.id}
          ref={(el) => {
            unitRefs.current[idx] = el;
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[2.2, 1.2, 4.6]} />
            <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[1.8, 0.55, 2.2]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-0.45, 1.15, 0]}>
            <boxGeometry args={[0.45, 0.2, 0.3]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.45, 1.15, 0]}>
            <boxGeometry args={[0.45, 0.2, 0.3]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        </group>
      ))}
    </group>
  );
};