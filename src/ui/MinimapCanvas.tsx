import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { CITY_DATA, MISSIONS } from '../utils/cityGenerator';

export const MinimapCanvas: React.FC<{ fullScreen?: boolean }> = ({
  fullScreen = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerPos = useGameStore((s) => s.playerPos);
  const playerYaw = useGameStore((s) => s.playerYaw);
  const waypoint = useGameStore((s) => s.waypoint);
  const activeMissionId = useGameStore((s) => s.activeMissionId);
  const missionStage = useGameStore((s) => s.missionStage);
  const setWaypoint = useGameStore((s) => s.setWaypoint);

  const size = fullScreen ? 520 : 180;
  const scale = fullScreen ? 0.95 : 0.65;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const originX = fullScreen ? 0 : playerPos[0];
    const originZ = fullScreen ? 0 : playerPos[2];

    const toScreen = (wx: number, wz: number) => [
      cx + (wx - originX) * scale,
      cy + (wz - originZ) * scale,
    ];

    ctx.fillStyle = '#334155';
    for (const b of CITY_DATA.buildings) {
      const [sx, sz] = toScreen(b.position[0], b.position[2]);
      const sw = b.size[0] * scale;
      const sd = b.size[2] * scale;
      ctx.fillRect(sx - sw / 2, sz - sd / 2, sw, sd);
    }

    for (const lm of CITY_DATA.landmarks) {
      const [sx, sz] = toScreen(lm.position[0], lm.position[2]);
      ctx.fillStyle = lm.color;
      ctx.beginPath();
      ctx.arc(sx, sz, fullScreen ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const activeMission = MISSIONS.find((m) => m.id === activeMissionId);
    if (activeMission) {
      const pt = activeMission.checkpoints[missionStage];
      if (pt) {
        const [sx, sz] = toScreen(pt[0], pt[2]);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(sx, sz, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      for (const m of MISSIONS) {
        const [sx, sz] = toScreen(m.startLocation[0], m.startLocation[2]);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(sx - 4, sz - 4, 8, 8);
      }
    }

    if (waypoint) {
      const [px, pz] = toScreen(playerPos[0], playerPos[2]);
      const [wx, wz] = toScreen(waypoint[0], waypoint[1]);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px, pz);
      ctx.lineTo(wx, wz);
      ctx.stroke();
    }

    const [px, pz] = toScreen(playerPos[0], playerPos[2]);
    ctx.save();
    ctx.translate(px, pz);
    ctx.rotate(-playerYaw);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 6);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [playerPos, playerYaw, waypoint, activeMissionId, missionStage, fullScreen, size, scale]);

  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!fullScreen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - size / 2;
    const clickY = e.clientY - rect.top - size / 2;
    setWaypoint([clickX / scale, clickY / scale]);
  };

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onClick={handleMapClick}
      className={`${
        fullScreen ? 'rounded-xl cursor-crosshair' : 'rounded-full'
      } border-2 border-slate-600 shadow-2xl`}
    />
  );
};