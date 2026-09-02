import type { TopicId } from '../types';
import { pirateAssets } from './assetManifest';

/**
 * Map layout constants (percent of the PLAYFIELD, not full viewport).
 * Playfield excludes right mission panel and edge margins.
 */
export const MAP_LAYOUT = {
  /** Right mission panel reserved width in rem (~w-64 + gaps) */
  missionPanelRem: 17,
  /** Playfield insets as % of full map container */
  inset: {
    top: 8,
    left: 4,
    right: 28,
    bottom: 9,
  },
} as const;

export interface MapWaypoint {
  id: string;
  topicId?: TopicId;
  label: string;
  labelRu: string;
  /** Center X within playfield 0–100 */
  x: number;
  /** Center Y within playfield 0–100 */
  y: number;
  /** Relative visual scale */
  scale: number;
  /** Base pixel width before scale (approx) */
  baseSize: number;
  labelOffsetX: number;
  labelOffsetY: number;
  assetKey: keyof typeof pirateAssets.islands;
}

/**
 * Winding maritime route through safe playfield.
 * Treasure largest → K8s/Docker large → mid islands medium.
 */
export const MAP_WAYPOINTS: MapWaypoint[] = [
  {
    id: 'linux',
    topicId: 'linux',
    label: 'Linux',
    labelRu: 'Linux',
    x: 14,
    y: 70,
    scale: 1.08,
    baseSize: 132,
    labelOffsetX: 0,
    labelOffsetY: 78,
    assetKey: 'linux',
  },
  {
    id: 'networks',
    topicId: 'networks',
    label: 'Networks',
    labelRu: 'Сети',
    x: 26,
    y: 38,
    scale: 1.05,
    baseSize: 128,
    labelOffsetX: 0,
    labelOffsetY: 76,
    assetKey: 'networks',
  },
  {
    id: 'ansible',
    topicId: 'ansible',
    label: 'Ansible',
    labelRu: 'Ansible',
    x: 40,
    y: 70,
    scale: 1.05,
    baseSize: 128,
    labelOffsetX: 0,
    labelOffsetY: 76,
    assetKey: 'ansible',
  },
  {
    id: 'terraform',
    topicId: 'terraform',
    label: 'Terraform',
    labelRu: 'Terraform',
    x: 48,
    y: 32,
    scale: 1.05,
    baseSize: 128,
    labelOffsetX: 0,
    labelOffsetY: 76,
    assetKey: 'terraform',
  },
  {
    id: 'docker',
    topicId: 'docker',
    label: 'Docker',
    labelRu: 'Docker',
    x: 58,
    y: 58,
    scale: 1.22,
    baseSize: 148,
    labelOffsetX: 0,
    labelOffsetY: 86,
    assetKey: 'docker',
  },
  {
    id: 'kubernetes',
    topicId: 'kubernetes',
    label: 'Kubernetes',
    labelRu: 'Kubernetes',
    x: 70,
    y: 36,
    scale: 1.22,
    baseSize: 148,
    labelOffsetX: 0,
    labelOffsetY: 86,
    assetKey: 'kubernetes',
  },
  {
    id: 'gitlab-cicd',
    topicId: 'gitlab-cicd',
    label: 'GitLab CI/CD',
    labelRu: 'GitLab CI/CD',
    x: 78,
    y: 68,
    scale: 1.12,
    baseSize: 136,
    labelOffsetX: 0,
    labelOffsetY: 80,
    assetKey: 'gitlab',
  },
  {
    id: 'error-bay',
    label: 'Error Bay',
    labelRu: 'Бухта ошибок',
    x: 84,
    y: 52,
    scale: 1.18,
    baseSize: 140,
    labelOffsetX: 0,
    labelOffsetY: 82,
    assetKey: 'errorBay',
  },
  {
    id: 'treasure',
    label: 'Offer Island',
    labelRu: 'Остров оффера',
    x: 88,
    y: 26,
    scale: 1.28,
    baseSize: 150,
    labelOffsetX: 0,
    labelOffsetY: 92,
    assetKey: 'treasure',
  },
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

/** Z-index layers for the map */
export const MAP_Z = {
  ocean: 0,
  atmosphere: 5,
  route: 10,
  decorations: 20,
  islands: 30,
  islandLabels: 40,
  ship: 50,
  weather: 60,
  hud: 70,
  sidebar: 80,
  modal: 90,
  debug: 100,
} as const;
