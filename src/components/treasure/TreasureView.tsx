import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/playerStore';
import { TOPIC_ORDER } from '../../data/topics';
import { pirateAssets } from '../../config/assetManifest';
import { AssetImage } from '../ui/AssetImage';
import {
  savePdfOffer,
  getPdfOffer,
  validatePdfFile,
  openPdfBlob,
  downloadPdfBlob,
} from '../../storage/pdfOfferStorage';

export function TreasureView() {
  const topicProgress = useGameStore((s) => s.topicProgress);
  const finalReviewCompleted = useGameStore((s) => s.finalReviewCompleted);
  const treasureUnlocked = useGameStore((s) => s.treasureUnlocked);
  const pdfMeta = useGameStore((s) => s.pdfMeta);
  const mistakes = useGameStore((s) => s.mistakes);
  const setPdfMeta = useGameStore((s) => s.setPdfMeta);
  const checkTreasureUnlock = useGameStore((s) => s.checkTreasureUnlock);
  const unlockTreasure = useGameStore((s) => s.unlockTreasure);
  const setScreen = useGameStore((s) => s.setScreen);

  const [uploadError, setUploadError] = useState('');
  const [chestOpen, setChestOpen] = useState(false);
  const [unlockAnim, setUnlockAnim] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const allTopicsDone = TOPIC_ORDER.every(
    (id) =>
      (topicProgress[id]?.masteryScore ?? 0) >= 70 &&
      (topicProgress[id]?.quizAttempts.length ?? 0) > 0,
  );
  const noUnresolved = mistakes.filter((m) => !m.resolved).length === 0;

  useEffect(() => {
    getPdfOffer().then((offer) => {
      if (offer) setPdfMeta(offer.meta);
    });
  }, [setPdfMeta]);

  useEffect(() => {
    if (treasureUnlocked) setChestOpen(true);
  }, [treasureUnlocked]);

  const conditions = [
    { label: 'Все 7 островов пройдены', done: allTopicsDone },
    { label: 'Финальный обзор ошибок', done: finalReviewCompleted },
    { label: 'Нет открытых пробоин', done: noUnresolved },
    { label: 'PDF оффера загружен', done: !!pdfMeta },
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validatePdfFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Ошибка');
      return;
    }
    setUploadError('');
    const meta = await savePdfOffer(file);
    setPdfMeta(meta);
    checkTreasureUnlock();
  };

  useEffect(() => {
    if (allTopicsDone && finalReviewCompleted && noUnresolved && pdfMeta && !treasureUnlocked) {
      setUnlockAnim(true);
      setTimeout(() => {
        setChestOpen(true);
        unlockTreasure();
      }, 1500);
    }
  }, [allTopicsDone, finalReviewCompleted, noUnresolved, pdfMeta, treasureUnlocked, unlockTreasure]);

  return (
    <div className="h-full relative overflow-hidden flex items-center justify-center">
      <AssetImage src={pirateAssets.islands.treasure} alt="Treasure Island" className="absolute inset-0 w-full h-full object-cover" fallback={null} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-transparent to-[#0a1628]/40" />

      <div className="relative z-10 text-center max-w-lg p-6">
        <h2 className="text-3xl font-display font-bold text-amber-200 mb-2">Остров оффера</h2>

        <div className="relative my-8 h-40 flex items-center justify-center">
          <AnimatePresence>
            {unlockAnim && !chestOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, rotate: [0, -5, 5, -5, 0] }}
                className="absolute text-4xl text-amber-400"
              >
                🔒
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div animate={chestOpen ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.6 }}>
            <AssetImage
              src={chestOpen ? pirateAssets.chest.open : pirateAssets.chest.closed}
              alt="Treasure chest"
              className={`w-36 h-36 mx-auto object-contain ${chestOpen ? 'treasure-glow' : ''}`}
              fallback={<span className="text-7xl">{chestOpen ? '📂' : '📦'}</span>}
            />
          </motion.div>
          {chestOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full"
            >
              {pdfMeta && (
                <div className="bg-black/60 border border-amber-500/40 rounded-lg px-4 py-2 inline-block">
                  <span className="text-amber-200">📄 {pdfMeta.fileName}</span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {!treasureUnlocked ? (
          <>
            <p className="text-cyan-300/80 mb-6 text-sm">
              Настоящий DevOps-пират завершает путешествие оффером, а не картинкой с золотом.
            </p>
            <div className="bg-black/40 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
              {conditions.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <span className={c.done ? 'text-emerald-400' : 'text-red-400'}>{c.done ? '✓' : '○'}</span>
                  <span className={c.done ? 'text-emerald-200' : 'text-cyan-300'}>{c.label}</span>
                </div>
              ))}
            </div>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-lg font-bold text-amber-950"
            >
              ЗАГРУЗИТЬ МОЙ ОФФЕР
            </button>
            {uploadError && <p className="text-red-400 text-sm mt-2">{uploadError}</p>}
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-xl font-display font-bold text-amber-200 mb-2">LEGENDARY DEVOPS CAPTAIN</h3>
            <p className="text-amber-100/80 mb-6">Путешествие завершено!</p>
            {pdfMeta && (
              <div className="flex gap-3 justify-center">
                <button type="button" onClick={async () => { const o = await getPdfOffer(); if (o) openPdfBlob(o.blob); }} className="px-4 py-2 bg-cyan-700 rounded text-white text-sm">
                  Открыть оффер
                </button>
                <button type="button" onClick={async () => { const o = await getPdfOffer(); if (o) downloadPdfBlob(o.blob, o.meta.fileName); }} className="px-4 py-2 bg-amber-600 rounded text-white text-sm">
                  Скачать
                </button>
              </div>
            )}
            <button type="button" onClick={() => setScreen('legendary')} className="mt-6 text-amber-400 text-sm">
              Legendary Voyage →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
