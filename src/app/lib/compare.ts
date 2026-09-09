export type CompareItem = {
  key: string;
  appId: string;
  appName: string;
  sectionTitle: string;
  imageId: string;
  src: string;
  filename: string;
};

export function makeCompareKey(appId: string, imageId: string) {
  return `${appId}:${imageId}`;
}

export function createCompareItem(input: {
  appId: string;
  appName: string;
  sectionTitle: string;
  imageId: string;
  src: string;
  filename: string;
}): CompareItem {
  return {
    key: makeCompareKey(input.appId, input.imageId),
    appId: input.appId,
    appName: input.appName,
    sectionTitle: input.sectionTitle,
    imageId: input.imageId,
    src: input.src,
    filename: input.filename,
  };
}

/** Toggle / fill up to 2 slots. Returns next slots. */
export function toggleCompareSlot(
  slots: [CompareItem | null, CompareItem | null],
  item: CompareItem,
): [CompareItem | null, CompareItem | null] {
  const existing = slots.findIndex((slot) => slot?.key === item.key);
  if (existing >= 0) {
    const next: [CompareItem | null, CompareItem | null] = [slots[0], slots[1]];
    next[existing] = null;
    return next;
  }

  if (!slots[0]) return [item, slots[1]];
  if (!slots[1]) return [slots[0], item];
  // Both full → replace the second
  return [slots[0], item];
}

export function compareSlotCount(slots: [CompareItem | null, CompareItem | null]) {
  return (slots[0] ? 1 : 0) + (slots[1] ? 1 : 0);
}
