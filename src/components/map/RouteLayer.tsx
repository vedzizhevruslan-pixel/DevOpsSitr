import { useMemo } from 'react';
import { getCompletedRoutePath } from '../../engines/routeEngine';
import { ROUTE_PATH_D } from '../../config/mapConfig';

interface RouteLayerProps {
  shipProgress: number;
}

export function RouteLayer({ shipProgress }: RouteLayerProps) {
  const completedPath = useMemo(() => getCompletedRoutePath(shipProgress), [shipProgress]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path
        d={ROUTE_PATH_D}
        fill="none"
        stroke="rgba(100,180,220,0.2)"
        strokeWidth="0.5"
        strokeDasharray="1.5 1"
        vectorEffect="non-scaling-stroke"
      />
      {completedPath && (
        <path
          d={completedPath}
          fill="none"
          stroke="url(#routeGlow)"
          strokeWidth="0.7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
