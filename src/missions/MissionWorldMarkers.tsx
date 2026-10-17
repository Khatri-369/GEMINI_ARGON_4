import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';
import { MISSIONS } from '../utils/cityGenerator';

export const MissionWorldMarkers: React.FC = () => {
  const ringRef = useRef<THREE.Mesh>(null);
  const activeMissionId = useGameStore((s) => s.activeMissionId);
  const missionStage = useGameStore((s) => s.missionStage);
  const completedMissions = useGameStore((s) => s.completedMissions);

  const activeMission = MISSIONS.find((m) => m.id === activeMissionId);

  useFrame((state) => {
    const store = useGameStore.getState();
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.getElapsedTime() * 2;
    }

    if (activeMission) {
      const target = activeMission.checkpoints[missionStage];
      if (target) {
        const d = Math.hypot(
          store.playerPos[0] - target[0],
          store.playerPos[2] - target[2]
        );
        if (d < 8.5) {
          store.advanceMissionCheckpoint();
        }
      }
    }
  });

  return (
    <group>
      {!activeMission &&
        MISSIONS.map((m) => {
          const isDone = completedMissions.includes(m.id);
          return (
            <group key={m.id} position={m.startLocation}>
              <mesh position={[0, 3, 0]}>
                <cylinderGeometry args={[2.2, 2.2, 6, 20, 1, true]} />
                <meshBasicMaterial
                  color={isDone ? '#22c55e' : '#facc15'}
                  transparent
                  opacity={0.35}
                  side={2}
                />
              </mesh>
              <Text
                position={[0, 6.8, 0]}
                fontSize={1.25}
                color={isDone ? '#4ade80' : '#fde047'}
                anchorX="center"
                anchorY="middle"
              >
                {m.title}
              </Text>
            </group>
          );
        })}

      {activeMission && activeMission.checkpoints[missionStage] && (
        <group position={activeMission.checkpoints[missionStage]}>
          <mesh ref={ringRef} position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3.5, 4.8, 28]} />
            <meshBasicMaterial color="#fbbf24" side={2} />
          </mesh>
          <mesh position={[0, 12, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 24, 16, 1, true]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.32} side={2} />
          </mesh>
          <Text
            position={[0, 7.5, 0]}
            fontSize={1.6}
            color="#fef08a"
            anchorX="center"
            anchorY="middle"
          >
            {`CHECKPOINT ${missionStage + 1}/${activeMission.checkpoints.length}`}
          </Text>
        </group>
      )}
    </group>
  );
};