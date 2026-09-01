/** DevOps Pirate Asset Pack manifest. Missing assets use graceful placeholders. */
export const pirateAssets = {
  ocean: '/assets/pirate/ocean-background.webp',
  islands: {
    linux: '/assets/pirate/islands/linux-island.webp',
    networks: '/assets/pirate/islands/networks-island.webp',
    ansible: '/assets/pirate/islands/ansible-island.webp',
    terraform: '/assets/pirate/islands/terraform-island.webp',
    docker: '/assets/pirate/islands/docker-island.webp',
    kubernetes: '/assets/pirate/islands/kubernetes-island.webp',
    gitlab: '/assets/pirate/islands/gitlab-island.webp',
    errorBay: '/assets/pirate/islands/mistake-bay.webp',
    treasure: '/assets/pirate/islands/treasure-island.webp',
  },
  ship: '/assets/pirate/ships/docker-ship.webp',
  storm: '/assets/pirate/weather/storm-cloud.webp',
  chest: {
    closed: '/assets/pirate/treasure/chest-closed.webp',
    open: '/assets/pirate/treasure/chest-open.webp',
  },
  decorations: {
    rock01: '/assets/pirate/decorations/rock-01.webp',
    rock02: '/assets/pirate/decorations/rock-02.webp',
    buoy: '/assets/pirate/decorations/buoy.webp',
    barrel: '/assets/pirate/decorations/barrel.webp',
    bottle: '/assets/pirate/decorations/bottle.webp',
    cloud01: '/assets/pirate/decorations/cloud-01.webp',
    cloud02: '/assets/pirate/decorations/cloud-02.webp',
    wreck: '/assets/pirate/decorations/wreck.webp',
    compass: '/assets/pirate/decorations/compass.webp',
  },
} as const;

export type IslandAssetKey = keyof typeof pirateAssets.islands;
