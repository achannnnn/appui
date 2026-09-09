import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Copy, Check, ChevronDown, ChevronUp, Download, Upload, GripVertical, Search, RefreshCw } from 'lucide-react';
import type { AppData } from '../../types/app';
import { mapGenreToCategory, truncateDescription, type AppStoreSearchResult } from '../lib/appStore';

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
  components: string[];
};

type InboxFile = {
  name: string;
  folder?: string;
  size: number;
  mtimeMs: number;
  previewUrl: string;
};

type InboxFolder = {
  name: string;
  label: string;
  fileCount: number;
};

type DragPayload = {
  type: 'section' | 'image';
  sectionId?: string;
  imageId?: string;
};

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

const DEFAULT_CATEGORY_OPTIONS = [
  'ソーシャル ネットワーキング', 'メッセージング', '写真・ビデオ',
  'ニュース', 'ショッピング', 'フード・ドリンク', '健康・フィットネス',
  '金融', '旅行', 'ゲーム', '仕事効率化', '教育', 'エンターテインメント',
  'ライフスタイル', 'ナビゲーション', 'バイト',
];

const DEFAULT_COMPONENT_OPTIONS = [
  'ボトム ナビゲーション', 'タブ・セグメントコントロール', 'カード',
  'リスト', 'モーダル・ボトムシート', 'オンボーディング', 'フォーム',
  'ボタン', '検索', 'フィルター', 'ヘッダー', 'プロフィール',
  'ダッシュボード', 'カルーセル', 'マップ',
];

const CUSTOM_CATEGORY_OPTIONS_STORAGE_KEY = 'appui-custom-category-options';
const CUSTOM_COMPONENT_OPTIONS_STORAGE_KEY = 'appui-custom-component-options';

function mergeOptionLists(...lists: string[][]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  lists.forEach((list) => {
    list.forEach((item) => {
      const value = item.trim();
      if (!value || seen.has(value)) {
        return;
      }
      seen.add(value);
      merged.push(value);
    });
  });

  return merged;
}

function readStoredOptions(storageKey: string): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function writeStoredOptions(storageKey: string, options: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(options));
}

function collectCategoriesFromApps(apps: AppData[]): string[] {
  return mergeOptionLists(...apps.map((app) => app.categories));
}

function collectComponentsFromApps(apps: AppData[]): string[] {
  return mergeOptionLists(
    ...apps.flatMap((app) => [
      app.components,
      ...app.sections.map((section) => mergeOptionLists(...section.images.map((image) => image.components ?? []))),
    ])
  );
}

const menuItems = ['アプリ一覧', '新規登録', 'カテゴリ管理', 'コンポーネント管理', '設定'];

function createEmptySectionDraft(): SectionDraft {
  return { id: uid(), title: '', images: [], collapsed: false };
}

function createEmptySections(): SectionDraft[] {
  return [createEmptySectionDraft()];
}

function reorderItems<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length || fromIndex === toIndex) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function mapAppToSections(app: AppData): SectionDraft[] {
  if (app.sections.length === 0) {
    return createEmptySections();
  }

  return app.sections.map((section) => ({
    id: section.id,
    title: section.title,
    collapsed: false,
    images: section.images.map((image) => ({
      id: image.id,
      src: image.src,
      filename: image.filename,
      components: image.components ? [...image.components] : [],
    })),
  }));
}

