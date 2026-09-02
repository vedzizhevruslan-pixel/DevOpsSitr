import { MAP_WAYPOINTS } from '../config/mapConfig';

export interface Point {
  x: number;
  y: number;
}

/** Sample position along the winding route (progress 0..1) */
export function getPositionOnRoute(progress: number): Point {
  const t = Math.min(1, Math.max(0, progress));
  const n = MAP_WAYPOINTS.length;
  if (n === 0) return { x: 50, y: 50 };
  if (n === 1) return { x: MAP_WAYPOINTS[0].x, y: MAP_WAYPOINTS[0].y };

  const scaled = t * (n - 1);
  const idx = Math.floor(scaled);
  const frac = scaled - idx;
  const a = MAP_WAYPOINTS[Math.min(idx, n - 1)];
  const b = MAP_WAYPOINTS[Math.min(idx + 1, n - 1)];

  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const t2 = frac;
  const x = (1 - t2) * (1 - t2) * a.x + 2 * (1 - t2) * t2 * midX + t2 * t2 * b.x;
  const y = (1 - t2) * (1 - t2) * a.y + 2 * (1 - t2) * t2 * midY + t2 * t2 * b.y;

  return { x, y };
}

export function getRouteAngle(progress: number): number {
  const delta = 0.01;
  const a = getPositionOnRoute(Math.max(0, progress - delta));
  const b = getPositionOnRoute(Math.min(1, progress + delta));
  return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
}

export function getCompletedRoutePath(progress: number): string {
  const pts: Point[] = [];
  const steps = 40;
  const end = Math.min(1, progress);
  for (let i = 0; i <= steps; i++) {
    pts.push(getPositionOnRoute((i / steps) * end));
  }
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}
