import React from 'react';
import { Player as PlayerType } from '../types';
import Player from './Player';

interface CourtProps {
  players: PlayerType[];
  onPlayerMove: (id: string, x: number, y: number) => void;
  selectedId?: string | null;
  onSelectPlayer?: (id: string) => void;
  onCanvasClick?: (x: number, y: number) => void;
  onDeleteAnchor?: (playerId: string, anchorIdx: number) => void;
  playing?: boolean;
}

// Simple SVG court representation
const Court: React.FC<CourtProps> = ({
  players,
  onPlayerMove,
  selectedId,
  onSelectPlayer,
  onCanvasClick,
  onDeleteAnchor,
  playing
}) => {
  const width = 400;
  const height = 300;
  const netY = 50;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onCanvasClick) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const inv = svg.getScreenCTM()?.inverse();
    if (!inv) return;
    const cursorpt = pt.matrixTransform(inv);
    onCanvasClick(cursorpt.x, cursorpt.y);
  };

  return (
    <svg
      width="100%"
      height="auto"
      viewBox={`0 0 ${width} ${height}`}
      style={{ maxWidth: '600px', background: '#228B22', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
      onClick={handleSvgClick}
    >
      {/* court boundaries */}
      <rect x={0} y={0} width={width} height={height} fill="#F4A460" stroke="#000" strokeWidth={3} />
      {/* net line */}
      <line x1={0} y1={netY} x2={width} y2={netY} stroke="#000" strokeWidth={5} />
      {/* attack lines: 3m from net on each side */}
      <line x1={0} y1={netY - 100} x2={width} y2={netY - 100} stroke="#8B4513" strokeWidth={2} strokeDasharray="5,5" />
      <line x1={0} y1={netY + 100} x2={width} y2={netY + 100} stroke="#8B4513" strokeWidth={2} strokeDasharray="5,5" />
      {/* horizontal line 40% from net to back */}
      <line x1={0} y1={netY + 0.4 * (height - netY)} x2={width} y2={netY + 0.4 * (height - netY)} stroke="#8B4513" strokeWidth={2} strokeDasharray="5,5" />

      {/* computed path curve (smooth) */}
      {!playing && players.map(p => {
        if (p.computedPath && p.computedPath.length > 0) {
          const pathData = p.computedPath
            .map(pnt => `${pnt.x},${pnt.y}`)
            .join(' ');
          return (
            <polyline
              key={`${p.id}-curve`}
              points={pathData}
              fill="none"
              stroke="#f00"
              strokeWidth={1}
            />
          );
        }
        return null;
      })}
      {/* anchor points */}
      {!playing && players.map(p => {
        if (p.anchorPoints.length > 0) {
          const pathData = p.anchorPoints
            .map(pnt => `${pnt.x},${pnt.y}`)
            .join(' ');
          return (
            <g key={`${p.id}-anchors`}>
              <polyline
                points={pathData}
                fill="none"
                stroke="#888"
                strokeWidth={1}
              />
              {p.anchorPoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={4}
                  fill="#000"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAnchor && onDeleteAnchor(p.id, idx);
                  }}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </g>
          );
        }
        return null;
      })}

      {/* players */}
      {players.map(p => (
        <g
          key={p.id + '-wrapper'}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPlayer && onSelectPlayer(p.id);
          }}
        >
          <Player player={p} onMove={onPlayerMove} />
          {selectedId === p.id && (
            <circle
              cx={p.currentPosition.x}
              cy={p.currentPosition.y}
              r={25}
              fill="none"
              stroke="#00f"
              strokeWidth={3}
            />
          )}
        </g>
      ))}
    </svg>
  );
};

export default Court;
