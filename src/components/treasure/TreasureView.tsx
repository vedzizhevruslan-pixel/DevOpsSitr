import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/playerStore';
import { TOPIC_ORDER } from '../../data/topics';
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
  const setPdfMeta = useGameStore((s) => s.setPdfMeta);
  const checkTreasureUnlock = useGameStore((s) => s.checkTreasureUnlock);
  const unlockTreasure = useGameStore((s) => s.unlockTreasure);
  const setScreen = useGameStore((s) => s.setScreen);

  const [uploadError, setUploadError] = useState('');
  const [showUnlock, setShowUnlock] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const allTopicsDone = TOPIC_ORDER.every(
    (id) =>
      topicProgress[id]?.masteryScore >= 70 &&
      (topicProgress[id]?.quizAttempts.length ?? 0) > 0,
  );

  useEffect(() => {
    getPdfOffer().then((offer) => {
      if (offer) setPdfMeta(offer.meta);
    });
  }, [setPdfMeta]);

  const conditions = [
    { label: 'Все 7 островов пройдены', done: allTopicsDone },
    { label: 'Финальный обзор ошибок', done: finalReviewCompleted },
    { label: 'PDF оффера загружен', done: !!pdfMeta },
  ];

  const allConditionsMet = conditions.every((c) => c.done);

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
    if (allConditionsMet || (allTopicsDone && finalReviewCompleted)) {
      checkTreasureUnlock();
      if (!treasureUnlocked) {
        setShowUnlock(true);
        unlockTreasure();
      }
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#1a3050] to-[#0d2847]" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-900/30 to-transparent" />

      <div className="relative z-10 text-center max-w-lg">
        <motion.div
          animate={treasureUnlocked ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-6"
        >
          {treasureUnlocked ? '💎' : '🔒'}
        </motion.div>

        <h2 className="text-3xl font-bold text-amber-200 mb-2">Остров оффера</h2>

        {!treasureUnlocked ? (
          <>
            <p className="text-blue-300 mb-6">
              Главный клад пока не найден.
              <br />
              <span className="text-sm opacity-70">
                Настоящий DevOps-пират завершает путешествие не картинкой с золотом, а оффером.
              </span>
            </p>

            <div className="bg-[#1a3050]/80 rounded-xl p-4 mb-6 text-left space-y-2">
              {conditions.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  <span className={c.done ? 'text-green-400' : 'text-red-400'}>
                    {c.done ? '✓' : '○'}
                  </span>
                  <span className={c.done ? 'text-green-200' : 'text-blue-300'}>{c.label}</span>
                </div>
              ))}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-lg font-bold text-amber-950 mb-2"
            >
              📄 ЗАГРУЗИТЬ МОЙ ОФФЕР
            </button>
            {uploadError && <p className="text-red-400 text-sm">{uploadError}</p>}
            {pdfMeta && (
              <p className="text-green-400 text-sm mt-2">
                ✓ {pdfMeta.fileName} ({(pdfMeta.fileSize / 1024).toFixed(0)} KB)
              </p>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="treasure-glow bg-gradient-to-br from-amber-900/40 to-yellow-900/20 border border-amber-500/50 rounded-2xl p-8"
          >
            <div className="text-4xl mb-4">🏴‍☠️</div>
            <h3 className="text-2xl font-bold text-amber-200 mb-2">ПУТЕШЕСТВИЕ ЗАВЕРШЕНО</h3>
            <p className="text-amber-100/80 mb-6">Ты получил свой DevOps-оффер!</p>

            {pdfMeta && (
              <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
                <div className="text-amber-300 font-semibold">📄 {pdfMeta.fileName}</div>
                <div className="text-sm text-blue-300 mt-1">
                  Загружен: {new Date(pdfMeta.uploadedAt).toLocaleDateString('ru')}
                </div>
                <div className="text-sm text-blue-400">
                  Размер: {(pdfMeta.fileSize / 1024).toFixed(0)} KB
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={async () => {
                  const offer = await getPdfOffer();
                  if (offer) openPdfBlob(offer.blob);
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
              >
                Открыть оффер
              </button>
              <button
                onClick={async () => {
                  const offer = await getPdfOffer();
                  if (offer) downloadPdfBlob(offer.blob, offer.meta.fileName);
                }}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white"
              >
                Скачать
              </button>
            </div>

            <div className="mt-8 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-bold text-purple-200">LEGENDARY DEVOPS CAPTAIN</div>
            </div>

            <button
              onClick={() => setScreen('legendary')}
              className="mt-6 text-amber-400 hover:text-amber-300 text-sm"
            >
              Legendary Voyage →
            </button>
          </motion.div>
        )}

        {showUnlock && !treasureUnlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">✨🎉✨</div>
              <p className="text-amber-200 text-xl font-bold">Сундук открывается!</p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
