import { motion } from 'framer-motion';
import { pirateAssets } from '../../config/assetManifest';
import { MAP_Z } from '../../config/mapConfig';
import { AssetImage } from '../ui/AssetImage';
import { getPositionOnRoute, getRouteAngle } from '../../engines/routeEngine';
import { useMapDebug } from './mapDebugStore';

interface ShipSpriteProps {
  progress: number;
  animating: boolean;
}

export function ShipSprite({ progress, animating }: ShipSpriteProps) {
  const pos = getPositionOnRoute(progress);
  const angle = getRouteAngle(progress);
  const showBounds = useMapDebug((s) => s.showAssetBounds);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex: MAP_Z.ship,
      }}
      animate={{
        x: '-50%',
        y: '-70%',
        rotate: angle * 0.12,
      }}
      transition={{
        type: 'spring',
        stiffness: animating ? 40 : 120,
        damping: animating ? 18 : 22,
      }}
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative ${showBounds ? 'outline outline-1 outline-cyan-300/80' : ''}`}
      >
        <AssetImage
          src={pirateAssets.ship}
          alt="Docker Ship"
          className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl"
          fallback={<span className="text-4xl">🚢</span>}
        />
      </motion.div>
    </motion.div>
  );
}
