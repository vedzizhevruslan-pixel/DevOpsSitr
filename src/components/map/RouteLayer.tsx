import { useMemo } from 'react';
import { getCompletedRoutePath } from '../../engines/routeEngine';
import { MAP_WAYPOINTS, MAP_Z, ROUTE_PATH_D } from '../../config/mapConfig';

interface RouteLayerProps {
  shipProgress: number;
}

export function RouteLayer({ shipProgress }: RouteLayerProps) {
  const completedPath = useMemo(() => getCompletedRoutePath(shipProgress), [shipProgress]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: MAP_Z.route }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="1" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
        </linearGradient>
        <filter id="routeSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.35" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Future path underlay for contrast */}
      <path
        d={ROUTE_PATH_D}
        fill="none"
        stroke="rgba(8, 28, 48, 0.55)"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d={ROUTE_PATH_D}
        fill="none"
        stroke="rgba(186, 230, 253, 0.75)"
        strokeWidth="0.95"
        strokeDasharray="2 1.3"
        strokeLinecap="round"
      />

      {/* Completed path — turquoise/gold glow */}
      {completedPath && (
        <path
          d={completedPath}
          fill="none"
          stroke="url(#routeGlow)"
          strokeWidth="1.35"
          strokeLinecap="round"
          filter="url(#routeSoftGlow)"
        />
      )}

      {/* Waypoint dots for readable flow */}
      {MAP_WAYPOINTS.map((w, i) => (
        <circle
          key={w.id}
          cx={w.x}
          cy={w.y}
          r={i === 0 ? 0.9 : 0.7}
          fill={i / (MAP_WAYPOINTS.length - 1) <= shipProgress ? '#fbbf24' : 'rgba(180,220,240,0.55)'}
          stroke="rgba(10,22,40,0.5)"
          strokeWidth="0.25"
        />
      ))}
    </svg>
  );
}
