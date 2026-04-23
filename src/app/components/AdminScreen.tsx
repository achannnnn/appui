import { useState } from 'react';
import { Plus, Trash2, Copy, Check, ChevronDown, ChevronUp, Download } from 'lucide-react';
import type { AppData } from '../../types/app';

type SectionDraft = {
  id: string;
  title: string;
  images: ImageDraft[];
  collapsed: boolean;
};

type ImageDraft = {
  id: string;
  src: string;
  filename: string;
};

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

const DEFAULT_CATEGORY_OPTIONS = [
  'ソーシャル ネットワーキング', 'メッセージング', '写真・ビデオ',
  'ニュース', 'ショッピング', 'フード・ドリンク', '健康・フィットネス',
  '金融', '旅行', 'ゲーム', '仕事効率化', '教育', 'エンターテインメント',
  'ライフスタイル', 'ナビゲーション',
];

const DEFAULT_COMPONENT_OPTIONS = [
  'ボトム ナビゲーション', 'タブ・セグメントコントロール', 'カード',
  'リスト', 'モーダル・ボトムシート', 'オンボーディング', 'フォーム',
  'ボタン', '検索', 'フィルター', 'ヘッダー', 'プロフィール',
  'ダッシュボード', 'カルーセル', 'マップ',
];

const menuItems = ['アプリ一覧', '新規登録', 'カテゴリ管理', 'コンポーネント管理', '設定'];

