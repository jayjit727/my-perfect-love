import type { SiteContent, Photo } from '../types';
import { DEFAULT_CONTENT, INITIAL_PHOTOS } from '../types';

const DB_NAME = 'BirthdaySurpriseDB';
const DB_VERSION = 2;

const STORES = {
  content: 'content',
  photos: 'photos',
  music: 'music',
  meta: 'meta',
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.content)) {
        db.createObjectStore(STORES.content);
      }
      if (!db.objectStoreNames.contains(STORES.photos)) {
        const photoStore = db.createObjectStore(STORES.photos, { keyPath: 'id' });
        photoStore.createIndex('order', 'order', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.music)) {
        db.createObjectStore(STORES.music);
      }
      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ===== Site Content =====
export async function saveContent(content: SiteContent): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.content, 'readwrite');
    tx.objectStore(STORES.content).put(content, 'siteContent');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadContent(): Promise<SiteContent> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.content, 'readonly');
    const req = tx.objectStore(STORES.content).get('siteContent');
    req.onsuccess = () => {
      if (req.result) {
        const loaded = { ...DEFAULT_CONTENT, ...req.result };
        // Clean up legacy preHeading and update subtitle
        if (loaded.preHeading === 'A LITTLE WORLD, MADE WITH LOVE') {
          loaded.preHeading = '';
        }
        if (!loaded.subHeading || loaded.subHeading === 'for you') {
          loaded.subHeading = 'behind the scenes of my happiness';
        }
        // Upgrade to user's authentic love letter if old placeholder was cached
        if (
          !loaded.letterParagraphs ||
          loaded.letterParagraphs.length === 0 ||
          (loaded.letterParagraphs[0] && loaded.letterParagraphs[0].includes('I still remember the first time I saw you'))
        ) {
          loaded.letterParagraphs = DEFAULT_CONTENT.letterParagraphs;
          loaded.letterClosing = DEFAULT_CONTENT.letterClosing;
        }
        if (!loaded.letterClosing || !loaded.letterClosing.includes('Jb')) {
          loaded.letterClosing = DEFAULT_CONTENT.letterClosing;
        }
        resolve(loaded);
      } else {
        resolve(DEFAULT_CONTENT);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

// ===== Photos =====
export async function savePhotos(photos: Photo[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.photos, 'readwrite');
    const store = tx.objectStore(STORES.photos);
    store.clear();
    photos.forEach((photo, idx) => {
      store.put({ ...photo, order: idx });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadPhotos(): Promise<Photo[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.photos, 'readwrite');
    const store = tx.objectStore(STORES.photos);
    const req = store.getAll();
    req.onsuccess = () => {
      const stored = req.result as Photo[];
      const isOutdated =
        !stored ||
        stored.length === 0 ||
        stored.length !== INITIAL_PHOTOS.length ||
        stored.some(
          (p) =>
            p.caption.includes('After 4 years') ||
            p.caption.includes('Day two') ||
            p.caption.includes('Looking forward to thousands')
        );

      if (isOutdated) {
        store.clear();
        INITIAL_PHOTOS.forEach((photo, idx) => {
          store.put({ ...photo, order: idx });
        });
        resolve(INITIAL_PHOTOS);
      } else {
        resolve(stored.sort((a, b) => a.order - b.order));
      }
    };
    req.onerror = () => reject(req.error);
  });
}

// ===== Custom Background Music (Blob / Base64) =====
export async function saveMusicFile(fileData: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.music, 'readwrite');
    tx.objectStore(STORES.music).put(fileData, 'customMusic');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadMusicFile(): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.music, 'readonly');
    const req = tx.objectStore(STORES.music).get('customMusic');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function clearCustomMusic(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.music, 'readwrite');
    tx.objectStore(STORES.music).delete('customMusic');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ===== Finalized Flag =====
export async function saveFinalizedFlag(isFinalized: boolean): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.meta, 'readwrite');
    tx.objectStore(STORES.meta).put(isFinalized, 'isFinalized');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadFinalizedFlag(): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.meta, 'readonly');
    const req = tx.objectStore(STORES.meta).get('isFinalized');
    req.onsuccess = () => resolve(req.result === true);
    req.onerror = () => reject(req.error);
  });
}

// ===== Export & Import All Content =====
export interface ExportBundle {
  version: number;
  exportedAt: string;
  isFinalized: boolean;
  content: SiteContent;
  photos: Photo[];
  customMusic: string | null;
}

export async function exportAllData(): Promise<string> {
  const content = await loadContent();
  const photos = await loadPhotos();
  const customMusic = await loadMusicFile();
  const isFinalized = await loadFinalizedFlag();

  const bundle: ExportBundle = {
    version: 2,
    exportedAt: new Date().toISOString(),
    isFinalized,
    content,
    photos,
    customMusic,
  };

  return JSON.stringify(bundle, null, 2);
}

export async function importAllData(jsonString: string): Promise<void> {
  const bundle = JSON.parse(jsonString) as ExportBundle;
  if (!bundle.content) {
    throw new Error('Invalid backup file: missing content');
  }

  await saveContent(bundle.content);
  if (bundle.photos && Array.isArray(bundle.photos)) {
    await savePhotos(bundle.photos);
  }
  if (bundle.customMusic) {
    await saveMusicFile(bundle.customMusic);
  } else {
    await clearCustomMusic();
  }
  if (typeof bundle.isFinalized === 'boolean') {
    await saveFinalizedFlag(bundle.isFinalized);
  }
}
