import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';
import { BLOCK_SIZE, BLOCK_STEP } from '../utils/cityGenerator';

interface PedestrianAgent {
  id: number;
  x: number;
  z: number;
  vx: number;
  vz: number;
  state: 'walk' | 'flee' | 'dead';
  respawnTimer: number;
  shirtColor: string;
}

export const PedestrianSystem: React.FC = () => {
  const refs = useRef<(THREE.Group | null)[]>([]);

  const agents = useMemo<PedestrianAgent[]>(() => {
    const colors = ['#f97316', '#ec4899', '#14b8a6', '#8b5cf6', '#eab308', '#22c55e'];
    const list: PedestrianAgent[] = [];
    for (let i = 0; i < 32; i++) {
      const bx = ((i % 5) - 2) * BLOCK_STEP;
      const bz = (Math.floor(i / 5) - 3) * BLOCK_STEP;
      const angle = (i * 1.7) % (Math.PI * 2);
      list.push({
        id: i,
        x: bx + (BLOCK_SIZE / 2 - 2) * (i % 2 === 0 ? 1 : -1),
        z: bz + ((i * 7) % 20) - 10,
        vx: Math.cos(angle) * 2.2,
        vz: Math.sin(angle) * 2.2,
        state: 'walk',
        respawnTimer: 0,
        shirtColor: colors[i % colors.length],
      });
    }
    return list;
  }, []);

  useFrame((_, dt) => {
    const store = useGameStore.getState();
    if (store.screen !== 'playing') return;

    const [px, , pz] = store.playerPos;

    agents.forEach((npc, idx) => {
      const group = refs.current[idx];
      if (!group) return;

      if (npc.state === 'dead') {
        npc.respawnTimer -= dt;
        group.rotation.x = -Math.PI / 2;
        group.position.y = 0.25;
        if (npc.respawnTimer <= 0) {
          npc.state = 'walk';
          group.rotation.x = 0;
        }
        return;
      }

      const distToPlayer = Math.hypot(npc.x - px, npc.z - pz);

      if (store.currentVehicleId && store.currentSpeed > 18 && distToPlayer < 2.4) {
        npc.state = 'dead';
        npc.respawnTimer = 14;
        store.addMoney(75);
        store.reportCrime(1);
        return;
      }

      for (const b of store.bullets) {
        if (b.fromPlayer) {
          const age = (performance.now() - b.createdAt) / 1000;
          const bx = b.origin[0] + b.direction[0] * age * 55;
          const bz = b.origin[2] + b.direction[2] * age * 55;
          if (Math.hypot(npc.x - bx, npc.z - bz) < 1.3) {
            npc.state = 'dead';
            npc.respawnTimer = 14;
            store.addMoney(50);
            store.reportCrime(1);
            return;
          }
        }
      }

      if ((store.wantedLevel > 0 || store.currentSpeed > 35) && distToPlayer < 25) {
        npc.state = 'flee';
        const dx = npc.x - px;
        const dz = npc.z - pz;
        const len = Math.hypot(dx, dz) || 1;
        npc.vx = (dx / len) * 6.2;
        npc.vz = (dz / len) * 6.2;
      } else if (npc.state === 'flee' && distToPlayer > 35) {
        npc.state = 'walk';
        npc.vx *= 0.35;
        npc.vz *= 0.35;
      }

      npc.x += npc.vx * dt;
      npc.z += npc.vz * dt;

      if (Math.abs(npc.x) > 210) npc.vx *= -1;
      if (Math.abs(npc.z) > 210) npc.vz *= -1;

      group.position.set(npc.x, 0, npc.z);
      group.rotation.y = Math.atan2(npc.vx, npc.vz);
    });
  });

  return (
    <group>
      {agents.map((a, idx) => (
        <group
          key={a.id}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          position={[a.x, 0, a.z]}
        >
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[0.5, 0.85, 0.3]} />
            <meshStandardMaterial color={a.shirtColor} />
          </mesh>
          <mesh position={[0, 1.55, 0]}>
            <boxGeometry args={[0.35, 0.35, 0.35]} />
            <meshStandardMaterial color="#fde68a" />
          </mesh>
        </group>
      ))}
    </group>
  );
};