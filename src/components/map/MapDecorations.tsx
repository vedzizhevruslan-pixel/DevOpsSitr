import { motion } from 'framer-motion';
import { MAP_DECORATIONS, pirateAssets } from '../../config/assetManifest';
import { AssetImage } from '../ui/AssetImage';

export function MapDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
      {MAP_DECORATIONS.map((deco) => {
        const src = pirateAssets.decorations[deco.assetKey];
        const size = 80 * deco.scale;
        return (
          <motion.div
            key={deco.id}
            className="absolute"
            style={{
              left: `${deco.x}%`,
              top: `${deco.y}%`,
              width: size,
              opacity: deco.opacity ?? 1,
              transform: deco.flip ? 'translate(-50%, -50%) scaleX(-1)' : 'translate(-50%, -50%)',
            }}
            animate={
              deco.assetKey.startsWith('cloud')
                ? { x: [0, 6, 0], y: [0, -3, 0] }
                : deco.assetKey === 'seagull'
                  ? { x: [0, 12, 0], y: [0, -4, 0] }
                  : undefined
            }
            transition={{ duration: 8 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AssetImage
              src={src}
              alt=""
              className="w-full h-auto object-contain drop-shadow-md"
              fallback={null}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
