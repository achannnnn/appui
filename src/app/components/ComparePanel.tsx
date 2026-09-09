import { Columns2, X } from "lucide-react";
import { useEffect } from "react";
import { displayImageSrc, nextDisplayFallback } from "../lib/imageUrl";
import type { CompareItem } from "../lib/compare";
import { compareSlotCount } from "../lib/compare";

type CompareTrayProps = {
  slots: [CompareItem | null, CompareItem | null];
  onRemove: (index: 0 | 1) => void;
  onClear: () => void;
  onOpenCompare: () => void;
};

type CompareViewProps = {
  slots: [CompareItem, CompareItem];
  onClose: () => void;
  onRemove: (index: 0 | 1) => void;
};

function SlotThumb({
  item,
  index,
  onRemove,
}: {
  item: CompareItem | null;
  index: 0 | 1;
  onRemove: (index: 0 | 1) => void;
}) {
  if (!item) {
    return (
      <div className="flex h-[72px] w-[34px] items-center justify-center rounded-[8px] border border-dashed border-[#333]/35 bg-white/40">
        <span className="font-['Noto_Sans_JP:Medium',sans-serif] text-[10px] text-[#999]">
          {index + 1}
        </span>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="h-[72px] w-[34px] overflow-hidden rounded-[8px] border border-[#333]/20 bg-white">
        <img
          alt=""
          className="h-full w-full object-cover object-top"
          decoding="async"
          src={displayImageSrc(item.src, "list")}
          onError={(e) => {
            const next = nextDisplayFallback(
              e.currentTarget.currentSrc || e.currentTarget.src,
              item.src,
            );
            if (next) e.currentTarget.src = next;
          }}
        />
      </div>
      <button
        aria-label="比較から外す"
        className="absolute -right-1.5 -top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#333] bg-white text-[#333] opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onRemove(index)}
        type="button"
      >
        <X size={10} />
      </button>
    </div>
  );
}

export function CompareTray({ slots, onRemove, onClear, onOpenCompare }: CompareTrayProps) {
  const count = compareSlotCount(slots);
  if (count === 0) return null;

  const ready = Boolean(slots[0] && slots[1]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden md:block">
      <div className="pointer-events-auto mx-auto mb-5 flex w-fit max-w-[calc(100%-48px)] items-center gap-4 rounded-[16px] border border-[#333]/15 bg-[#efede4]/95 px-4 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.12)] backdrop-blur-sm">
        <div className="flex items-center gap-2 text-[#333]">
          <Columns2 size={16} />
          <p className="font-['Noto_Sans_JP:Bold',sans-serif] text-[13px] tracking-[0.4px]">
            比較
          </p>
          <span className="font-['Noto_Sans_JP:Medium',sans-serif] text-[12px] text-[#717171]">
            {count}/2
          </span>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <SlotThumb item={slots[0]} index={0} onRemove={onRemove} />
            {slots[0] && (
              <p className="max-w-[72px] truncate font-['Noto_Sans_JP:Medium',sans-serif] text-[9px] text-[#717171]">
                {slots[0].appName}
              </p>
            )}
          </div>
          <span className="mb-8 font-['Noto_Sans_JP:Medium',sans-serif] text-[11px] text-[#999]">
            vs
          </span>
          <div className="flex flex-col gap-1">
            <SlotThumb item={slots[1]} index={1} onRemove={onRemove} />
            {slots[1] ? (
              <p className="max-w-[72px] truncate font-['Noto_Sans_JP:Medium',sans-serif] text-[9px] text-[#717171]">
                {slots[1].appName}
              </p>
            ) : (
              <p className="max-w-[88px] font-['Noto_Sans_JP:Medium',sans-serif] text-[9px] text-[#999]">
                もう1枚選ぶ
              </p>
            )}
          </div>
        </div>

        <div className="ml-1 flex items-center gap-2">
          <button
            className={`rounded-full border px-4 py-1.5 font-['Noto_Sans_JP:Bold',sans-serif] text-[12px] transition-opacity ${
              ready
                ? "border-[#333] bg-[#333] text-white hover:opacity-80"
                : "cursor-not-allowed border-[#ccc] bg-[#e8e6dc] text-[#aaa]"
            }`}
            disabled={!ready}
            onClick={onOpenCompare}
            type="button"
          >
            横並びで比較
          </button>
          <button
            className="rounded-full border border-[#333]/30 bg-white px-3 py-1.5 font-['Noto_Sans_JP:Medium',sans-serif] text-[12px] text-[#333] transition-opacity hover:opacity-70"
            onClick={onClear}
            type="button"
          >
            クリア
          </button>
        </div>
      </div>
    </div>
  );
}

function CompareColumn({
  item,
  side,
  onRemove,
}: {
  item: CompareItem;
  side: "left" | "right";
  onRemove: () => void;
}) {
  return (
    <div className="flex w-[min(36vw,340px)] shrink-0 flex-col items-center gap-3">
      <div className="flex w-full items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="truncate font-['Noto_Sans_JP:Bold',sans-serif] text-[15px] tracking-[0.4px] text-[#333]">
            {item.appName}
          </p>
          <p className="truncate font-['Noto_Sans_JP:Medium',sans-serif] text-[12px] text-[#717171]">
            {item.sectionTitle}
          </p>
        </div>
        <button
          className="shrink-0 rounded-full border border-[#333]/30 bg-white px-2.5 py-1 font-['Noto_Sans_JP:Medium',sans-serif] text-[11px] text-[#333] transition-opacity hover:opacity-70"
          onClick={onRemove}
          type="button"
        >
          外す
        </button>
      </div>
      <div className="relative h-[min(78vh,880px)] w-full max-w-[340px] aspect-[410/893] overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <img
          alt={`${item.appName} ${item.sectionTitle}`}
          className="h-full w-full object-cover object-top"
          decoding="async"
          src={displayImageSrc(item.src, "detail")}
          onError={(e) => {
            const next = nextDisplayFallback(
              e.currentTarget.currentSrc || e.currentTarget.src,
              item.src,
            );
            if (next) e.currentTarget.src = next;
          }}
        />
      </div>
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] text-[11px] text-[#999]">
        {side === "left" ? "A" : "B"}
      </p>
    </div>
  );
}

export function CompareView({ slots, onClose, onRemove }: CompareViewProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] hidden bg-[#efede4] md:block">
      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col px-6 pb-6 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#333]">
            <Columns2 size={18} />
            <p className="font-['Noto_Sans_JP:Bold',sans-serif] text-[16px] tracking-[0.6px]">
              画面比較
            </p>
            <p className="font-['Noto_Sans_JP:Regular',sans-serif] text-[11px] text-[#717171]">
              左右のUIを並べて見比べられます
            </p>
          </div>
          <button
            className="rounded-full border border-[#333] bg-white px-4 py-1.5 font-['Noto_Sans_JP:Bold',sans-serif] text-[13px] text-[#333] transition-opacity hover:opacity-70"
            onClick={onClose}
            type="button"
          >
            閉じる
          </button>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 items-center justify-center">
          <div className="flex items-center gap-4 lg:gap-6">
            <CompareColumn item={slots[0]} side="left" onRemove={() => onRemove(0)} />
            <span className="shrink-0 font-['Noto_Sans_JP:Bold',sans-serif] text-[13px] tracking-[1px] text-[#b0b0b0]">
              VS
            </span>
            <CompareColumn item={slots[1]} side="right" onRemove={() => onRemove(1)} />
          </div>
        </div>
      </div>
    </div>
  );
}
