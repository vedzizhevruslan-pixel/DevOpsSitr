import { motion } from 'framer-motion';
import { MAP_DECORATIONS, pirateAssets } from '../../config/assetManifest';
import { MAP_Z } from '../../config/mapConfig';
import { AssetImage } from '../ui/AssetImage';
import { useMapDebug } from './mapDebugStore';

export function MapDecorations() {
  const showBounds = useMapDebug((s) => s.showAssetBounds);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: MAP_Z.decorations }}>
      {MAP_DECORATIONS.map((deco) => {
        const src = pirateAssets.decorations[deco.assetKey];
        const size = 72 * deco.scale;
        const isCloud = deco.assetKey.startsWith('cloud');
        return (
          <motion.div
            key={deco.id}
            className={`absolute ${showBounds ? 'outline outline-1 outline-lime-400/70' : ''}`}
            style={{
              left: `${deco.x}%`,
              top: `${deco.y}%`,
              width: size,
              opacity: deco.opacity ?? 1,
              transform: deco.flip ? 'translate(-50%, -50%) scaleX(-1)' : 'translate(-50%, -50%)',
            }}
            animate={
              isCloud
                ? { x: [0, 8, 0], y: [0, -3, 0] }
                : deco.assetKey === 'seagull'
                  ? { x: [0, 14, 0], y: [0, -5, 0] }
                  : undefined
            }
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
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
