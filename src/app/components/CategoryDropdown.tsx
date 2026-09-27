function Dot({ size = 5 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} fill="var(--fill-0, #333333)" r={size / 2} />
      </svg>
    </div>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
      <Dot size={8} />
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px]">
        {children}
      </p>
    </div>
  );
}

function CategoryItem({
  label,
  value,
  onItemClick,
}: {
  label: React.ReactNode;
  value: string;
  onItemClick: (item: string) => void;
}) {
  return (
    <div
      className="content-stretch flex gap-[10px] items-center relative min-w-0 cursor-pointer hover:opacity-70"
      onClick={() => onItemClick(value)}
    >
      <Dot />
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#333] text-[12px] tracking-[0.528px]">
        {label}
      </p>
    </div>
  );
}

function Column({
  title,
  items,
  onItemClick,
}: {
  title: string;
  items: { value: string; label?: React.ReactNode }[];
  onItemClick: (item: string) => void;
}) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative min-w-0">
      <GroupTitle>{title}</GroupTitle>
      {items.map((item) => (
        <CategoryItem
          key={item.value}
          value={item.value}
          label={item.label ?? item.value}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}

/** Categories currently used by at least one app in apps.json */
const CATEGORY_GROUPS: { title: string; items: { value: string; label?: React.ReactNode }[] }[] = [
  {
    title: 'ライフスタイル系',
    items: [
      { value: 'ライフスタイル' },
      { value: '健康・フィットネス' },
      { value: 'フード・ドリンク' },
      { value: 'ショッピング' },
    ],
  },
  {
    title: 'エンタメ系',
    items: [
      { value: 'エンターテインメント' },
      { value: '写真・ビデオ' },
      { value: 'スポーツ' },
    ],
  },
  {
    title: 'ビジネス・実用系',
    items: [
      { value: '仕事効率化' },
      { value: '金融' },
      { value: 'バイト' },
    ],
  },
  {
    title: 'コミュニケーション系',
    items: [
      {
        value: 'ソーシャルネットワーキング',
        label: (
          <>
            ソーシャル
            <br />
            ネットワーキング
          </>
        ),
      },
    ],
  },
  {
    title: '学習・情報系',
    items: [{ value: '教育' }, { value: 'ニュース' }],
  },
  {
    title: 'その他',
    items: [{ value: 'ナビゲーション' }, { value: '旅行' }],
  },
];

export function CategoryDropdown({ onItemClick }: { onItemClick: (item: string) => void }) {
  return (
    <div className="bg-white content-stretch grid grid-cols-2 md:flex md:flex-row gap-[24px] md:gap-[36px] items-start p-[20px] relative rounded-[6px]">
      <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[6px]" />
      {CATEGORY_GROUPS.map((group) => (
        <Column key={group.title} title={group.title} items={group.items} onItemClick={onItemClick} />
      ))}
    </div>
  );
}
