import React, { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';
import { CityWorld } from '../world/CityWorld';
import { PlayerController } from '../player/PlayerController';
import { VehicleManager } from '../vehicles/VehicleManager';
import { TrafficSystem } from '../traffic/TrafficSystem';
import { PedestrianSystem } from '../npc/PedestrianSystem';
import { PoliceSystem } from '../police/PoliceSystem';
import { MissionWorldMarkers } from '../missions/MissionWorldMarkers';
import { BulletRenderer } from '../combat/BulletRenderer';

const WorldClockTicker: React.FC = () => {
  const tickWorld = useGameStore((s) => s.tickWorld);
  useFrame((_, dt) => {
    tickWorld(Math.min(dt, 0.1));
  });
  return null;
};

export const GameScene: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const weather = useGameStore((s) => s.settings.weather);
  const quality = useGameStore((s) => s.settings.graphicsQuality);

  const sunAngle = ((timeOfDay - 6) / 24) * Math.PI * 2;
  const sunPosition: [number, number, number] = [
    Math.cos(sunAngle) * 140,
    Math.sin(sunAngle) * 140,
    60,
  ];
  const isNight = timeOfDay < 6 || timeOfDay > 19.5;

  const rainDrops = useMemo(() => {
    return Array.from({ length: 180 }, (_, i) => [
      ((i * 19) % 80) - 40,
      (i % 25) + 2,
      ((i * 31) % 80) - 40,
    ]);
  }, []);

  return (
    <Canvas
      shadows={quality !== 'low'}
      camera={{ fov: 62, near: 0.2, far: 450 }}
      onPointerDown={(e) => {
        if (
          useGameStore.getState().screen === 'playing' &&
          useGameStore.getState().activeModal === 'none'
        ) {
          (e.target as HTMLElement).requestPointerLock?.();
        }
      }}
    >
      <WorldClockTicker />

      <color attach="background" args={[isNight ? '#070b14' : '#7dd3fc']} />
      <fog attach="fog" args={[isNight ? '#070b14' : '#bae6fd', 90, 290]} />

      <ambientLight intensity={isNight ? 0.32 : 0.75} />
      <directionalLight
        castShadow={quality !== 'low'}
        position={sunPosition}
        intensity={isNight ? 0.2 : 1.35}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
      />

      {!isNight ? (
        <Sky sunPosition={sunPosition} turbidity={6} rayleigh={1.2} />
      ) : (
        <Stars radius={160} depth={50} count={2500} factor={4} fade />
      )}

      {weather === 'rain' && (
        <group>
          {rainDrops.map(([rx, ry, rz], idx) => (
            <mesh key={idx} position={[rx, ry, rz]}>
              <cylinderGeometry args={[0.02, 0.02, 1.2]} />
              <meshBasicMaterial color="#93c5fd" transparent opacity={0.5} />
            </mesh>
          ))}
        </group>
      )}

      <Physics gravity={[0, -20, 0]}>
        <CityWorld />
        <PlayerController />
        <VehicleManager />
      </Physics>

      <TrafficSystem />
      <PedestrianSystem />
      <PoliceSystem />
      <MissionWorldMarkers />
      <BulletRenderer />
    </Canvas>
  );
};