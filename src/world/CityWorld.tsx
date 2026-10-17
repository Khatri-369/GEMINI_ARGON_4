import React, { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import { useGameStore } from '../stores/useGameStore';
import { BLOCK_SIZE, BLOCK_STEP, CITY_DATA, GRID_RADIUS } from '../utils/cityGenerator';

export const CityWorld: React.FC = () => {
  const playerPos = useGameStore((s) => s.playerPos);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const drawDistance = useGameStore((s) => s.settings.drawDistance);
  const isNight = timeOfDay < 6 || timeOfDay > 19.5;

  const visibleBuildings = useMemo(() => {
    return CITY_DATA.buildings.filter((b) => {
      const dx = b.position[0] - playerPos[0];
      const dz = b.position[2] - playerPos[2];
      return dx * dx + dz * dz <= drawDistance * drawDistance;
    });
  }, [
    Math.round(playerPos[0] / 30),
    Math.round(playerPos[2] / 30),
    drawDistance,
  ]);

  const blocks = useMemo(() => {
    const arr: { gx: number; gz: number; cx: number; cz: number }[] = [];
    for (let gx = -GRID_RADIUS; gx <= GRID_RADIUS; gx++) {
      for (let gz = -GRID_RADIUS; gz <= GRID_RADIUS; gz++) {
        arr.push({ gx, gz, cx: gx * BLOCK_STEP, cz: gz * BLOCK_STEP });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      <RigidBody type="fixed" friction={1.1}>
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[680, 1, 680]} />
          <meshStandardMaterial color="#1f2937" roughness={0.9} />
        </mesh>
      </RigidBody>

      <mesh position={[350, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[260, 680]} />
        <meshStandardMaterial
          color={isNight ? '#0c4a6e' : '#0284c7'}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {blocks.map(({ gx, gz, cx, cz }) => {
        const isBeach = gx === 4;
        const isPark = (gx === -1 && gz === -1) || (gx === 1 && gz === 1);
        return (
          <group key={`block_${gx}_${gz}`} position={[cx, 0.08, cz]}>
            <mesh receiveShadow>
              <boxGeometry args={[BLOCK_SIZE, 0.16, BLOCK_SIZE]} />
              <meshStandardMaterial
                color={isBeach ? '#fde68a' : isPark ? '#15803d' : '#64748b'}
                roughness={0.85}
              />
            </mesh>
            <mesh position={[0, -0.06, BLOCK_STEP / 2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[18, 0.35]} />
              <meshBasicMaterial color="#facc15" />
            </mesh>
            <mesh position={[BLOCK_STEP / 2, -0.06, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[18, 0.35]} />
              <meshBasicMaterial color="#facc15" />
            </mesh>
          </group>
        );
      })}

      {visibleBuildings.map((b) => (
        <RigidBody key={b.id} type="fixed" position={b.position}>
          <CuboidCollider args={[b.size[0] / 2, b.size[1] / 2, b.size[2] / 2]} />
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.6}
              metalness={0.2}
              emissive={isNight ? '#fef08a' : '#000000'}
              emissiveIntensity={isNight ? 0.12 : 0}
            />
          </mesh>
          {b.label && (
            <Text
              position={[0, b.size[1] / 2 + 2.2, b.size[2] / 2 + 0.5]}
              fontSize={1.7}
              color="#38bdf8"
              anchorX="center"
              anchorY="middle"
            >
              {b.label}
            </Text>
          )}
        </RigidBody>
      ))}

      {CITY_DATA.landmarks.map((lm) => (
        <group key={lm.id} position={lm.position}>
          <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 3.4, 28]} />
            <meshBasicMaterial color={lm.color} side={2} />
          </mesh>
          <Text
            position={[0, 3.2, 0]}
            fontSize={1.1}
            color={lm.color}
            anchorX="center"
            anchorY="middle"
          >
            {lm.name}
          </Text>
        </group>
      ))}

      {CITY_DATA.trees.map((pos, idx) => (
        <group key={`tree_${idx}`} position={pos}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.45, 3, 6]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 4.2, 0]} castShadow>
            <coneGeometry args={[2.2, 4.5, 7]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
        </group>
      ))}

      {CITY_DATA.streetlights.map((pos, idx) => (
        <group key={`lamp_${idx}`} position={pos}>
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 7, 6]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 7.1, 0]}>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshBasicMaterial color={isNight ? '#fef08a' : '#94a3b8'} />
          </mesh>
        </group>
      ))}
    </group>
  );
};