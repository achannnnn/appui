type ComponentDropdownProps = {
  onItemClick: (item: string) => void;
  items?: string[];
};

export function ComponentDropdown({ onItemClick, items = [] }: ComponentDropdownProps) {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start p-[20px] relative rounded-[6px] min-w-[240px] max-w-[360px] max-h-[60vh] overflow-auto">
      <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[6px]" />
      {items.length === 0 ? (
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#717171] text-[12px] tracking-[0.528px]">
          利用可能なコンポーネントがありません
        </p>
      ) : (
        items.map((item) => (
          <button
            key={item}
            onClick={() => onItemClick(item)}
            type="button"
            className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70"
          >
            <span className="relative shrink-0 size-[5px]">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
                <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" r="2.5" />
              </svg>
            </span>
            <span className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] text-left">
              {item}
            </span>
          </button>
        ))
      )}
    </div>
  );
}
