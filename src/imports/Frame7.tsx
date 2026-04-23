import svgPaths from "./svg-o37juxi4ag";

function Frame() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
      <p className="font-['Noto_Sans_JP:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] whitespace-nowrap">アプリ名を検索</p>
      <div className="relative shrink-0 size-[17.575px]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.575 17.575">
          <path d={svgPaths.p1351f980} fill="var(--fill-0, #333333)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start py-[10px] relative size-full">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Frame />
    </div>
  );
}