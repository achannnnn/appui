/** App Store genre / search helpers for admin autofill */

export type AppStoreSearchResult = {
  trackId: number;
  trackName: string;
  description: string;
  artworkUrl512: string;
  trackViewUrl: string;
  primaryGenreName: string;
  sellerName: string;
};

const GENRE_TO_CATEGORY: Record<string, string> = {
  'ソーシャルネットワーキング': 'ソーシャル ネットワーキング',
  'Social Networking': 'ソーシャル ネットワーキング',
  'ユーティリティ': '仕事効率化',
  Utilities: '仕事効率化',
  '仕事効率化': '仕事効率化',
  Productivity: '仕事効率化',
  '写真／ビデオ': '写真・ビデオ',
  '写真/ビデオ': '写真・ビデオ',
  'Photo & Video': '写真・ビデオ',
  ニュース: 'ニュース',
  News: 'ニュース',
  ショッピング: 'ショッピング',
  Shopping: 'ショッピング',
  'フード／ドリンク': 'フード・ドリンク',
  'フード/ドリンク': 'フード・ドリンク',
  'Food & Drink': 'フード・ドリンク',
  'ヘルスケア／フィットネス': '健康・フィットネス',
  'ヘルスケア/フィットネス': '健康・フィットネス',
  'Health & Fitness': '健康・フィットネス',
  ファイナンス: '金融',
  Finance: '金融',
  旅行: '旅行',
  Travel: '旅行',
  ゲーム: 'ゲーム',
  Games: 'ゲーム',
  教育: '教育',
  Education: '教育',
  エンターテインメント: 'エンターテインメント',
  Entertainment: 'エンターテインメント',
  ライフスタイル: 'ライフスタイル',
  Lifestyle: 'ライフスタイル',
  ナビゲーション: 'ナビゲーション',
  Navigation: 'ナビゲーション',
  スポーツ: 'スポーツ',
  Sports: 'スポーツ',
  ミュージック: 'エンターテインメント',
  Music: 'エンターテインメント',
  ブック: '教育',
  Books: '教育',
  ビジネス: '仕事効率化',
  Business: '仕事効率化',
  メディカル: '健康・フィットネス',
  Medical: '健康・フィットネス',
  天気: 'ライフスタイル',
  Weather: 'ライフスタイル',
};

export function mapGenreToCategory(genre: string): string {
  const trimmed = genre.trim();
  if (!trimmed) return trimmed;
  return GENRE_TO_CATEGORY[trimmed] ?? trimmed;
}

export function truncateDescription(text: string, maxLength = 120): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}…`;
}
