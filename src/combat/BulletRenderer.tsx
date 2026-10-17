import React from 'react';
import { useGameStore } from '../stores/useGameStore';

export const BulletRenderer: React.FC = () => {
  const bullets = useGameStore((s) => s.bullets);
  const now = performance.now();

  return (
    <group>
      {bullets.map((b) => {
        const elapsed = (now - b.createdAt) / 1000;
        const speed = 55;
        const x = b.origin[0] + b.direction[0] * elapsed * speed;
        const y = b.origin[1] + b.direction[1] * elapsed * speed;
        const z = b.origin[2] + b.direction[2] * elapsed * speed;
        return (
          <mesh key={b.id} position={[x, y, z]}>
            <sphereGeometry args={[0.16, 6, 6]} />
            <meshBasicMaterial color="#fde047" />
          </mesh>
        );
      })}
    </group>
  );
};