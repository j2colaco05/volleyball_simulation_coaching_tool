import React, { useState, useRef, useEffect } from 'react';
import { Player as PlayerType } from '../types';

interface PlayerProps {
  player: PlayerType;
  onMove?: (id: string, x: number, y: number) => void;
}

const Player: React.FC<PlayerProps> = ({ player, onMove }) => {
  const [position, setPosition] = useState(player.currentPosition);
  const circleRef = useRef<SVGCircleElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPosition(player.currentPosition);
  }, [player.currentPosition]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    const svg = circleRef.current?.ownerSVGElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorpt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    dragStart.current = { x: cursorpt.x, y: cursorpt.y };
    circleRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const svg = circleRef.current?.ownerSVGElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorpt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const dx = cursorpt.x - dragStart.current.x;
    const dy = cursorpt.y - dragStart.current.y;
    if (Math.abs(dx) + Math.abs(dy) < 5) return; // threshold
    const newPos = { x: cursorpt.x, y: cursorpt.y };
    setPosition(newPos);
    onMove && onMove(player.id, newPos.x, newPos.y);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    circleRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <g>
      <circle
        ref={circleRef}
        cx={position.x}
        cy={position.y}
        r={20}
        fill={player.color}
        stroke="#000"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ cursor: 'grab' }}
      />
      <text x={position.x} y={position.y - 25} textAnchor="middle" fontSize="14" fill="#000">
        {player.name}
      </text>
    </g>
  );
};

export default Player;
