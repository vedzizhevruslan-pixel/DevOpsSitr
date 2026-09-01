import { useState, useEffect } from 'react';

interface AssetImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}

const failedAssets = new Set<string>();

export function AssetImage({ src, alt, className, style, fallback }: AssetImageProps) {
  const [ok, setOk] = useState(!failedAssets.has(src));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (failedAssets.has(src)) setOk(false);
  }, [src]);

  if (!ok) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#1a4a7a]/60 to-[#0d2847]/80 border border-cyan-500/20 rounded-lg ${className ?? ''}`}
        style={style}
        aria-label={alt}
      >
        {fallback ?? <span className="text-2xl opacity-40">🏝️</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className ?? ''} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      style={style}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (import.meta.env.DEV) console.warn(`[Asset] Missing: ${src}`);
        failedAssets.add(src);
        setOk(false);
      }}
      draggable={false}
    />
  );
}

export function preloadAssets(urls: string[]) {
  urls.forEach((url) => {
    if (failedAssets.has(url)) return;
    const img = new Image();
    img.onerror = () => {
      if (import.meta.env.DEV) console.warn(`[Asset preload] Missing: ${url}`);
      failedAssets.add(url);
    };
    img.src = url;
  });
}
