import { openDB, type IDBPDatabase } from 'idb';
import type { PdfOfferMeta } from '../types';

const DB_NAME = 'devops-pirate-voyage';
const STORE_NAME = 'pdf-offer';
const PDF_KEY = 'user-offer';

interface PdfRecord {
  meta: PdfOfferMeta;
  blob: Blob;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function savePdfOffer(file: File): Promise<PdfOfferMeta> {
  const meta: PdfOfferMeta = {
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    type: file.type,
  };
  const db = await getDb();
  await db.put(STORE_NAME, { meta, blob: file }, PDF_KEY);
  return meta;
}

export async function getPdfOffer(): Promise<{ meta: PdfOfferMeta; blob: Blob } | null> {
  const db = await getDb();
  const record = (await db.get(STORE_NAME, PDF_KEY)) as PdfRecord | undefined;
  if (!record) return null;
  return { meta: record.meta, blob: record.blob };
}

export async function deletePdfOffer(): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, PDF_KEY);
}

export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  const maxBytes = 10 * 1024 * 1024;
  if (!file) return { valid: false, error: 'Файл не выбран' };
  if (file.type !== 'application/pdf') return { valid: false, error: 'Только PDF файлы' };
  if (!file.name.toLowerCase().endsWith('.pdf')) return { valid: false, error: 'Расширение должно быть .pdf' };
  if (file.size > maxBytes) return { valid: false, error: 'Максимальный размер: 10 MB' };
  return { valid: true };
}

export function openPdfBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export function downloadPdfBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
