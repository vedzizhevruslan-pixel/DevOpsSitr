/** DevOps Pirate Asset Pack — production art imports */
import oceanBackground from '../assets/pirate/backgrounds/ocean-background.webp';
import linuxIsland from '../assets/pirate/islands/linux-island.webp';
import networksIsland from '../assets/pirate/islands/networks-island.webp';
import ansibleIsland from '../assets/pirate/islands/ansible-island.webp';
import terraformIsland from '../assets/pirate/islands/terraform-island.webp';
import dockerIsland from '../assets/pirate/islands/docker-island.webp';
import kubernetesIsland from '../assets/pirate/islands/kubernetes-island.webp';
import gitlabIsland from '../assets/pirate/islands/gitlab-island.webp';
import mistakeBay from '../assets/pirate/islands/mistake-bay.webp';
import treasureIsland from '../assets/pirate/islands/treasure-island.webp';
import dockerShip from '../assets/pirate/ships/docker-ship.webp';
import stormCloud from '../assets/pirate/weather/storm-cloud.webp';
import chestClosed from '../assets/pirate/treasure/chest-closed.webp';
import chestOpen from '../assets/pirate/treasure/chest-open.webp';
import rock01 from '../assets/pirate/decorations/rock-01.webp';
import rock02 from '../assets/pirate/decorations/rock-02.webp';
import buoy from '../assets/pirate/decorations/buoy.webp';
import barrel from '../assets/pirate/decorations/barrel.webp';
import crate from '../assets/pirate/decorations/crate.webp';
import bottle from '../assets/pirate/decorations/bottle.webp';
import compass from '../assets/pirate/decorations/compass.webp';
import rowboat from '../assets/pirate/decorations/rowboat.webp';
import wreck from '../assets/pirate/decorations/wreck.webp';
import cloud01 from '../assets/pirate/decorations/cloud-01.webp';
import cloud02 from '../assets/pirate/decorations/cloud-02.webp';
import seagull from '../assets/pirate/decorations/seagull.webp';
import sharkFin from '../assets/pirate/decorations/shark-fin.webp';
import whaleTail from '../assets/pirate/decorations/whale-tail.webp';

export const pirateAssets = {
  ocean: oceanBackground,
  islands: {
    linux: linuxIsland,
    networks: networksIsland,
    ansible: ansibleIsland,
    terraform: terraformIsland,
    docker: dockerIsland,
    kubernetes: kubernetesIsland,
    gitlab: gitlabIsland,
    errorBay: mistakeBay,
    treasure: treasureIsland,
  },
  ship: dockerShip,
  storm: stormCloud,
  chest: {
    closed: chestClosed,
    open: chestOpen,
  },
  decorations: {
    rock01,
    rock02,
    buoy,
    barrel,
    crate,
    bottle,
    compass,
    rowboat,
    wreck,
    cloud01,
    cloud02,
    seagull,
    sharkFin,
    whaleTail,
  },
} as const;

export type IslandAssetKey = keyof typeof pirateAssets.islands;
export type DecorationAssetKey = keyof typeof pirateAssets.decorations;

export interface MapDecoration {
  id: string;
  assetKey: DecorationAssetKey;
  x: number;
  y: number;
  scale: number;
  opacity?: number;
  flip?: boolean;
}

/** Atmospheric props — coordinates in % of map viewport */
export const MAP_DECORATIONS: MapDecoration[] = [
  { id: 'cloud-tl', assetKey: 'cloud01', x: 8, y: 6, scale: 1.1, opacity: 0.85 },
  { id: 'cloud-tr', assetKey: 'cloud02', x: 72, y: 4, scale: 0.9, opacity: 0.75 },
  { id: 'cloud-mid', assetKey: 'cloud01', x: 45, y: 8, scale: 0.7, opacity: 0.6 },
  { id: 'buoy-1', assetKey: 'buoy', x: 18, y: 78, scale: 0.55, opacity: 0.9 },
  { id: 'rock-1', assetKey: 'rock01', x: 6, y: 48, scale: 0.35, opacity: 0.8 },
  { id: 'rock-2', assetKey: 'rock02', x: 32, y: 72, scale: 0.3, opacity: 0.75 },
  { id: 'barrel-1', assetKey: 'barrel', x: 42, y: 68, scale: 0.4, opacity: 0.85 },
  { id: 'bottle-1', assetKey: 'bottle', x: 55, y: 72, scale: 0.35, opacity: 0.8 },
  { id: 'compass-1', assetKey: 'compass', x: 92, y: 62, scale: 0.3, opacity: 0.7 },
  { id: 'rowboat-1', assetKey: 'rowboat', x: 28, y: 82, scale: 0.45, opacity: 0.85 },
  { id: 'wreck-1', assetKey: 'wreck', x: 85, y: 58, scale: 0.4, opacity: 0.75 },
  { id: 'seagull-1', assetKey: 'seagull', x: 50, y: 18, scale: 0.35, opacity: 0.9 },
  { id: 'seagull-2', assetKey: 'seagull', x: 62, y: 22, scale: 0.28, opacity: 0.8, flip: true },
  { id: 'shark-1', assetKey: 'sharkFin', x: 75, y: 68, scale: 0.35, opacity: 0.85 },
  { id: 'whale-1', assetKey: 'whaleTail', x: 5, y: 85, scale: 0.4, opacity: 0.8 },
];

/** All asset URLs for preloading */
export function getAllAssetUrls(): string[] {
  return [
    pirateAssets.ocean,
    pirateAssets.ship,
    pirateAssets.storm,
    pirateAssets.chest.closed,
    pirateAssets.chest.open,
    ...Object.values(pirateAssets.islands),
    ...Object.values(pirateAssets.decorations),
  ];
}