export function AdminScreen({ onBack, onRegistered, apps }: { onBack: () => void; onRegistered: () => void; apps: AppData[] }) {
  const appCategoryOptions = useMemo(() => collectCategoriesFromApps(apps), [apps]);
  const appComponentOptions = useMemo(() => collectComponentsFromApps(apps), [apps]);

  // ── Basic info ──
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [components, setComponents] = useState<string[]>([]);

  // ── Sections ──
  const [sections, setSections] = useState<SectionDraft[]>(createEmptySections);

  const [copied, setCopied] = useState(false);
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState('新規登録');
  const [categoryOptions, setCategoryOptions] = useState<string[]>(() => mergeOptionLists(
    DEFAULT_CATEGORY_OPTIONS,
    appCategoryOptions,
    readStoredOptions(CUSTOM_CATEGORY_OPTIONS_STORAGE_KEY),
  ));
  const [componentOptions, setComponentOptions] = useState<string[]>(() => mergeOptionLists(
    DEFAULT_COMPONENT_OPTIONS,
    appComponentOptions,
    readStoredOptions(CUSTOM_COMPONENT_OPTIONS_STORAGE_KEY),
  ));
  const [newCategory, setNewCategory] = useState('');
  const [newComponent, setNewComponent] = useState('');
  const [uploadEndpoint, setUploadEndpoint] = useState('/api/admin/upload');
  const [uploadFieldName, setUploadFieldName] = useState('file');
  const [uploadResponsePath, setUploadResponsePath] = useState('url');
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [savingApp, setSavingApp] = useState(false);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [draggingImageKey, setDraggingImageKey] = useState<string | null>(null);
  const [dragOverImageKey, setDragOverImageKey] = useState<string | null>(null);

  const [appStoreQuery, setAppStoreQuery] = useState('');
  const [appStoreResults, setAppStoreResults] = useState<AppStoreSearchResult[]>([]);
  const [appStoreSearching, setAppStoreSearching] = useState(false);
  const [appStoreError, setAppStoreError] = useState('');

  const [inboxFiles, setInboxFiles] = useState<InboxFile[]>([]);
  const [inboxFolders, setInboxFolders] = useState<InboxFolder[]>([]);
  const [selectedInboxFolder, setSelectedInboxFolder] = useState('');
  const [selectedInboxNames, setSelectedInboxNames] = useState<string[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxImporting, setInboxImporting] = useState(false);
  const [inboxError, setInboxError] = useState('');
  const [inboxMessage, setInboxMessage] = useState('');
  const [deleteInboxAfterImport, setDeleteInboxAfterImport] = useState(false);
  const [inboxTargetMode, setInboxTargetMode] = useState<'current' | 'new'>('current');
  const [activeSectionIdForInbox, setActiveSectionIdForInbox] = useState<string>('');
  const [newInboxFolderName, setNewInboxFolderName] = useState('');

  const resetForm = () => {
    setEditingAppId(null);
    setAppName('');
    setAppDescription('');
    setIconUrl('');
    setExternalUrl('');
    setCategories([]);
    setComponents([]);
    setSections(createEmptySections());
    setUploadError('');
    setSaveMessage('');
    setSaveError('');
    setOpenPickerId(null);
    setDraggingSectionId(null);
    setDragOverSectionId(null);
    setDraggingImageKey(null);
    setDragOverImageKey(null);
    setAppStoreQuery('');
    setAppStoreResults([]);
    setAppStoreError('');
    setSelectedInboxNames([]);
    setSelectedInboxFolder('');
    setNewInboxFolderName('');
    setInboxError('');
    setInboxMessage('');
  };

  const loadAppForEditing = (app: AppData) => {
    setEditingAppId(app.id);
    setAppName(app.name);
    setAppDescription(app.description);
    setIconUrl(app.iconUrl);
    setExternalUrl(app.externalUrl);
    setCategories([...app.categories]);
    setComponents([...app.components]);
    setSections(mapAppToSections(app));
    setUploadError('');
    setSaveMessage('');
    setSaveError('');
    setOpenPickerId(null);
    setActiveMenu('新規登録');
  };

  useEffect(() => {
    if (activeMenu === '新規登録' && !editingAppId && !appName && !appDescription && !iconUrl && !externalUrl && categories.length === 0 && components.length === 0 && sections.length === 1 && sections[0]?.title === '' && sections[0]?.images.length === 0) {
      return;
    }
  }, [activeMenu, editingAppId, appName, appDescription, iconUrl, externalUrl, categories, components, sections]);

  useEffect(() => {
    const draftImageComponents = mergeOptionLists(
      ...sections.map((section) => mergeOptionLists(...section.images.map((image) => image.components)))
    );

    setCategoryOptions((prev) => mergeOptionLists(
      DEFAULT_CATEGORY_OPTIONS,
      appCategoryOptions,
      readStoredOptions(CUSTOM_CATEGORY_OPTIONS_STORAGE_KEY),
      prev,
      categories,
    ));

    setComponentOptions((prev) => mergeOptionLists(
      DEFAULT_COMPONENT_OPTIONS,
      appComponentOptions,
      readStoredOptions(CUSTOM_COMPONENT_OPTIONS_STORAGE_KEY),
      prev,
      components,
      draftImageComponents,
    ));
  }, [appCategoryOptions, appComponentOptions, categories, components, sections]);

  useEffect(() => {
    if (sections.length === 0) {
      setActiveSectionIdForInbox('');
      return;
    }
    if (!sections.some((section) => section.id === activeSectionIdForInbox)) {
      setActiveSectionIdForInbox(sections[0].id);
    }
  }, [sections, activeSectionIdForInbox]);

  useEffect(() => {
    if (activeMenu !== '新規登録') {
      return;
    }
    void refreshInbox();
  }, [activeMenu]);

  const ensureDefaultSectionTitle = (section: SectionDraft): SectionDraft => {
    if (section.title.trim() || section.images.length === 0) {
      return section;
    }
    return { ...section, title: 'スクリーンショット' };
  };

  const searchAppStore = async () => {
    const q = appStoreQuery.trim() || appName.trim();
    if (!q) {
      setAppStoreError('検索キーワードを入力してください。');
      return;
    }
    setAppStoreSearching(true);
    setAppStoreError('');
    try {
      const response = await fetch(`/api/admin/appstore/search?q=${encodeURIComponent(q)}&country=jp`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || '検索に失敗しました');
      }
      setAppStoreResults(Array.isArray(json.results) ? json.results : []);
      if (!json.results?.length) {
        setAppStoreError('該当するアプリが見つかりませんでした。');
      }
    } catch (error) {
      setAppStoreResults([]);
      setAppStoreError(error instanceof Error ? error.message : '検索に失敗しました');
    } finally {
      setAppStoreSearching(false);
    }
  };

  const applyAppStoreResult = (result: AppStoreSearchResult) => {
    setAppName(result.trackName || '');
    setAppDescription(truncateDescription(result.description || ''));
    setIconUrl(result.artworkUrl512 || '');
    setExternalUrl(result.trackViewUrl || '');
    const mapped = mapGenreToCategory(result.primaryGenreName || '');
    if (mapped) {
      setCategories((prev) => (prev.includes(mapped) ? prev : [...prev, mapped]));
      setCategoryOptions((prev) => mergeOptionLists(prev, [mapped]));
    }
    const suggestedFolder = (result.trackName || '')
      .normalize('NFKC')
      .replace(/[\/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (suggestedFolder) {
      setNewInboxFolderName(suggestedFolder);
      const matched = inboxFolders.find((folder) => folder.name === suggestedFolder || folder.label === result.trackName);
      if (matched) {
        setSelectedInboxFolder(matched.name);
        void refreshInbox(matched.name);
      }
    }
    setAppStoreError('');
    setSaveMessage('App Store の情報をフォームに反映しました。アプリ用フォルダ名も提案しています。');
  };

  const refreshInbox = async (folder = selectedInboxFolder) => {
    setInboxLoading(true);
    setInboxError('');
    try {
      const response = await fetch(`/api/admin/inbox?folder=${encodeURIComponent(folder)}`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'inbox の取得に失敗しました');
      }
      const folders: InboxFolder[] = Array.isArray(json.folders) ? json.folders : [];
      const files: InboxFile[] = Array.isArray(json.files) ? json.files : [];
      setInboxFolders(folders);
      setInboxFiles(files);
      setSelectedInboxFolder(folder);
      setSelectedInboxNames((prev) => prev.filter((name) => files.some((file) => file.name === name)));
    } catch (error) {
      setInboxError(error instanceof Error ? error.message : 'inbox の取得に失敗しました');
    } finally {
      setInboxLoading(false);
    }
  };

  const createInboxFolder = async () => {
    const name = newInboxFolderName.trim() || appName.trim();
    if (!name) {
      setInboxError('フォルダ名（またはアプリ名）を入力してください。');
      return;
    }
    setInboxError('');
    try {
      const response = await fetch('/api/admin/inbox/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'フォルダ作成に失敗しました');
      }
      const folder = String(json.folder || name);
      setNewInboxFolderName(folder);
      setInboxMessage(`フォルダ inbox/${folder}/ を用意しました。ここにスクショを入れてください。`);
      await refreshInbox(folder);
    } catch (error) {
      setInboxError(error instanceof Error ? error.message : 'フォルダ作成に失敗しました');
    }
  };

  const toggleInboxSelection = (name: string) => {
    setSelectedInboxNames((prev) => (
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    ));
  };

  const selectAllInbox = () => {
    setSelectedInboxNames(inboxFiles.map((file) => file.name));
  };

  const clearInboxSelection = () => {
    setSelectedInboxNames([]);
  };

  const importInboxImages = async () => {
    if (selectedInboxNames.length === 0) {
      setInboxError('取り込む画像を選択してください。');
      return;
    }

    setInboxImporting(true);
    setInboxError('');
    setInboxMessage('');

    try {
      const shouldCreateSection = inboxTargetMode === 'new' || sections.length === 0;
      const createdSection = shouldCreateSection
        ? { id: uid(), title: 'スクリーンショット', images: [] as ImageDraft[], collapsed: false }
        : null;
      const targetSectionId = createdSection?.id ?? activeSectionIdForInbox ?? sections[0]?.id;
      if (!targetSectionId) {
        throw new Error('追加先セクションがありません');
      }

      const appKey = (editingAppId || appName || 'uploads').trim() || 'uploads';
      const response = await fetch('/api/admin/inbox/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: appKey,
          folder: selectedInboxFolder,
          filenames: selectedInboxNames,
          deleteAfter: deleteInboxAfterImport,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || '取り込みに失敗しました');
      }

      const imported = Array.isArray(json.imported) ? json.imported : [];
      const nextImages: ImageDraft[] = imported.map((item: { url: string; filename: string; sourceName?: string }) => ({
        id: uid(),
        src: item.url,
        filename: item.filename || item.sourceName || 'image.webp',
        components: [],
      }));

      setSections((prev) => {
        const base = createdSection && !prev.some((section) => section.id === createdSection.id)
          ? [...prev, createdSection]
          : prev;
        return base.map((section) => {
          if (section.id !== targetSectionId) {
            return section;
          }
          return ensureDefaultSectionTitle({
            ...section,
            images: [...section.images, ...nextImages],
          });
        });
      });
      setActiveSectionIdForInbox(targetSectionId);
      setSelectedInboxNames([]);
      setInboxMessage(`${nextImages.length} 枚を取り込みました。`);
      await refreshInbox(selectedInboxFolder);
    } catch (error) {
      setInboxError(error instanceof Error ? error.message : '取り込みに失敗しました');
    } finally {
      setInboxImporting(false);
    }
  };

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
  const moveSection = (sourceSectionId: string, targetSectionId: string) => {
    if (sourceSectionId === targetSectionId) {
      return;
    }
    setSections((prev) => {
      const fromIndex = prev.findIndex((section) => section.id === sourceSectionId);
      const toIndex = prev.findIndex((section) => section.id === targetSectionId);
      return reorderItems(prev, fromIndex, toIndex);
    });
  };

  // ── Image operations ──
  const addImage = (sectionId: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, images: [...s.images, { id: uid(), src: '', filename: '', components: [] }] } : s
    ));
  };
  const removeImage = (sectionId: string, imageId: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, images: s.images.filter(img => img.id !== imageId) } : s
    ));
  };
  const moveImage = (sectionId: string, sourceImageId: string, targetImageId: string) => {
    if (sourceImageId === targetImageId) {
      return;
    }
    setSections((prev) => prev.map((section) => {
      if (section.id !== sectionId) {
        return section;
      }
      const fromIndex = section.images.findIndex((image) => image.id === sourceImageId);
      const toIndex = section.images.findIndex((image) => image.id === targetImageId);
      return {
        ...section,
        images: reorderItems(section.images, fromIndex, toIndex),
      };
    }));
  };

  const readDragPayload = (event: React.DragEvent<HTMLElement>): DragPayload | null => {
    const raw = event.dataTransfer.getData('application/x-appui-drag');
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as DragPayload;
    } catch {
      return null;
    }
  };

  const writeDragPayload = (event: React.DragEvent<HTMLElement>, payload: DragPayload) => {
    event.dataTransfer.setData('application/x-appui-drag', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
  };
  const imageRowKey = (sectionId: string, imageId: string) => `${sectionId}:${imageId}`;
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
  const pickByPath = (obj: unknown, path: string): unknown => {
    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  };
  const uploadImageFile = async (file: File): Promise<{ url: string; filename: string }> => {
    const endpoint = uploadEndpoint.trim() || '/api/admin/upload';
    const isLocalUpload = endpoint === '/api/admin/upload';

    if (isLocalUpload) {
      const dataUrl = await readImageAsDataUrl(file);
      const appKey = (editingAppId || appName || 'uploads').trim() || 'uploads';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: appKey,
          filename: file.name,
          mimeType: file.type,
          dataUrl,
        }),
      });
      if (!response.ok) {
        throw new Error(`upload failed: ${response.status}`);
      }
      const json = await response.json();
      const url = pickByPath(json, uploadResponsePath.trim() || 'url');
      if (typeof url !== 'string' || !url) {
        throw new Error('uploaded url not found in response');
      }
      return {
        url,
        filename: typeof json.filename === 'string' ? json.filename : file.name.replace(/\.[^.]+$/, '.webp'),
      };
    }

    const formData = new FormData();
    formData.append(uploadFieldName.trim() || 'file', file, file.name);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`upload failed: ${response.status}`);
    }

    const json = await response.json();
    const url = pickByPath(json, uploadResponsePath.trim() || 'url');
    if (typeof url !== 'string' || !url) {
      throw new Error('uploaded url not found in response');
    }
    return { url, filename: file.name };
  };
  const setImageFromFile = async (sectionId: string, imageId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    setUploadError('');

    try {
      setUploadingImageId(imageId);
      const uploaded = await uploadImageFile(file);
      setSections(prev => prev.map(s =>
        s.id === sectionId
          ? {
              ...s,
              images: s.images.map(img =>
                img.id === imageId ? { ...img, src: uploaded.url, filename: uploaded.filename || file.name } : img
              ),
            }
          : s
      ));
    } catch {
      setUploadError('アップロードに失敗したため、この画像はローカルデータとして保存しました。');
      const dataUrl = await readImageAsDataUrl(file);
      setSections(prev => prev.map(s =>
        s.id === sectionId
          ? {
              ...s,
              images: s.images.map(img =>
                img.id === imageId ? { ...img, src: dataUrl, filename: img.filename || file.name } : img
              ),
            }
          : s
      ));
    } finally {
      setUploadingImageId(null);
    }
  };
  const appendImagesFromFiles = async (sectionId: string, files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      return;
    }

    setUploadError('');
    setUploadingSectionId(sectionId);

    const nextImages: ImageDraft[] = [];

    try {
      for (const file of imageFiles) {
        try {
          const uploaded = await uploadImageFile(file);
          nextImages.push({
            id: uid(),
            src: uploaded.url,
            filename: uploaded.filename || file.name,
            components: [],
          });
        } catch {
          if (!uploadError) {
            setUploadError('一部の画像アップロードに失敗したため、ローカルデータとして保存しました。');
          }
          nextImages.push({
            id: uid(),
            src: await readImageAsDataUrl(file),
            filename: file.name,
            components: [],
          });
        }
      }

      setSections((prev) => prev.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        return ensureDefaultSectionTitle({
          ...section,
          images: [...section.images, ...nextImages],
        });
      }));
    } finally {
      setUploadingSectionId(null);
    }
  };
  const toggleImageComponent = (sectionId: string, imageId: string, comp: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? {
        ...s,
        images: s.images.map(img =>
          img.id === imageId
            ? { ...img, components: img.components.includes(comp) ? img.components.filter(c => c !== comp) : [...img.components, comp] }
            : img
        ),
      } : s
    ));
  };

  // ── JSON generation ──
  const buildAppData = (): AppData => ({
    id: editingAppId ?? `${appName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'app'}-${Date.now()}`,
    name: appName,
    description: appDescription,
    iconUrl,
    externalUrl,
    categories,
    components,
    sections: sections.map(s => ({
      id: s.id,
      title: s.title,
      images: s.images.map(img => ({ id: img.id, src: img.src, filename: img.filename, ...(img.components.length > 0 ? { components: img.components } : {}) })),
    })),
  });

  const jsonOutput = JSON.stringify(buildAppData(), null, 2);
  const totalImages = sections.reduce((n, s) => n + s.images.length, 0);

  const handleRegister = async () => {
    if (!appName.trim()) {
      setSaveError('アプリ名を入力してください。');
      setSaveMessage('');
      return;
    }

    setSavingApp(true);
    setSaveError('');
    setSaveMessage('');

    try {
      const response = await fetch('/api/admin/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonOutput,
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました。');
      }

      setSaveMessage(editingAppId ? 'apps.json の既存アプリを更新しました。' : 'apps.json に新規アプリを登録しました。');
      setTimeout(() => {
        onRegistered();
        setActiveMenu('アプリ一覧');
      }, 600);
    } catch {
      setSaveError('ローカル登録に失敗しました。開発サーバー上で実行しているか確認してください。');
    } finally {
      setSavingApp(false);
    }
  };

  const handleDelete = async (app: AppData) => {
    const confirmed = window.confirm(`「${app.name}」を削除します。元に戻せません。`);
    if (!confirmed) {
      return;
    }

    setDeletingAppId(app.id);
    setSaveMessage('');
    setSaveError('');

    try {
      const response = await fetch('/api/admin/apps', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: app.id }),
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました。');
      }

      if (editingAppId === app.id) {
        resetForm();
      }

      setSaveMessage(`「${app.name}」を削除しました。`);
      onRegistered();
    } catch {
      setSaveError('削除に失敗しました。開発サーバー上で実行しているか確認してください。');
    } finally {
      setDeletingAppId(null);
    }
  };

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
    const nextStoredOptions = mergeOptionLists(readStoredOptions(CUSTOM_CATEGORY_OPTIONS_STORAGE_KEY), [value]);
    writeStoredOptions(CUSTOM_CATEGORY_OPTIONS_STORAGE_KEY, nextStoredOptions);
    setCategoryOptions(prev => mergeOptionLists(prev, [value]));
    setNewCategory('');
  };

  const removeCategoryOption = (value: string) => {
    const nextStoredOptions = readStoredOptions(CUSTOM_CATEGORY_OPTIONS_STORAGE_KEY).filter(item => item !== value);
    writeStoredOptions(CUSTOM_CATEGORY_OPTIONS_STORAGE_KEY, nextStoredOptions);
    setCategoryOptions(prev => prev.filter(item => item !== value));
    setCategories(prev => prev.filter(item => item !== value));
  };

  const addComponent = () => {
    const value = newComponent.trim();
    if (!value || componentOptions.includes(value)) {
      return;
    }
    const nextStoredOptions = mergeOptionLists(readStoredOptions(CUSTOM_COMPONENT_OPTIONS_STORAGE_KEY), [value]);
    writeStoredOptions(CUSTOM_COMPONENT_OPTIONS_STORAGE_KEY, nextStoredOptions);
    setComponentOptions(prev => mergeOptionLists(prev, [value]));
    setNewComponent('');
  };

  const removeComponentOption = (value: string) => {
    const nextStoredOptions = readStoredOptions(CUSTOM_COMPONENT_OPTIONS_STORAGE_KEY).filter(item => item !== value);
    writeStoredOptions(CUSTOM_COMPONENT_OPTIONS_STORAGE_KEY, nextStoredOptions);
    setComponentOptions(prev => prev.filter(item => item !== value));
    setComponents(prev => prev.filter(item => item !== value));
    setSections(prev => prev.map(section => ({
      ...section,
      images: section.images.map(image => ({
        ...image,
        components: image.components.filter(item => item !== value),
      })),
    })));
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
              <button key={item} type="button" onClick={() => {
                if (item === '新規登録') {
                  resetForm();
                }
                setActiveMenu(item);
              }}
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
                {editingAppId ? 'アプリを編集' : '新規アプリを登録'}
              </h2>

              {editingAppId && (
                <section className="bg-[#eef4ff] border border-[#c7d7fe] rounded-lg p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-['Noto_Sans_JP:Bold',sans-serif] text-[#1d4ed8]">編集モード</p>
                    <p className="text-[12px] text-[#4b5563]">現在は既存アプリを更新します。新規登録に戻す場合はリセットしてください。</p>
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="shrink-0 px-3 py-2 border border-[#93c5fd] rounded-md text-[12px] text-[#1d4ed8] hover:bg-white transition-colors"
                  >
                    新規登録に戻す
                  </button>
                </section>
              )}

              {/* 基本情報 */}
              <section className="bg-[#f8f8f8] border border-[#e1e1e1] rounded-lg p-6 space-y-4">
                <h3 className="text-[16px] font-['Noto_Sans_JP:Bold',sans-serif] font-bold text-[#333]">基本情報</h3>

                <div className="rounded-md border border-[#dbeafe] bg-[#eff6ff] p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] text-[#1d4ed8]">App Store から自動入力</p>
                    <p className="text-[11px] text-[#64748b]">日本ストア検索</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={appStoreQuery}
                      onChange={(e) => setAppStoreQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void searchAppStore();
                        }
                      }}
                      placeholder={appName.trim() ? `例: ${appName}` : 'アプリ名で検索（例: TVer）'}
                      className="flex-1 px-3 py-2 border border-[#bfdbfe] rounded-md text-[13px] bg-white placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]"
                    />
                    <button
                      type="button"
                      onClick={() => void searchAppStore()}
                      disabled={appStoreSearching}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#2563eb] text-white text-[12px] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <Search size={13} />
                      {appStoreSearching ? '検索中...' : '検索'}
                    </button>
                  </div>
                  {appStoreError && <p className="text-[11px] text-[#b91c1c]">{appStoreError}</p>}
                  {appStoreResults.length > 0 && (
                    <div className="max-h-56 overflow-auto space-y-2">
                      {appStoreResults.map((result) => (
                        <button
                          key={result.trackId}
                          type="button"
                          onClick={() => applyAppStoreResult(result)}
                          className="w-full flex items-center gap-3 rounded-md border border-[#dbeafe] bg-white p-2 text-left hover:border-[#93c5fd] hover:bg-[#f8fbff] transition-colors"
                        >
                          {result.artworkUrl512
                            ? <img src={result.artworkUrl512} alt="" className="h-11 w-11 rounded-[10px] object-cover shrink-0 border border-[#e2e8f0]" />
                            : <div className="h-11 w-11 rounded-[10px] bg-[#e2e8f0] shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-['Noto_Sans_JP:Bold',sans-serif] text-[#0f172a] truncate">{result.trackName}</p>
                            <p className="text-[11px] text-[#64748b] truncate">{result.sellerName}{result.primaryGenreName ? ` / ${result.primaryGenreName}` : ''}</p>
                          </div>
                          <span className="shrink-0 text-[11px] text-[#2563eb]">使う</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

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

                <div className="mb-4 rounded-md border border-[#bbf7d0] bg-[#f0fdf4] p-3 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] text-[#166534]">inbox から取り込む</p>
                      <p className="text-[11px] text-[#4d7c0f]">
                        アプリごとにフォルダ分け推奨: <code className="px-1 rounded bg-white/80">inbox/TVer/</code> のように置くと迷いません
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void refreshInbox(selectedInboxFolder)}
                      disabled={inboxLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#86efac] bg-white text-[12px] text-[#166534] hover:bg-[#ecfdf5] disabled:opacity-60 transition-colors"
                    >
                      <RefreshCw size={12} className={inboxLoading ? 'animate-spin' : ''} />
                      更新
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedInboxFolder}
                      onChange={(e) => {
                        setSelectedInboxNames([]);
                        void refreshInbox(e.target.value);
                      }}
                      className="flex-1 px-3 py-2 border border-[#bbf7d0] rounded-md text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-[#86efac]"
                    >
                      {inboxFolders.map((folder) => (
                        <option key={folder.name || '__root'} value={folder.name}>
                          {folder.label}（{folder.fileCount}枚）
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={newInboxFolderName}
                        onChange={(e) => setNewInboxFolderName(e.target.value)}
                        placeholder="新規フォルダ名（例: TVer）"
                        className="flex-1 px-3 py-2 border border-[#bbf7d0] rounded-md text-[12px] bg-white placeholder:text-[#86a88a] focus:outline-none focus:ring-1 focus:ring-[#86efac]"
                      />
                      <button
                        type="button"
                        onClick={() => void createInboxFolder()}
                        className="shrink-0 px-3 py-2 rounded-md border border-[#86efac] bg-white text-[12px] text-[#166534] hover:bg-[#ecfdf5]"
                      >
                        作成
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#4d7c0f]">
                    いま見ている場所: <code className="px-1 rounded bg-white/80">{selectedInboxFolder ? `inbox/${selectedInboxFolder}/` : 'inbox/'}</code>
                  </p>

                  <div className="flex flex-wrap gap-3 text-[12px] text-[#3f6212]">
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="inbox-target"
                        checked={inboxTargetMode === 'current'}
                        onChange={() => setInboxTargetMode('current')}
                      />
                      既存セクションへ
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="inbox-target"
                        checked={inboxTargetMode === 'new'}
                        onChange={() => setInboxTargetMode('new')}
                      />
                      新規セクションを作成
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={deleteInboxAfterImport}
                        onChange={(e) => setDeleteInboxAfterImport(e.target.checked)}
                      />
                      取り込み後に inbox から削除
                    </label>
                  </div>

                  {inboxTargetMode === 'current' && sections.length > 0 && (
                    <select
                      value={activeSectionIdForInbox}
                      onChange={(e) => setActiveSectionIdForInbox(e.target.value)}
                      className="w-full px-3 py-2 border border-[#bbf7d0] rounded-md text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-[#86efac]"
                    >
                      {sections.map((section, index) => (
                        <option key={section.id} value={section.id}>
                          #{index + 1} {section.title.trim() || '（無題）'}（{section.images.length}枚）
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={selectAllInbox} className="px-2.5 py-1.5 rounded border border-[#bbf7d0] bg-white text-[11px] text-[#166534] hover:bg-[#ecfdf5]">
                      全選択
                    </button>
                    <button type="button" onClick={clearInboxSelection} className="px-2.5 py-1.5 rounded border border-[#bbf7d0] bg-white text-[11px] text-[#166534] hover:bg-[#ecfdf5]">
                      選択解除
                    </button>
                    <button
                      type="button"
                      onClick={() => void importInboxImages()}
                      disabled={inboxImporting || selectedInboxNames.length === 0}
                      className="px-3 py-1.5 rounded bg-[#166534] text-white text-[11px] hover:bg-[#14532d] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {inboxImporting ? '取り込み中...' : `選択を取り込み（${selectedInboxNames.length}）`}
                    </button>
                  </div>

                  {inboxError && <p className="text-[11px] text-[#b91c1c]">{inboxError}</p>}
                  {inboxMessage && <p className="text-[11px] text-[#166534]">{inboxMessage}</p>}

                  {inboxFiles.length === 0 ? (
                    <p className="text-[12px] text-[#4d7c0f]">
                      このフォルダは空です。Finder で画像を <code className="px-1 rounded bg-white/80">{selectedInboxFolder ? `inbox/${selectedInboxFolder}/` : 'inbox/'}</code> に入れて「更新」してください。
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-auto">
                      {inboxFiles.map((file) => {
                        const selected = selectedInboxNames.includes(file.name);
                        return (
                          <button
                            key={`${file.folder || 'root'}:${file.name}`}
                            type="button"
                            onClick={() => toggleInboxSelection(file.name)}
                            className={`relative rounded-md overflow-hidden border text-left ${selected ? 'border-[#166534] ring-2 ring-[#86efac]' : 'border-[#d1d5db]'}`}
                          >
                            <img src={file.previewUrl} alt={file.name} className="aspect-[9/16] w-full object-cover bg-[#e5e7eb]" />
                            <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-[9px] text-white truncate">{file.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mb-4 rounded-md border border-[#e1e1e1] bg-white p-3 space-y-2">
                  <p className="text-[12px] text-[#555] font-['Noto_Sans_JP:Medium',sans-serif]">画像アップロード設定</p>
                  <input
                    type="text"
                    value={uploadEndpoint}
                    onChange={e => setUploadEndpoint(e.target.value)}
                    placeholder="POST先URL（既定: /api/admin/upload）"
                    className="w-full px-3 py-2 border border-[#e1e1e1] rounded-md text-[12px] placeholder:text-[#bbb] focus:outline-none focus:ring-1 focus:ring-[#333]"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={uploadFieldName}
                      onChange={e => setUploadFieldName(e.target.value)}
                      placeholder="multipartフィールド名（外部API用）"
                      className="w-full px-3 py-2 border border-[#e1e1e1] rounded-md text-[12px] placeholder:text-[#bbb] focus:outline-none focus:ring-1 focus:ring-[#333]"
                    />
                    <input
                      type="text"
                      value={uploadResponsePath}
                      onChange={e => setUploadResponsePath(e.target.value)}
                      placeholder="レスポンスURLパス（例: url）"
                      className="w-full px-3 py-2 border border-[#e1e1e1] rounded-md text-[12px] placeholder:text-[#bbb] focus:outline-none focus:ring-1 focus:ring-[#333]"
                    />
                  </div>
                  <p className="text-[11px] text-[#8a8a8a]">
                    PNG / JPEG / WebP はロスレス WebP（マスター）＋表示用リサイズ（最大幅900px）で保存します。画質優先です。
                  </p>
                  {uploadError && <p className="text-[11px] text-[#b42318]">{uploadError}</p>}
                </div>

                <div className="space-y-4">
                  {sections.map((section, idx) => (
                    <div
                      key={section.id}
                      className={`border rounded-lg bg-white overflow-visible transition-colors ${
                        dragOverSectionId === section.id ? 'border-[#2563eb] ring-1 ring-[#93c5fd]' : 'border-[#e1e1e1]'
                      } ${draggingSectionId === section.id ? 'opacity-60' : ''}`}
                      onDragOver={e => {
                        const payload = readDragPayload(e);
                        if (payload?.type === 'section') {
                          e.preventDefault();
                          setDragOverSectionId(section.id);
                        }
                      }}
                      onDragLeave={() => {
                        setDragOverSectionId((prev) => (prev === section.id ? null : prev));
                      }}
                      onDrop={e => {
                        const payload = readDragPayload(e);
                        if (payload?.type === 'section' && payload.sectionId) {
                          e.preventDefault();
                          moveSection(payload.sectionId, section.id);
                          setDragOverSectionId(null);
                          setDraggingSectionId(null);
                        }
                      }}
                    >
                      {/* Section header */}
                      <div
                        className="flex items-center gap-3 px-4 py-3 bg-[#f3f3f3] border-b border-[#e1e1e1]"
                        draggable
                        onDragStart={e => {
                          writeDragPayload(e, { type: 'section', sectionId: section.id });
                          setDraggingSectionId(section.id);
                        }}
                        onDragEnd={() => {
                          setDraggingSectionId(null);
                          setDragOverSectionId(null);
                        }}
                      >
                        <button
                          type="button"
                          draggable
                          onDragStart={e => {
                            writeDragPayload(e, { type: 'section', sectionId: section.id });
                            setDraggingSectionId(section.id);
                          }}
                          onDragEnd={() => {
                            setDraggingSectionId(null);
                            setDragOverSectionId(null);
                          }}
                          className="shrink-0 text-[#9a9a9a] cursor-grab active:cursor-grabbing"
                          aria-label="セクションをドラッグして並び替え"
                        >
                          <GripVertical size={14} />
                        </button>
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
                          <div
                            className="rounded-lg border border-dashed border-[#cfcfcf] bg-[#fafafa] p-3"
                            onDragOver={e => e.preventDefault()}
                            onDrop={async (e) => {
                              e.preventDefault();
                              await appendImagesFromFiles(section.id, Array.from(e.dataTransfer.files));
                            }}
                          >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                              <div>
                                <p className="text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] text-[#333]">このセクションに画像を一括追加</p>
                                <p className="text-[11px] text-[#8a8a8a]">複数ファイルをドラッグ&ドロップ、または複数選択でまとめて登録できます</p>
                              </div>
                              <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-[#aaa] rounded-md text-[12px] text-[#666] hover:border-[#333] hover:text-[#333] cursor-pointer transition-colors">
                                <Upload size={13} />
                                複数ファイルを選択
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={async (e) => {
                                    const selectedFiles = Array.from(e.target.files ?? []);
                                    if (selectedFiles.length === 0) {
                                      return;
                                    }
                                    await appendImagesFromFiles(section.id, selectedFiles);
                                    e.currentTarget.value = '';
                                  }}
                                />
                              </label>
                            </div>
                            {uploadingSectionId === section.id && (
                              <p className="mt-2 text-[11px] text-[#666]">画像を一括追加中...</p>
                            )}
                          </div>

                          {section.images.map((img, imgIdx) => (
                            <div
                              key={img.id}
                              className={`flex gap-3 items-start rounded-md transition-colors ${
                                dragOverImageKey === imageRowKey(section.id, img.id) ? 'bg-[#eff6ff] ring-1 ring-[#bfdbfe]' : ''
                              } ${draggingImageKey === imageRowKey(section.id, img.id) ? 'opacity-60' : ''}`}
                              draggable
                              onDragStart={e => {
                                writeDragPayload(e, { type: 'image', sectionId: section.id, imageId: img.id });
                                setDraggingImageKey(imageRowKey(section.id, img.id));
                              }}
                              onDragEnd={() => {
                                setDraggingImageKey(null);
                                setDragOverImageKey(null);
                              }}
                              onDragOver={e => {
                                e.preventDefault();
                                const payload = readDragPayload(e);
                                if (payload?.type === 'image' && payload.sectionId === section.id && payload.imageId) {
                                  setDragOverImageKey(imageRowKey(section.id, img.id));
                                }
                              }}
                              onDragLeave={() => {
                                const rowKey = imageRowKey(section.id, img.id);
                                setDragOverImageKey((prev) => (prev === rowKey ? null : prev));
                              }}
                              onDrop={async (e) => {
                                const payload = readDragPayload(e);
                                if (payload?.type === 'image' && payload.sectionId === section.id && payload.imageId) {
                                  e.preventDefault();
                                  moveImage(section.id, payload.imageId, img.id);
                                  setDraggingImageKey(null);
                                  setDragOverImageKey(null);
                                  return;
                                }

                                e.preventDefault();
                                const droppedFiles = Array.from(e.dataTransfer.files);
                                if (droppedFiles.length === 0) {
                                  return;
                                }

                                if (droppedFiles.length === 1) {
                                  await setImageFromFile(section.id, img.id, droppedFiles[0]);
                                  return;
                                }

                                await setImageFromFile(section.id, img.id, droppedFiles[0]);
                                await appendImagesFromFiles(section.id, droppedFiles.slice(1));
                              }}
                            >
                              {/* thumbnail */}
                              <div className="shrink-0 flex flex-col items-center gap-1">
                                <button
                                  type="button"
                                  draggable
                                  onDragStart={e => {
                                    writeDragPayload(e, { type: 'image', sectionId: section.id, imageId: img.id });
                                    setDraggingImageKey(imageRowKey(section.id, img.id));
                                  }}
                                  onDragEnd={() => {
                                    setDraggingImageKey(null);
                                    setDragOverImageKey(null);
                                  }}
                                  className="text-[#9a9a9a] cursor-grab active:cursor-grabbing"
                                  aria-label="画像をドラッグして並び替え"
                                >
                                  <GripVertical size={13} />
                                </button>
                                <div className="w-9 h-16 rounded-lg overflow-hidden bg-[#f0f0f0] border border-[#e1e1e1] flex items-center justify-center text-[#ccc] text-[10px]">
                                {img.src
                                  ? <img src={img.src} alt="" className="w-full h-full object-cover"
                                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  : imgIdx + 1}
                                </div>
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
                                <div className="flex items-center gap-2">
                                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-[#aaa] rounded-md text-[11px] text-[#666] hover:border-[#333] hover:text-[#333] cursor-pointer transition-colors">
                                    <Upload size={12} />
                                    ファイルを選択
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={async (e) => {
                                        const selectedFiles = Array.from(e.target.files ?? []);
                                        if (selectedFiles.length === 0) {
                                          return;
                                        }

                                        await setImageFromFile(section.id, img.id, selectedFiles[0]);
                                        if (selectedFiles.length > 1) {
                                          await appendImagesFromFiles(section.id, selectedFiles.slice(1));
                                        }
                                        e.currentTarget.value = '';
                                      }}
                                    />
                                  </label>
                                  <p className="text-[11px] text-[#9a9a9a]">ここにドラッグ&ドロップでも登録できます</p>
                                  {uploadingImageId === img.id && (
                                    <p className="text-[11px] text-[#666]">アップロード中...</p>
                                  )}
                                </div>
                                {/* コンポーネントタグ */}
                                <div className="flex flex-wrap gap-1 items-center">
                                  {img.components.map(comp => (
                                    <button key={comp} type="button"
                                      onClick={() => toggleImageComponent(section.id, img.id, comp)}
                                      className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#333] text-white text-[10px] hover:bg-[#555] transition-colors">
                                      {comp}
                                      <span className="ml-0.5 opacity-70">×</span>
                                    </button>
                                  ))}
                                  <div className="relative">
                                    <button type="button"
                                      onClick={() => setOpenPickerId(openPickerId === img.id ? null : img.id)}
                                      className="flex items-center gap-0.5 px-2 py-0.5 rounded-full border border-dashed border-[#aaa] text-[10px] text-[#737373] hover:border-[#333] hover:text-[#333] transition-colors">
                                      <Plus size={10} /> コンポーネント
                                    </button>
                                    {openPickerId === img.id && (
                                      <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-[#e1e1e1] rounded-lg shadow-lg p-2 w-60 max-h-48 overflow-y-auto">
                                        {componentOptions.filter(c => !img.components.includes(c)).length === 0
                                          ? <p className="text-[11px] text-[#999] px-2 py-1">追加できるコンポーネントがありません</p>
                                          : componentOptions.filter(c => !img.components.includes(c)).map(comp => (
                                            <button key={comp} type="button"
                                              onClick={() => { toggleImageComponent(section.id, img.id, comp); setOpenPickerId(null); }}
                                              className="block w-full text-left px-3 py-1.5 text-[12px] text-[#333] hover:bg-[#f3f3f3] rounded-md transition-colors">
                                              {comp}
                                            </button>
                                          ))
                                        }
                                      </div>
                                    )}
                                  </div>
                                </div>
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
                  <section className="bg-[#f8f8f8] border border-[#e1e1e1] rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] text-[#444]">登録済みアプリを選んで編集できます。</p>
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setActiveMenu('新規登録');
                        }}
                        className="px-3 py-2 bg-[#333] text-white text-[12px] rounded-md hover:bg-[#1a1a1a] transition-colors"
                      >
                        新規登録へ
                      </button>
                    </div>

                    {saveMessage && (
                      <p className="rounded border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[12px] text-[#166534]">
                        {saveMessage}
                      </p>
                    )}
                    {saveError && (
                      <p className="rounded border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">
                        {saveError}
                      </p>
                    )}

                    {apps.length === 0 ? (
                      <p className="text-[13px] text-[#666]">まだ登録済みアプリはありません。</p>
                    ) : (
                      <div className="space-y-3">
                        {apps.map((app) => {
                          const screenshotCount = app.sections.reduce((count, section) => count + section.images.length, 0);
                          return (
                            <div key={app.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-lg border border-[#e1e1e1] bg-white p-4">
                              <div className="flex items-center gap-4 min-w-0">
                                {app.iconUrl
                                  ? <img src={app.iconUrl} alt={`${app.name} アイコン`} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                                  : <div className="h-12 w-12 rounded-xl bg-[#e5e5e5] shrink-0" />
                                }
                                <div className="min-w-0">
                                  <p className="text-[14px] font-['Noto_Sans_JP:Bold',sans-serif] text-[#333] truncate">{app.name}</p>
                                  <p className="text-[12px] text-[#777] truncate">{app.description || '説明なし'}</p>
                                  <p className="text-[11px] text-[#999] mt-1">カテゴリ {app.categories.length} 件 / コンポーネント {app.components.length} 件 / スクショ {screenshotCount} 枚</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => loadAppForEditing(app)}
                                  className="px-3 py-2 bg-[#2563eb] text-white text-[12px] rounded-md hover:bg-[#1d4ed8] transition-colors"
                                >
                                  編集
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDelete(app)}
                                  disabled={deletingAppId === app.id}
                                  className="px-3 py-2 bg-[#b91c1c] text-white text-[12px] rounded-md hover:bg-[#991b1b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                >
                                  {deletingAppId === app.id ? '削除中...' : '削除'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </>
              )}

              {activeMenu === '設定' && (
                <>
                  <h2 className="text-[28px] md:text-[32px] font-['Noto_Sans_JP:Bold',sans-serif] font-bold text-[#333]">
                    設定
                  </h2>
                  <section className="bg-[#f8f8f8] border border-[#e1e1e1] rounded-lg p-6 space-y-3">
                    <p className="text-[14px] text-[#444]">登録フロー（自動化対応）</p>
                    <ol className="list-decimal pl-5 text-[13px] text-[#666] space-y-1">
                      <li>実機でアプリを開き、各画面をスクリーンショットする</li>
                      <li>アプリごとのフォルダ（例: <code className="px-1 rounded bg-[#eee]">inbox/TVer/</code>）に画像を置く</li>
                      <li>新規登録で App Store 検索し、基本情報を自動入力する</li>
                      <li>inbox で対象フォルダを選び、スクショを一括取り込みする</li>
                      <li>セクション名・コンポーネントを整えて「登録」する</li>
                    </ol>
                    <p className="text-[12px] text-[#888]">登録時は apps.json に直接保存されます。公開前にリンク切れを確認してください。</p>
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
                <button type="button" onClick={handleRegister} disabled={savingApp}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                  {savingApp ? (editingAppId ? '更新中...' : '登録中...') : (editingAppId ? '更新' : '登録')}
                </button>
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
              {saveMessage && (
                <p className="mb-3 rounded border border-[#14532d] bg-[#052e16] px-3 py-2 text-[11px] text-[#86efac]">
                  {saveMessage}
                </p>
              )}
              {saveError && (
                <p className="mb-3 rounded border border-[#7f1d1d] bg-[#450a0a] px-3 py-2 text-[11px] text-[#fca5a5]">
                  {saveError}
                </p>
              )}
              <pre className="text-[11px] leading-relaxed text-[#9cdcfe] font-mono whitespace-pre-wrap break-all">
                {jsonOutput}
              </pre>
            </div>
            <div className="px-5 py-4 border-t border-[#2e2e2e]">
              <p className="text-[11px] text-[#888] leading-relaxed">
                開発中は「登録」「更新」で <span className="text-[#9cdcfe]">apps.json</span> に直接保存できます。手動で反映する場合はコピーして内容を調整し、GitHubにプッシュしてください。
              </p>
            </div>
          </div>
          )}

        </div>
      </div>
    </div>
  );
}