export function AdminScreen({ onBack }: { onBack: () => void }) {
  // ── Basic info ──
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [components, setComponents] = useState<string[]>([]);

  // ── Sections ──
  const [sections, setSections] = useState<SectionDraft[]>([
    { id: uid(), title: '', images: [], collapsed: false },
  ]);

  const [copied, setCopied] = useState(false);
  const [activeMenu, setActiveMenu] = useState('新規登録');
  const [categoryOptions, setCategoryOptions] = useState<string[]>(DEFAULT_CATEGORY_OPTIONS);
  const [componentOptions, setComponentOptions] = useState<string[]>(DEFAULT_COMPONENT_OPTIONS);
  const [newCategory, setNewCategory] = useState('');
  const [newComponent, setNewComponent] = useState('');

  // ── Tag toggles ──
  const toggleTag = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  // ── Section operations ──
  const addSection = () => {
    setSections(prev => [...prev, { id: uid(), title: '', images: [], collapsed: false }]);
  };
  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };
  const updateSectionTitle = (id: string, title: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  };
  const toggleCollapse = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, collapsed: !s.collapsed } : s));
  };

  // ── Image operations ──
  const addImage = (sectionId: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, images: [...s.images, { id: uid(), src: '', filename: '' }] } : s
    ));
  };
  const removeImage = (sectionId: string, imageId: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, images: s.images.filter(img => img.id !== imageId) } : s
    ));
  };
  const updateImageSrc = (sectionId: string, imageId: string, src: string) => {
    const autoFilename = src.split('/').pop() ?? '';
    setSections(prev => prev.map(s =>
      s.id === sectionId ? {
        ...s,
        images: s.images.map(img =>
          img.id === imageId ? { ...img, src, filename: img.filename || autoFilename } : img
        ),
      } : s
    ));
  };
  const updateImageFilename = (sectionId: string, imageId: string, filename: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, images: s.images.map(img => img.id === imageId ? { ...img, filename } : img) }
        : s
    ));
  };

  // ── JSON generation ──
  const buildAppData = (): AppData => ({
    id: `${appName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'app'}-${Date.now()}`,
    name: appName,
    description: appDescription,
    iconUrl,
    externalUrl,
    categories,
    components,
    sections: sections.map(s => ({
      id: s.id,
      title: s.title,
      images: s.images.map(img => ({ id: img.id, src: img.src, filename: img.filename })),
    })),
  });

  const jsonOutput = JSON.stringify(buildAppData(), null, 2);
  const totalImages = sections.reduce((n, s) => n + s.images.length, 0);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard API unavailable
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName.trim() || 'new-app'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const addCategory = () => {
    const value = newCategory.trim();
    if (!value || categoryOptions.includes(value)) {
      return;
    }
    setCategoryOptions(prev => [...prev, value]);
    setNewCategory('');
  };

  const removeCategoryOption = (value: string) => {
    setCategoryOptions(prev => prev.filter(item => item !== value));
    setCategories(prev => prev.filter(item => item !== value));
  };

  const addComponent = () => {
    const value = newComponent.trim();
    if (!value || componentOptions.includes(value)) {
      return;
    }
    setComponentOptions(prev => [...prev, value]);
    setNewComponent('');
  };

  const removeComponentOption = (value: string) => {
    setComponentOptions(prev => prev.filter(item => item !== value));
    setComponents(prev => prev.filter(item => item !== value));
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* ── Header ── */}
      <div className="bg-[#333] text-white px-6 py-4 min-h-16 shrink-0">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <button onClick={onBack} type="button"
            className="text-[14px] font-['Noto_Sans_JP:Medium',sans-serif] text-white/90 hover:text-white transition-colors">
            ← 一覧に戻る
          </button>
          <h1 className="font-['Noto_Sans_JP:Bold',sans-serif] text-[20px] md:text-[24px] font-bold leading-tight">
            アプリUI図鑑 - 管理画面
          </h1>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-60 shrink-0 bg-[#f7f7f7] border-r border-[#e1e1e1] overflow-y-auto">
          <nav className="flex flex-col">
            {menuItems.map(item => (
              <button key={item} type="button" onClick={() => setActiveMenu(item)}
                className={`px-6 py-4 text-left text-[14px] font-['Noto_Sans_JP:Medium',sans-serif] transition-colors border-b border-[#e1e1e1] ${
                  activeMenu === item ? 'bg-[#333] text-white' : 'text-[#333] hover:bg-[#efefef]'
                }`}>
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Content: form + JSON panel */}
        <div className={`flex-1 flex flex-col ${activeMenu === '新規登録' ? 'lg:flex-row' : ''} overflow-hidden`}>

          {/* ─── Form Panel ─── */}
          <div className="flex-1 overflow-auto p-6 md:p-10">
            <div className={`${activeMenu === '新規登録' ? 'max-w-2xl' : 'max-w-4xl'} space-y-6`}>
              {activeMenu === '新規登録' && (
                <>
              <h2 className="text-[28px] md:text-[32px] font-['Noto_Sans_JP:Bold',sans-serif] font-bold text-[#333]">
                新規アプリを登録
              </h2>

              {/* 基本情報 */}
              <section className="bg-[#f8f8f8] border border-[#e1e1e1] rounded-lg p-6 space-y-4">
                <h3 className="text-[16px] font-['Noto_Sans_JP:Bold',sans-serif] font-bold text-[#333]">基本情報</h3>

                <div>
                  <label className="block text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] text-[#737373] mb-2">アプリ名 *</label>
                  <input type="text" value={appName} onChange={e => setAppName(e.target.value)}
                    placeholder="例: Instagram"
                    className="w-full px-4 py-3 border border-[#e1e1e1] rounded-md text-[14px] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#333]" />
                </div>

                <div>
                  <label className="block text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] text-[#737373] mb-2">アプリ説明</label>
                  <textarea value={appDescription} onChange={e => setAppDescription(e.target.value)}
                    placeholder="アプリの概要を入力" rows={3}
                    className="w-full px-4 py-3 border border-[#e1e1e1] rounded-md text-[14px] resize-none placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#333]" />
                </div>

                <div>
                  <label className="block text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] text-[#737373] mb-2">アイコン画像URL</label>
                  <input type="url" value={iconUrl} onChange={e => setIconUrl(e.target.value)}
                    placeholder="https://yourdomain.com/appui-images/app-001/icon.webp"
                    className="w-full px-4 py-3 border border-[#e1e1e1] rounded-md text-[14px] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#333]" />
                  {iconUrl && (
                    <img src={iconUrl} alt="アイコンプレビュー"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      className="mt-2 w-12 h-12 rounded-xl object-cover border border-[#e1e1e1]" />
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] text-[#737373] mb-2">外部リンクURL（App Store / Google Play など）</label>
                  <input type="url" value={externalUrl} onChange={e => setExternalUrl(e.target.value)}
                    placeholder="https://apps.apple.com/..."
                    className="w-full px-4 py-3 border border-[#e1e1e1] rounded-md text-[14px] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#333]" />
                </div>
              </section>

              {/* 分類 */}
              <section className="bg-[#f8f8f8] border border-[#e1e1e1] rounded-lg p-6 space-y-5">
                <h3 className="text-[16px] font-['Noto_Sans_JP:Bold',sans-serif] font-bold text-[#333]">分類</h3>

                <div>
                  <label className="block text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] text-[#737373] mb-3">カテゴリ（複数選択可）</label>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map(cat => (
                      <button key={cat} type="button" onClick={() => toggleTag(categories, setCategories, cat)}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] border transition-colors ${
                          categories.includes(cat) ? 'bg-[#333] text-white border-[#333]' : 'bg-white text-[#333] border-[#ccc] hover:border-[#333]'
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] text-[#737373] mb-3">コンポーネント（複数選択可）</label>
                  <div className="flex flex-wrap gap-2">
                    {componentOptions.map(comp => (
                      <button key={comp} type="button" onClick={() => toggleTag(components, setComponents, comp)}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] border transition-colors ${
                          components.includes(comp) ? 'bg-[#333] text-white border-[#333]' : 'bg-white text-[#333] border-[#ccc] hover:border-[#333]'
                        }`}>
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* スクリーンショット */}
              <section className="bg-[#f8f8f8] border border-[#e1e1e1] rounded-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-[16px] font-['Noto_Sans_JP:Bold',sans-serif] font-bold text-[#333]">スクリーンショット</h3>
                    <p className="text-[12px] text-[#737373] mt-0.5">計 {totalImages} 枚 / 推奨 15 枚以内</p>
                  </div>
                  <button type="button" onClick={addSection}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#333] text-white text-[12px] rounded-md hover:bg-[#1a1a1a] transition-colors">
                    <Plus size={14} />
                    セクション追加
                  </button>
                </div>

                <div className="space-y-4">
                  {sections.map((section, idx) => (
                    <div key={section.id} className="border border-[#e1e1e1] rounded-lg bg-white overflow-hidden">
                      {/* Section header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-[#f3f3f3] border-b border-[#e1e1e1]">
                        <span className="shrink-0 text-[11px] text-[#999]">#{idx + 1}</span>
                        <input type="text" value={section.title}
                          onChange={e => updateSectionTitle(section.id, e.target.value)}
                          placeholder="セクション名（例: オンボーディング）"
                          className="flex-1 bg-transparent text-[14px] font-['Noto_Sans_JP:Medium',sans-serif] text-[#333] outline-none border-b border-transparent focus:border-[#333] placeholder:text-[#aaa]" />
                        <span className="shrink-0 text-[11px] text-[#999]">{section.images.length}枚</span>
                        <button type="button" onClick={() => toggleCollapse(section.id)} className="text-[#737373] hover:text-[#333] transition-colors">
                          {section.collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </button>
                        <button type="button" onClick={() => removeSection(section.id)} className="text-[#cc3333] hover:text-[#991111] transition-colors ml-1">
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Section body */}
                      {!section.collapsed && (
                        <div className="p-4 space-y-3">
                          {section.images.map((img, imgIdx) => (
                            <div key={img.id} className="flex gap-3 items-start">
                              {/* thumbnail */}
                              <div className="shrink-0 w-9 h-16 rounded-lg overflow-hidden bg-[#f0f0f0] border border-[#e1e1e1] flex items-center justify-center text-[#ccc] text-[10px]">
                                {img.src
                                  ? <img src={img.src} alt="" className="w-full h-full object-cover"
                                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  : imgIdx + 1}
                              </div>
                              {/* inputs */}
                              <div className="flex-1 space-y-1.5 min-w-0">
                                <input type="url" value={img.src}
                                  onChange={e => updateImageSrc(section.id, img.id, e.target.value)}
                                  placeholder="画像URL (例: https://yourdomain.com/appui-images/app-001/01.webp)"
                                  className="w-full px-3 py-2 border border-[#e1e1e1] rounded-md text-[12px] placeholder:text-[#bbb] focus:outline-none focus:ring-1 focus:ring-[#333]" />
                                <input type="text" value={img.filename}
                                  onChange={e => updateImageFilename(section.id, img.id, e.target.value)}
                                  placeholder="ファイル名（DL時に使用 例: app-001-01.webp）"
                                  className="w-full px-3 py-2 border border-[#e1e1e1] rounded-md text-[12px] placeholder:text-[#bbb] focus:outline-none focus:ring-1 focus:ring-[#333]" />
                              </div>
                              <button type="button" onClick={() => removeImage(section.id, img.id)}
                                className="shrink-0 mt-2 text-[#cc3333] hover:text-[#991111] transition-colors">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addImage(section.id)}
                            className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-[#ccc] rounded-md text-[12px] text-[#737373] hover:border-[#333] hover:text-[#333] transition-colors">
                            <Plus size={13} />
                            画像を追加
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
                </>
              )}

              {activeMenu === 'カテゴリ管理' && (
                <>
                  <h2 className="text-[28px] md:text-[32px] font-['Noto_Sans_JP:Bold',sans-serif] font-bold text-[#333]">
                    カテゴリ管理
                  </h2>
                  <section className="bg-[#f8f8f8] border border-[#e1e1e1] rounded-lg p-6 space-y-4">
                    <p className="text-[13px] text-[#666]">新しいカテゴリを追加し、既存カテゴリを整理できます。</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        placeholder="新しいカテゴリ名"
                        className="flex-1 px-4 py-3 border border-[#e1e1e1] rounded-md text-[14px] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#333]"
                      />
                      <button
                        type="button"
                        onClick={addCategory}
                        className="px-4 py-3 bg-[#333] text-white text-[13px] rounded-md hover:bg-[#1a1a1a] transition-colors"
                      >
                        追加
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map(category => (
                        <div key={category} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#ddd]">
                          <span className="text-[12px] text-[#333]">{category}</span>
                          <button
                            type="button"
                            onClick={() => removeCategoryOption(category)}
                            className="text-[#cc3333] hover:text-[#991111] transition-colors"
                            aria-label={`${category} を削除`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {activeMenu === 'コンポーネント管理' && (
                <>
                  <h2 className="text-[28px] md:text-[32px] font-['Noto_Sans_JP:Bold',sans-serif] font-bold text-[#333]">
                    コンポーネント管理
                  </h2>
                  <section className="bg-[#f8f8f8] border border-[#e1e1e1] rounded-lg p-6 space-y-4">
                    <p className="text-[13px] text-[#666]">新しいコンポーネント名を追加し、既存項目を整理できます。</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComponent}
                        onChange={e => setNewComponent(e.target.value)}
                        placeholder="新しいコンポーネント名"
                        className="flex-1 px-4 py-3 border border-[#e1e1e1] rounded-md text-[14px] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#333]"
                      />
                      <button
                        type="button"
                        onClick={addComponent}
                        className="px-4 py-3 bg-[#333] text-white text-[13px] rounded-md hover:bg-[#1a1a1a] transition-colors"
                      >
                        追加
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {componentOptions.map(component => (
                        <div key={component} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#ddd]">
                          <span className="text-[12px] text-[#333]">{component}</span>
                          <button
                            type="button"
                            onClick={() => removeComponentOption(component)}
                            className="text-[#cc3333] hover:text-[#991111] transition-colors"
                            aria-label={`${component} を削除`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {activeMenu === 'アプリ一覧' && (
                <>
                  <h2 className="text-[28px] md:text-[32px] font-['Noto_Sans_JP:Bold',sans-serif] font-bold text-[#333]">
                    アプリ一覧
                  </h2>
                  <section className="bg-[#f8f8f8] border border-[#e1e1e1] rounded-lg p-6 space-y-3">
                    <p className="text-[14px] text-[#444]">現在編集中の下書き情報です。</p>
                    <div className="text-[13px] text-[#666] space-y-1">
                      <p>アプリ名: {appName || '未入力'}</p>
                      <p>カテゴリ: {categories.length} 件</p>
                      <p>コンポーネント: {components.length} 件</p>
                      <p>スクリーンショット: {totalImages} 枚</p>
                    </div>
                  </section>
                </>
              )}

              {activeMenu === '設定' && (
                <>
                  <h2 className="text-[28px] md:text-[32px] font-['Noto_Sans_JP:Bold',sans-serif] font-bold text-[#333]">
                    設定
                  </h2>
                  <section className="bg-[#f8f8f8] border border-[#e1e1e1] rounded-lg p-6 space-y-3">
                    <p className="text-[14px] text-[#444]">登録フローの運用メモ</p>
                    <ul className="list-disc pl-5 text-[13px] text-[#666] space-y-1">
                      <li>画像は同一ルールのファイル名で配置してください。</li>
                      <li>新規登録後、生成JSONを apps.json に追記します。</li>
                      <li>公開前にURLリンク切れを確認してください。</li>
                    </ul>
                  </section>
                </>
              )}
            </div>
          </div>

          {/* ─── JSON Panel ─── */}
          {activeMenu === '新規登録' && (
          <div className="w-full lg:w-[400px] xl:w-[460px] shrink-0 flex flex-col bg-[#1e1e1e] border-t lg:border-t-0 lg:border-l border-[#333]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e2e2e]">
              <h3 className="text-[13px] font-['Noto_Sans_JP:Bold',sans-serif] text-white">生成JSONエントリ</h3>
              <div className="flex gap-2">
                <button type="button" onClick={handleDownload}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] text-white border border-[#444] hover:bg-[#333] transition-colors">
                  <Download size={11} />
                  DL
                </button>
                <button type="button" onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] text-white border border-[#444] hover:bg-[#333] transition-colors">
                  {copied
                    ? <><Check size={11} className="text-green-400" /> コピー済</>
                    : <><Copy size={11} /> コピー</>}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-[11px] leading-relaxed text-[#9cdcfe] font-mono whitespace-pre-wrap break-all">
                {jsonOutput}
              </pre>
            </div>
            <div className="px-5 py-4 border-t border-[#2e2e2e]">
              <p className="text-[11px] text-[#888] leading-relaxed">
                このJSONをコピーして <span className="text-[#9cdcfe]">apps.json</span> の配列末尾に追記し、GitHubにプッシュするとVercelが自動デプロイします。
              </p>
            </div>
          </div>
          )}

        </div>
      </div>
    </div>
  );
}
