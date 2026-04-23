function Frame7({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex gap-[10px] items-center justify-center relative shrink-0"}>
      <div className="relative shrink-0 size-[8px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
        </svg>
      </div>
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] whitespace-nowrap">ライフスタイル系</p>
    </div>
  );
}

function Frame8({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex gap-[10px] items-center relative shrink-0"}>
      <div className="relative shrink-0 size-[5px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
          <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
        </svg>
      </div>
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">ライフスタイル</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <Frame7 />
      <Frame8 />
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">ヘルスケア／フィットネス</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">フード／ドリンク</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">ショッピング</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[8px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] whitespace-nowrap">エンタメ系</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">ゲーム</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">エンターテインメント</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">音楽</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">写真／ビデオ</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[8px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] whitespace-nowrap">ビジネス・実用系</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">仕事効率化</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">ビジネス</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">ファイナンス</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">ユーティリティ</p>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[8px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] whitespace-nowrap">コミュニケーション系</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">SNS</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">メッセージ</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">ソーシャルネットワーキング</p>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[8px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] whitespace-nowrap">学習・情報系</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">教育</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">ニュース</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">書籍／参考書</p>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[8px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] whitespace-nowrap">その他</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">ナビゲーション</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">旅行</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">天気</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px] whitespace-nowrap">医療</p>
      </div>
    </div>
  );
}

export default function Frame6() {
  return (
    <div className="bg-white content-stretch flex gap-[36px] items-start p-[20px] relative rounded-[6px] size-full">
      <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Frame />
      <Frame1 />
      <Frame2 />
      <Frame3 />
      <Frame4 />
      <Frame5 />
    </div>
  );
}