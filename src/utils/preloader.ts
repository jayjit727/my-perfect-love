// Global image preloader & GPU decoder cache for instant zero-delay rendering

export const globalImageCache = new Set<string>();

export const preloadAndDecode = (src: string): Promise<void> => {
  if (!src) return Promise.resolve();
  if (globalImageCache.has(src)) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;

    const onDone = () => {
      globalImageCache.add(src);
      resolve();
    };

    if (img.complete && img.naturalWidth > 0) {
      onDone();
    } else {
      img.onload = onDone;
      img.onerror = () => resolve(); // Never block on error
    }

    if ('decode' in img && typeof img.decode === 'function') {
      img.decode().then(onDone).catch(() => {});
    }
  });
};

export const preloadBatch = (urls: string[]): void => {
  urls.forEach((url) => {
    if (url) preloadAndDecode(url);
  });
};
