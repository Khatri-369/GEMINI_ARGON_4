import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';
import { BLOCK_STEP } from '../utils/cityGenerator';

interface TrafficCar {
  id: number;
  axis: 'x' | 'z';
  laneCoord: number;
  pos: number;
  dir: 1 | -1;
  speed: number;
  color: string;
}

export const TrafficSystem: React.FC = () => {
  const groupRefs = useRef<(THREE.Group | null)[]>([]);

  const cars = useMemo<TrafficCar[]>(() => {
    const palette = ['#e2e8f0', '#38bdf8', '#f43f5e', '#10b981', '#eab308', '#a855f7'];
    const list: TrafficCar[] = [];
    for (let i = 0; i < 16; i++) {
      const axis = i % 2 === 0 ? 'x' : 'z';
      const gridIndex = (i % 5) - 2;
      const dir: 1 | -1 = i % 4 < 2 ? 1 : -1;
      const laneOffset = dir === 1 ? 3.2 : -3.2;
      list.push({
        id: i,
        axis,
        laneCoord: gridIndex * BLOCK_STEP + BLOCK_STEP / 2 + laneOffset,
        pos: ((i * 37) % 320) - 160,
        dir,
        speed: 14 + (i % 4) * 3,
        color: palette[i % palette.length],
      });
    }
    return list;
  }, []);

  useFrame((_, dt) => {
    const state = useGameStore.getState();
    if (state.screen !== 'playing') return;

    cars.forEach((car, idx) => {
      const mesh = groupRefs.current[idx];
      if (!mesh) return;

      const x = car.axis === 'x' ? car.pos : car.laneCoord;
      const z = car.axis === 'z' ? car.pos : car.laneCoord;

      const distToPlayer = Math.hypot(x - state.playerPos[0], z - state.playerPos[2]);
      const nearIntersection = Math.abs((car.pos + 30) % BLOCK_STEP) < 6;
      const redLight =
        (car.axis === 'x' && state.trafficLightPhase === 'NS_GREEN') ||
        (car.axis === 'z' && state.trafficLightPhase === 'EW_GREEN');

      if (distToPlayer > 7 && !(nearIntersection && redLight)) {
        car.pos += car.dir * car.speed * dt;
        if (car.pos > 220) car.pos = -220;
        if (car.pos < -220) car.pos = 220;
      }

      const nextX = car.axis === 'x' ? car.pos : car.laneCoord;
      const nextZ = car.axis === 'z' ? car.pos : car.laneCoord;
      mesh.position.set(nextX, 0.65, nextZ);
      mesh.rotation.y =
        car.axis === 'z'
          ? car.dir === 1
            ? 0
            : Math.PI
          : car.dir === 1
          ? Math.PI / 2
          : -Math.PI / 2;
    });
  });

  return (
    <group>
      {cars.map((c, idx) => (
        <group
          key={c.id}
          ref={(el) => {
            groupRefs.current[idx] = el;
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[2.0, 1.1, 4.2]} />
            <meshStandardMaterial color={c.color} roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.72, -0.2]}>
            <boxGeometry args={[1.7, 0.6, 2.1]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ))}
    </group>
  );
};