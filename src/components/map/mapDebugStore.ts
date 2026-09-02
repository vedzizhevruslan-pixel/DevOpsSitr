import { create } from 'zustand';

interface MapDebugState {
  showAssetBounds: boolean;
  setShowAssetBounds: (v: boolean) => void;
  toggleAssetBounds: () => void;
}

export const useMapDebug = create<MapDebugState>((set) => ({
  showAssetBounds: false,
  setShowAssetBounds: (v) => set({ showAssetBounds: v }),
  toggleAssetBounds: () => set((s) => ({ showAssetBounds: !s.showAssetBounds })),
}));
