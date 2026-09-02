import { motion } from 'framer-motion';
import { pirateAssets } from '../../config/assetManifest';
import { AssetImage } from '../ui/AssetImage';
import { getPositionOnRoute, getRouteAngle } from '../../engines/routeEngine';

interface ShipSpriteProps {
  progress: number;
  animating: boolean;
}

export function ShipSprite({ progress, animating }: ShipSpriteProps) {
  const pos = getPositionOnRoute(progress);
  const angle = getRouteAngle(progress);

  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      animate={{
        x: '-50%',
        y: '-85%',
        rotate: angle * 0.15,
      }}
      transition={{
        type: 'spring',
        stiffness: animating ? 40 : 120,
        damping: animating ? 18 : 22,
        duration: animating ? 2.5 : 0.3,
      }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="absolute -left-6 top-1/2 w-8 h-0.5 bg-cyan-300/30 blur-sm rounded-full" />
        <AssetImage
          src={pirateAssets.ship}
          alt="Docker Ship"
          className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-2xl"
          fallback={<span className="text-4xl">🚢</span>}
        />
      </motion.div>
    </motion.div>
  );
}
