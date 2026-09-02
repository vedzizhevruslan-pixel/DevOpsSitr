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

/** Atmospheric props — coordinates in % of PLAYFIELD (safe area) */
export const MAP_DECORATIONS: MapDecoration[] = [
  // Soft clouds — kept inside safe area (not flush to top)
  { id: 'cloud-tl', assetKey: 'cloud01', x: 16, y: 16, scale: 1.05, opacity: 0.55 },
  { id: 'cloud-tr', assetKey: 'cloud02', x: 58, y: 14, scale: 0.9, opacity: 0.45 },
  { id: 'cloud-mid', assetKey: 'cloud01', x: 36, y: 20, scale: 0.75, opacity: 0.35 },
  // Near route / islands
  { id: 'buoy-1', assetKey: 'buoy', x: 17, y: 82, scale: 0.4, opacity: 0.9 },
  { id: 'rock-1', assetKey: 'rock01', x: 9, y: 50, scale: 0.36, opacity: 0.8 },
  { id: 'rock-2', assetKey: 'rock02', x: 33, y: 84, scale: 0.3, opacity: 0.75 },
  { id: 'barrel-1', assetKey: 'barrel', x: 53, y: 76, scale: 0.36, opacity: 0.85 },
  { id: 'crate-1', assetKey: 'crate', x: 61, y: 80, scale: 0.34, opacity: 0.8 },
  { id: 'bottle-1', assetKey: 'bottle', x: 43, y: 46, scale: 0.3, opacity: 0.75 },
  { id: 'rowboat-1', assetKey: 'rowboat', x: 24, y: 88, scale: 0.4, opacity: 0.85 },
  // Near Error Bay
  { id: 'wreck-1', assetKey: 'wreck', x: 86, y: 56, scale: 0.42, opacity: 0.8 },
  // Open water
  { id: 'shark-1', assetKey: 'sharkFin', x: 64, y: 86, scale: 0.34, opacity: 0.85 },
  { id: 'whale-1', assetKey: 'whaleTail', x: 12, y: 24, scale: 0.38, opacity: 0.7 },
  // Atmosphere near islands
  { id: 'seagull-1', assetKey: 'seagull', x: 50, y: 22, scale: 0.3, opacity: 0.85 },
  { id: 'seagull-2', assetKey: 'seagull', x: 72, y: 24, scale: 0.24, opacity: 0.75, flip: true },
  { id: 'compass-1', assetKey: 'compass', x: 88, y: 82, scale: 0.26, opacity: 0.6 },
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
