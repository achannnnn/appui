function Frame({ onItemClick }: { onItemClick: (item: string) => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative min-w-0">
      <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[8px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <circle cx="4" cy="4" fill="var(--fill-0, #333333)" id="Ellipse 2" r="4" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px]">選択と入力</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('テキストフィールド')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">テキストフィールド</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ボタン')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ボタン</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ラジオボタン')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ラジオボタン</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('チェックボックス')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">チェックボックス</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('スイッチ・トグル')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">スイッチ・トグル</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('スライダー')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">スライダー</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ステッパー')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ステッパー</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('レーディング')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">レーディング</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('カラーピッカー')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">カラーピッカー</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('日付・時間選択')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">日付・時間選択</p>
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
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px]">ナビゲーション</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ボトムナビゲーション')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ボトム<br />ナビゲーション</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('タブ・セグメントコントロール')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">タブ・<br />セグメントコントロール</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('検索フィールド')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">検索フィールド</p>
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
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px]">オーバーレイ</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('シート')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">シート</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('アクションシート')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">アクションシート</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ドロップダウン')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ドロップダウン</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ドロワー')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ドロワー</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('トースト・スナックバー')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">トースト・スナックバー</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('フロートボタン')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">じフロートボタン</p>
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
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px]">レイアウト</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('テーブル')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">テーブル</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('リスト')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">リスト</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('アコーディオン')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">アコーディオン</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('カード')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">カード</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('カルーセル')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">カルーセル</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('マップ')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">マップ</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('グラフ')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">グラフ</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('バナー')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">バナー</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('アラート')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">アラート</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('ツールバー')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">ツールバー</p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70" onClick={() => onItemClick('タグ・ラベル')}>
        <div className="relative shrink-0 size-[5px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" fill="var(--fill-0, #333333)" id="Ellipse 2" r="2.5" />
          </svg>
        </div>
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">タグ・ラベル</p>
      </div>
    </div>
  );
}

export function ComponentDropdown({ onItemClick }: { onItemClick: (item: string) => void }) {
  return (
    <div className="bg-white content-stretch grid grid-cols-2 md:flex md:flex-row gap-[24px] md:gap-[36px] items-start p-[20px] relative rounded-[6px] overflow-x-hidden">
      <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Frame onItemClick={onItemClick} />
      <Frame1 onItemClick={onItemClick} />
      <Frame2 onItemClick={onItemClick} />
      <Frame3 onItemClick={onItemClick} />
    </div>
  );
}
