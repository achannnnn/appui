/** Display variants generated next to the master file. */
export type DisplayVariant = 'list' | 'detail';

function isRemoteOrData(src: string): boolean {
  return src.startsWith('data:') || /^https?:\/\//i.test(src);
}

/** Strip list/detail/display suffixes to get the master path. */
export function masterImageSrc(src: string): string {
  if (!src) return src;
  return src.replace(/\.(?:list|detail|display)(\.[a-zA-Z0-9]+)$/, '$1');
}

/** Resolve a display-optimized image URL (list ≈600px, detail ≈1200px). */
export function displayImageSrc(src: string, variant: DisplayVariant = 'list'): string {
  if (!src) return src;
  if (isRemoteOrData(src)) return src;
  const master = masterImageSrc(src);
  return master.replace(/(\.[a-zA-Z0-9]+)$/, `.${variant}$1`);
}

/**
 * On <img onError>, step through list → detail → master.
 * Returns the next URL to try, or null when exhausted.
 */
export function nextDisplayFallback(failedSrc: string, masterSrc: string): string | null {
  if (!masterSrc || isRemoteOrData(masterSrc)) return null;
  const master = masterImageSrc(masterSrc);
  const chain = [displayImageSrc(master, 'list'), displayImageSrc(master, 'detail'), master];
  const failed = failedSrc.split('?')[0];
  const idx = chain.findIndex((candidate) => failed.endsWith(candidate) || failed === candidate);
  if (idx < 0) {
    // Unknown failed URL — try list first, then continue from there next time
    return chain[0] === failed ? chain[1] : chain[0];
  }
  return chain[idx + 1] ?? null;
}
