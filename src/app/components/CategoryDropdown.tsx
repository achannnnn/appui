function Frame7({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex gap-[10px] items-center justify-center relative shrink-0"}>
      <div className="relative shrink-0 size-[8px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
        </svg>
      </div>
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px]">ライフスタイル系</p>
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
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ライフスタイル</p>
    </div>
  );
}

function Frame({ onItemClick }: { onItemClick: (item: string) => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative min-w-0">
      <Frame7 />
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ライフスタイル')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ライフスタイル</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ヘルスケア／フィットネス')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ヘルスケア／フィットネス</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('フード／ドリンク')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">フード／ドリンク</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ショッピング')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ショッピング</p>
      </div>
    </div>
  );
}

function Frame1({ onItemClick }: { onItemClick: (item: string) => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative min-w-0">
      <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[8px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px]">エンタメ系</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ゲーム')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ゲーム</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('エンターテインメント')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">エンターテインメント</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('音楽')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">音楽</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('写真／ビデオ')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">写真／ビデオ</p>
      </div>
    </div>
  );
}

function Frame2({ onItemClick }: { onItemClick: (item: string) => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative min-w-0">
      <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[8px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px]">ビジネス・実用系</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('仕事効率化')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">仕事効率化</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ビジネス')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ビジネス</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ファイナンス')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ファイナンス</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ユーティリティ')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ユーティリティ</p>
      </div>
    </div>
  );
}

function Frame3({ onItemClick }: { onItemClick: (item: string) => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative min-w-0">
      <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[8px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px]">コミュニケーション系</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('SNS')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">SNS</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('メッセージ')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">メッセージ</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ソーシャルネットワーキング')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ソーシャル<br />ネットワーキング</p>
      </div>
    </div>
  );
}

function Frame4({ onItemClick }: { onItemClick: (item: string) => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative min-w-0">
      <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[8px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px]">学習・情報系</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('教育')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">教育</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ニュース')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ニュース</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('書籍／参考書')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">書籍／参考書</p>
      </div>
    </div>
  );
}

function Frame5({ onItemClick }: { onItemClick: (item: string) => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative min-w-0">
      <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[8px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px]">その他</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ナビゲーション')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ナビゲーション</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('旅行')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">旅行</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('天気')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">天気</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('医療')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">医療</p>
      </div>
    </div>
  );
}

export function CategoryDropdown({ onItemClick }: { onItemClick: (item: string) => void }) {
  return (
    <div className="bg-white content-stretch grid grid-cols-2 md:flex md:flex-row gap-[24px] md:gap-[36px] items-start p-[20px] relative rounded-[6px]">
      <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Frame onItemClick={onItemClick} />
      <Frame1 onItemClick={onItemClick} />
      <Frame2 onItemClick={onItemClick} />
      <Frame3 onItemClick={onItemClick} />
      <Frame4 onItemClick={onItemClick} />
      <Frame5 onItemClick={onItemClick} />
    </div>
  );
}
