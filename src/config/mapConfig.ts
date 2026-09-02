import type { TopicId } from '../types';
import { pirateAssets } from './assetManifest';

export interface MapWaypoint {
  id: string;
  topicId?: TopicId;
  label: string;
  labelRu: string;
  x: number;
  y: number;
  scale: number;
  assetKey: keyof typeof pirateAssets.islands;
}

/** Winding sea route — coordinates in % of map viewport */
export const MAP_WAYPOINTS: MapWaypoint[] = [
  { id: 'linux', topicId: 'linux', label: 'Linux', labelRu: 'Linux', x: 10, y: 68, scale: 1.05, assetKey: 'linux' },
  { id: 'networks', topicId: 'networks', label: 'Networks', labelRu: 'Сети', x: 22, y: 42, scale: 1.0, assetKey: 'networks' },
  { id: 'ansible', topicId: 'ansible', label: 'Ansible', labelRu: 'Ansible', x: 36, y: 62, scale: 1.0, assetKey: 'ansible' },
  { id: 'terraform', topicId: 'terraform', label: 'Terraform', labelRu: 'Terraform', x: 46, y: 34, scale: 1.0, assetKey: 'terraform' },
  { id: 'docker', topicId: 'docker', label: 'Docker', labelRu: 'Docker', x: 56, y: 54, scale: 1.2, assetKey: 'docker' },
  { id: 'kubernetes', topicId: 'kubernetes', label: 'Kubernetes', labelRu: 'Kubernetes', x: 68, y: 38, scale: 1.2, assetKey: 'kubernetes' },
  { id: 'gitlab-cicd', topicId: 'gitlab-cicd', label: 'GitLab CI/CD', labelRu: 'GitLab CI/CD', x: 78, y: 56, scale: 1.15, assetKey: 'gitlab' },
  { id: 'error-bay', label: 'Error Bay', labelRu: 'Бухта ошибок', x: 86, y: 44, scale: 1.25, assetKey: 'errorBay' },
  { id: 'treasure', label: 'Offer Island', labelRu: 'Остров оффера', x: 92, y: 26, scale: 1.4, assetKey: 'treasure' },
];

export const TOPIC_WAYPOINT_COUNT = 7;

export function getWaypointIndex(topicId: TopicId): number {
  return MAP_WAYPOINTS.findIndex((w) => w.topicId === topicId);
}

export function progressToWaypoint(progress: number): number {
  const max = MAP_WAYPOINTS.length - 1;
  return Math.min(max, Math.max(0, progress * max));
}

export function waypointToProgress(index: number): number {
  const max = MAP_WAYPOINTS.length - 1;
  if (max <= 0) return 0;
  return index / max;
}

export function buildRoutePath(waypoints: MapWaypoint[]): string {
  if (waypoints.length < 2) return '';
  const pts = waypoints.map((w) => ({ x: w.x, y: w.y }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` Q ${cpx} ${prev.y} ${(prev.x + curr.x) / 2} ${(prev.y + curr.y) / 2}`;
    d += ` Q ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
  }
  return d;
}

export const ROUTE_PATH_D = buildRoutePath(MAP_WAYPOINTS);
