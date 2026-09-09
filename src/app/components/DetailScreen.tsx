import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Copy,
  Download,
  ExternalLink,
  Heart,
  Share2,
} from "lucide-react";
import type { AppData } from "../../types/app";
import { displayImageSrc, nextDisplayFallback } from "../lib/imageUrl";
import { createCompareItem, makeCompareKey, type CompareItem } from "../lib/compare";
import { isAppFavorited, setAppFavorited } from "../lib/favorites";
import { Link } from "react-router";

type GalleryImage = {
  id: string;
  src: string;
  filename: string;
};

type GallerySection = {
  id: string;
  title: string;
  images: GalleryImage[];
};

type DetailScreenProps = {
  onBack: () => void;
  app: AppData;
  compareKeys?: Set<string>;
  onToggleCompare?: (item: CompareItem) => void;
};

type IconCircleButtonProps = {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
  label?: string;
  disabled?: boolean;
  style?: "light" | "dark";
  size?: "md" | "lg";
};

type HoverActionsProps = {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDownload: () => void;
  downloading: boolean;
  compareActive?: boolean;
  onToggleCompare?: () => void;
};

type SectionRowProps = {
  section: GallerySection;
  imageFavorites: Set<string>;
  onToggleImageFavorite: (id: string) => void;
  onDownloadImage: (image: GalleryImage) => Promise<void>;
  onDownloadSection: (section: GallerySection) => Promise<void>;
  onOpenImage: (id: string) => void;
  downloadingImageId: string | null;
  downloadingSectionId: string | null;
  isCompared?: (imageId: string) => boolean;
  onToggleCompare?: (image: GalleryImage, sectionTitle: string) => void;
};

type ImageModalProps = {
  image: GalleryImage;
  imageIndex: number;
  imageCount: number;
  imageFavorite: boolean;
  downloadingImage: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleImageFavorite: () => void;
  onDownloadImage: () => void;
  onOpenExternal: () => void;
  appName: string;
  tags: string[];
  compareActive?: boolean;
  onToggleCompare?: () => void;
};


function IconCircleButton({
  children,
  onClick,
  active,
  label,
  disabled,
  style = "light",
  size = "md",
}: IconCircleButtonProps) {
  const isDark = style === "dark";
  const sizeClass = size === "lg" ? "h-9 w-9" : "h-7 w-7";
  return (
    <button
      aria-label={label}
      className={`inline-flex ${sizeClass} items-center justify-center rounded-full border transition-opacity ${isDark
        ? "border-white bg-white text-[#333] hover:opacity-80"
        : "border-[#333] bg-white text-[#333] hover:opacity-70"
        } ${active ? (isDark ? "bg-white" : "bg-white") : ""} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

async function triggerDownload(src: string, filename: string) {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error("画像の取得に失敗しました");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}

function HoverActions({
  isFavorite,
  onToggleFavorite,
  onDownload,
  downloading,
  compareActive,
  onToggleCompare,
}: HoverActionsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-gradient-to-b from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
      <div className="absolute right-2 top-2 flex items-center gap-1.5">
        {onToggleCompare && (
          <div className="pointer-events-auto hidden md:block">
            <IconCircleButton
              active={compareActive}
              label={compareActive ? "比較から外す" : "比較に追加"}
              onClick={(event) => {
                event.stopPropagation();
                onToggleCompare();
              }}
              style="dark"
              size="lg"
            >
              <Columns2 size={18} />
            </IconCircleButton>
          </div>
        )}
        <div className="pointer-events-auto">
          <IconCircleButton
            active={isFavorite}
            label="お気に入り"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
            style="dark"
            size="lg"
          >
            <Heart fill={isFavorite ? "currentColor" : "none"} size={18} />
          </IconCircleButton>
        </div>
        <div className="pointer-events-auto">
          <IconCircleButton
            disabled={downloading}
            label="ダウンロード"
            onClick={(event) => {
              event.stopPropagation();
              onDownload();
            }}
            style="dark"
            size="lg"
          >
            <Download size={18} />
          </IconCircleButton>
        </div>
      </div>
    </div>
  );
}

type OrientedThumbProps = {
  image: GalleryImage;
  isFavorite: boolean;
  isDownloading: boolean;
  compareActive: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onToggleCompare?: () => void;
};

function OrientedThumb({
  image,
  isFavorite,
  isDownloading,
  compareActive,
  onOpen,
  onToggleFavorite,
  onDownload,
  onToggleCompare,
}: OrientedThumbProps) {
  const [landscape, setLandscape] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-[18px] bg-white ${
        landscape
          ? "w-[min(100%,420px)] md:w-[min(100%,520px)]"
          : "w-[198px] md:w-[270px]"
      } ${
        compareActive ? "ring-2 ring-[#333] ring-offset-2 ring-offset-[#efede4]" : ""
      }`}
      onClick={onOpen}
    >
      <img
        alt="画面プレビュー"
        className={`block w-full object-cover ${
          landscape ? "aspect-[844/390]" : "aspect-[390/844]"
        }`}
        decoding="async"
        loading="lazy"
        src={displayImageSrc(image.src, "detail")}
        onLoad={(e) => {
          const { naturalWidth, naturalHeight } = e.currentTarget;
          if (naturalWidth > 0 && naturalHeight > 0) {
            setLandscape(naturalWidth > naturalHeight);
          }
        }}
        onError={(e) => {
          const next = nextDisplayFallback(
            e.currentTarget.currentSrc || e.currentTarget.src,
            image.src,
          );
          if (next) e.currentTarget.src = next;
        }}
      />
      <HoverActions
        compareActive={compareActive}
        downloading={isDownloading}
        isFavorite={isFavorite}
        onDownload={onDownload}
        onToggleCompare={onToggleCompare}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}

function SectionRow({
  section,
  imageFavorites,
  onToggleImageFavorite,
  onDownloadImage,
  onDownloadSection,
  onOpenImage,
  downloadingImageId,
  downloadingSectionId,
  isCompared,
  onToggleCompare,
}: SectionRowProps) {
  const sectionFavorite = section.images.every((image) => imageFavorites.has(image.id));

  const handleToggleSectionFavorite = () => {
    const shouldFavorite = !sectionFavorite;
    section.images.forEach((image) => {
      if (shouldFavorite && !imageFavorites.has(image.id)) {
        onToggleImageFavorite(image.id);
      }
      if (!shouldFavorite && imageFavorites.has(image.id)) {
        onToggleImageFavorite(image.id);
      }
    });
  };

  return (
    <section className="flex w-full flex-col gap-3 md:gap-4">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-['Noto_Sans_JP:Bold',sans-serif] text-[20px] leading-none tracking-[0.6px] text-[#333] md:text-[24px]">
            {section.title}
          </h2>
          <p className="font-['Noto_Sans_JP:Medium',sans-serif] text-[12px] leading-none tracking-[0.36px] text-[#717171]">
            {section.images.length}画面
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IconCircleButton
            active={sectionFavorite}
            label="セクションをお気に入り"
            onClick={handleToggleSectionFavorite}
            size="lg"
          >
            <Heart fill={sectionFavorite ? "currentColor" : "none"} size={18} />
          </IconCircleButton>
          <IconCircleButton
            disabled={downloadingSectionId === section.id}
            label="セクション画像をダウンロード"
            onClick={() => {
              void onDownloadSection(section);
            }}
            size="lg"
          >
            <Download size={18} />
          </IconCircleButton>
        </div>
      </div>
      <div className="flex flex-wrap content-start gap-2 md:gap-3">
        {section.images.map((image) => {
          const isFavorite = imageFavorites.has(image.id);
          const isDownloading = downloadingImageId === image.id;
          const compareActive = isCompared?.(image.id) ?? false;
          return (
            <OrientedThumb
              compareActive={compareActive}
              image={image}
              isDownloading={isDownloading}
              isFavorite={isFavorite}
              key={image.id}
              onDownload={() => {
                void onDownloadImage(image);
              }}
              onOpen={() => onOpenImage(image.id)}
              onToggleCompare={
                onToggleCompare
                  ? () => onToggleCompare(image, section.title)
                  : undefined
              }
              onToggleFavorite={() => onToggleImageFavorite(image.id)}
            />
          );
        })}
      </div>
      <div className="h-px w-full bg-[#b5b2a8]" />
    </section>
  );
}

function ImageModal({
  image,
  imageIndex,
  imageCount,
  imageFavorite,
  downloadingImage,
  onClose,
  onPrev,
  onNext,
  onToggleImageFavorite,
  onDownloadImage,
  onOpenExternal,
  appName,
  tags,
  compareActive,
  onToggleCompare,
}: ImageModalProps) {
  const [landscape, setLandscape] = useState(false);

  useEffect(() => {
    setLandscape(false);
  }, [image.id]);

  return (
    <div className="fixed inset-0 z-50 bg-[#efede4] px-4 pb-8 pt-6 md:px-8 md:pt-8">
      <div className="mx-auto flex h-full w-full max-w-[1460px] flex-col">
        <div className="flex items-center">
          <div className="flex items-center gap-4 text-[#333]">
            <p className="font-['Noto_Sans_JP:Bold',sans-serif] text-[16px] tracking-[0.8px] md:text-[18px]">
              アプリUI図鑑
            </p>
            <p className="hidden whitespace-nowrap font-['Noto_Sans_JP:Regular',sans-serif] text-[10px] tracking-[0.44px] md:block">
              アプリデザインの参考になるギャラリーサイト
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-1 items-center justify-center md:mt-6">
          <div className="relative flex h-full w-full max-w-[1100px] items-center justify-center">
            <div className="flex flex-col items-center gap-4 md:gap-5">
              <div className="relative flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-center font-['Noto_Sans_JP:Bold',sans-serif] text-[20px] tracking-[0.8px] text-[#333]">
                    {appName}
                  </p>
                  <div className="relative">
                    <button
                      className="absolute -left-12 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#333] bg-white text-[#333] transition-opacity hover:opacity-70 md:-left-16"
                      onClick={onPrev}
                      type="button"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <div
                      className={`relative overflow-hidden rounded-[28px] bg-white md:rounded-[36px] ${
                        landscape
                          ? "h-auto w-[min(88vw,860px)] aspect-[844/390]"
                          : "h-[min(62vh,580px)] w-auto max-w-[min(82vw,266px)] aspect-[410/893] md:h-[min(76vh,980px)] md:max-w-[450px]"
                      }`}
                    >
                      <img
                        alt="モーダル拡大プレビュー"
                        className="h-full w-full object-contain"
                        decoding="async"
                        src={displayImageSrc(image.src, "detail")}
                        onLoad={(e) => {
                          const { naturalWidth, naturalHeight } = e.currentTarget;
                          if (naturalWidth > 0 && naturalHeight > 0) {
                            setLandscape(naturalWidth > naturalHeight);
                          }
                        }}
                        onError={(e) => {
                          const next = nextDisplayFallback(
                            e.currentTarget.currentSrc || e.currentTarget.src,
                            image.src,
                          );
                          if (next) e.currentTarget.src = next;
                        }}
                      />
                    </div>
                    <button
                      className="absolute -right-12 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#333] bg-white text-[#333] transition-opacity hover:opacity-70 md:-right-16"
                      onClick={onNext}
                      type="button"
                    >
                      <ChevronRight size={22} />
                    </button>
                    <button
                      className="absolute left-[calc(100%+0.5rem)] top-1 whitespace-nowrap rounded-full border border-[#333] bg-white px-3 py-1 font-['Noto_Sans_JP:Bold',sans-serif] text-[14px] text-[#333] transition-opacity hover:opacity-70 md:left-[calc(100%+2rem)]"
                      onClick={onClose}
                      type="button"
                    >
                      戻る
                    </button>
                  </div>
                </div>

                <div className="hidden w-[220px] flex-col gap-4 md:absolute md:bottom-0 md:left-[calc(100%+2rem)] md:flex">
                  <div className="flex items-center text-[12px] text-[#717171]">
                    <span>
                      {imageIndex + 1} / {imageCount}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span key={tag} className="rounded-full border border-[#333] bg-white px-3 py-[6px] font-['Noto_Sans_JP:Medium',sans-serif] text-[10px] leading-[1] text-[#333]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {onToggleCompare && (
                      <IconCircleButton
                        active={compareActive}
                        label={compareActive ? "比較から外す" : "比較に追加"}
                        onClick={onToggleCompare}
                        size="lg"
                      >
                        <Columns2 size={18} />
                      </IconCircleButton>
                    )}
                    <IconCircleButton label="外部リンク" onClick={onOpenExternal} size="lg">
                      <ExternalLink size={18} />
                    </IconCircleButton>
                    <IconCircleButton
                      active={imageFavorite}
                      label="画像をお気に入り"
                      onClick={() => onToggleImageFavorite()}
                      size="lg"
                    >
                      <Heart fill={imageFavorite ? "currentColor" : "none"} size={18} />
                    </IconCircleButton>
                    <IconCircleButton
                      disabled={downloadingImage}
                      label="画像をダウンロード"
                      onClick={() => onDownloadImage()}
                      size="lg"
                    >
                      <Download size={18} />
                    </IconCircleButton>
                  </div>
                </div>
              </div>

              <div className="flex w-full max-w-[min(78vw,244px)] flex-col gap-4 md:hidden">
                <div className="flex items-center text-[12px] text-[#717171]">
                  <span>
                    {imageIndex + 1} / {imageCount}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="rounded-full border border-[#333] bg-white px-3 py-[6px] font-['Noto_Sans_JP:Medium',sans-serif] text-[10px] leading-[1] text-[#333]">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <IconCircleButton label="外部リンク" onClick={onOpenExternal} size="lg">
                    <ExternalLink size={18} />
                  </IconCircleButton>
                  <IconCircleButton
                    active={imageFavorite}
                    label="画像をお気に入り"
                    onClick={() => onToggleImageFavorite()}
                    size="lg"
                  >
                    <Heart fill={imageFavorite ? "currentColor" : "none"} size={18} />
                  </IconCircleButton>
                  <IconCircleButton
                    disabled={downloadingImage}
                    label="画像をダウンロード"
                    onClick={() => onDownloadImage()}
                    size="lg"
                  >
                    <Download size={18} />
                  </IconCircleButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DetailScreen({ onBack, app, compareKeys, onToggleCompare }: DetailScreenProps) {
  const APP_FAVORITES_KEY = `ui-zukan:app-favorites:${app.id}`;
  const IMAGE_FAVORITES_KEY = `ui-zukan:image-favorites:${app.id}`;
  const [appFavorites, setAppFavorites] = useState<Set<string>>(new Set());
  const [imageFavorites, setImageFavorites] = useState<Set<string>>(new Set());
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(null);
  const [downloadingSectionId, setDownloadingSectionId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const allImages = useMemo(() => app.sections.flatMap((section) => section.images), [app.sections]);

  const imageSectionTitle = useMemo(() => {
    const map = new Map<string, string>();
    for (const section of app.sections) {
      for (const image of section.images) {
        map.set(image.id, section.title);
      }
    }
    return map;
  }, [app.sections]);

  const handleToggleCompareImage = (image: GalleryImage, sectionTitle: string) => {
    onToggleCompare?.(
      createCompareItem({
        appId: app.id,
        appName: app.name,
        sectionTitle,
        imageId: image.id,
        src: image.src,
        filename: image.filename,
      }),
    );
  };

  const isCompared = (imageId: string) =>
    Boolean(compareKeys?.has(makeCompareKey(app.id, imageId)));

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [app.id]);

  useEffect(() => {
    const savedAppFavorites = window.localStorage.getItem(APP_FAVORITES_KEY);
    const savedImageFavorites = window.localStorage.getItem(IMAGE_FAVORITES_KEY);

    if (savedAppFavorites) {
      try {
        const parsed = JSON.parse(savedAppFavorites) as string[];
        setAppFavorites(new Set(parsed));
      } catch {
        setAppFavorites(new Set());
      }
    } else if (isAppFavorited(app.id)) {
      setAppFavorites(new Set([app.id]));
    }

    if (savedImageFavorites) {
      try {
        const parsed = JSON.parse(savedImageFavorites) as string[];
        setImageFavorites(new Set(parsed));
      } catch {
        setImageFavorites(new Set());
      }
    }
  }, [APP_FAVORITES_KEY, IMAGE_FAVORITES_KEY, app.id]);

  useEffect(() => {
    window.localStorage.setItem(APP_FAVORITES_KEY, JSON.stringify(Array.from(appFavorites)));
  }, [appFavorites]);

  useEffect(() => {
    window.localStorage.setItem(IMAGE_FAVORITES_KEY, JSON.stringify(Array.from(imageFavorites)));
  }, [imageFavorites]);

  const toggleAppFavorite = () => {
    setAppFavorites((previous) => {
      const next = new Set(previous);
      const favorited = !next.has(app.id);
      if (favorited) {
        next.add(app.id);
      } else {
        next.delete(app.id);
      }
      setAppFavorited(app.id, favorited);
      window.dispatchEvent(new Event('appui-favorites-changed'));
      return next;
    });
  };

  const [shareMessage, setShareMessage] = useState('');

  const copyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage('リンクをコピーしました');
    } catch {
      setShareMessage('コピーに失敗しました');
    }
    window.setTimeout(() => setShareMessage(''), 2000);
  };

  const shareOnX = () => {
    const text = `${app.name}のUI｜アプリUI図鑑`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleImageFavorite = (imageId: string) => {
    setImageFavorites((previous) => {
      const next = new Set(previous);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  const downloadImage = async (image: GalleryImage) => {
    try {
      setDownloadingImageId(image.id);
      await triggerDownload(image.src, image.filename);
    } catch {
      // no-op
    } finally {
      setDownloadingImageId(null);
    }
  };

  const downloadSectionImages = async (section: GallerySection) => {
    try {
      setDownloadingSectionId(section.id);
      for (const image of section.images) {
        await triggerDownload(image.src, image.filename);
      }
    } catch {
      // no-op
    } finally {
      setDownloadingSectionId(null);
    }
  };

  const downloadAllImages = async () => {
    try {
      setDownloadingAll(true);
      for (const image of allImages) {
        await triggerDownload(image.src, image.filename);
      }
    } catch {
      // no-op
    } finally {
      setDownloadingAll(false);
    }
  };

  const appFavorite = appFavorites.has(app.id);
  const openExternalAppPage = () => {
    window.open(app.externalUrl, "_blank", "noopener,noreferrer");
  };

  const openImageModal = (imageId: string) => {
    const imageIndex = allImages.findIndex((image) => image.id === imageId);
    if (imageIndex >= 0) {
      setSelectedImageIndex(imageIndex);
    }
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  const showPreviousImage = () => {
    setSelectedImageIndex((previous) => {
      if (previous === null) {
        return previous;
      }
      return previous === 0 ? allImages.length - 1 : previous - 1;
    });
  };

  const showNextImage = () => {
    setSelectedImageIndex((previous) => {
      if (previous === null) {
        return previous;
      }
      return previous === allImages.length - 1 ? 0 : previous + 1;
    });
  };

  useEffect(() => {
    if (selectedImageIndex === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeImageModal();
      }
      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }
      if (event.key === "ArrowRight") {
        showNextImage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedImageIndex, allImages.length]);

  const selectedImage =
    selectedImageIndex === null ? null : allImages[selectedImageIndex] ?? null;
  const selectedImageFavorite =
    selectedImage === null ? false : imageFavorites.has(selectedImage.id);
  const selectedImageDownloading =
    selectedImage === null ? false : downloadingImageId === selectedImage.id;

  return (
    <div className="min-h-screen w-full bg-[#efede4] px-4 pb-12 pt-6 md:px-8 md:pt-8">
      <div className="mx-auto flex w-full max-w-[1460px] flex-col gap-8 md:gap-10">
        <header className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[#333] bg-white text-[#333] transition-opacity hover:opacity-70"
                onClick={onBack}
                type="button"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="flex items-center gap-3">
                <p className="whitespace-nowrap font-['Noto_Sans_JP:Bold',sans-serif] text-[16px] tracking-[0.8px] text-[#333] md:text-[18px]">
                  <Link to="/" className="hover:opacity-70">アプリUI図鑑</Link>
                </p>
                <p className="font-['Noto_Sans_JP:Regular',sans-serif] text-[10px] tracking-[0.44px] text-[#595959]">
                  アプリデザインの参考になる
                  <br />
                  ギャラリーサイト
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {app.iconUrl
              ? <img src={app.iconUrl} alt={`${app.name} アイコン`} className="h-[62px] w-[62px] rounded-[12px] object-cover shrink-0" />
              : <div className="h-[62px] w-[62px] rounded-[12px] bg-[#d9d9d9] shrink-0" />
            }
            <div className="flex flex-col gap-1">
              <h1 className="font-['Noto_Sans_JP:Bold',sans-serif] text-[18px] tracking-[1px] text-[#333]">
                {app.name}
              </h1>
              <p className="font-['Noto_Sans_JP:Regular',sans-serif] text-[12px] text-[#717171]">
                {app.description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <IconCircleButton label="外部リンク" onClick={openExternalAppPage} size="lg">
              <ExternalLink size={18} />
            </IconCircleButton>
            <IconCircleButton label="リンクをコピー" onClick={() => { void copyPageLink(); }} size="lg">
              <Copy size={18} />
            </IconCircleButton>
            <IconCircleButton label="Xで共有" onClick={shareOnX} size="lg">
              <Share2 size={18} />
            </IconCircleButton>
            <IconCircleButton
              active={appFavorite}
              label="アプリをお気に入り保存"
              onClick={toggleAppFavorite}
              size="lg"
            >
              <Heart fill={appFavorite ? "currentColor" : "none"} size={18} />
            </IconCircleButton>
            <IconCircleButton
              disabled={downloadingAll}
              label="このアプリの全画像をダウンロード"
              onClick={() => {
                void downloadAllImages();
              }}
              size="lg"
            >
              <Download size={18} />
            </IconCircleButton>
            {shareMessage ? (
              <span className="font-['Noto_Sans_JP:Medium',sans-serif] text-[11px] text-[#166534]">{shareMessage}</span>
            ) : null}
            {[...app.categories, ...app.components].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#333] bg-white px-3 py-[6px] font-['Noto_Sans_JP:Medium',sans-serif] text-[10px] leading-[1] text-[#333]"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <div className="flex w-full flex-col gap-8 pb-24 md:pb-28">
          {app.sections.map((section) => (
            <SectionRow
              downloadingImageId={downloadingImageId}
              downloadingSectionId={downloadingSectionId}
              imageFavorites={imageFavorites}
              isCompared={isCompared}
              key={section.id}
              onDownloadImage={downloadImage}
              onDownloadSection={downloadSectionImages}
              onOpenImage={openImageModal}
              onToggleCompare={onToggleCompare ? handleToggleCompareImage : undefined}
              onToggleImageFavorite={toggleImageFavorite}
              section={section}
            />
          ))}
        </div>
      </div>
      {selectedImage && (
        <ImageModal
          compareActive={isCompared(selectedImage.id)}
          downloadingImage={selectedImageDownloading}
          image={selectedImage}
          imageCount={allImages.length}
          imageFavorite={selectedImageFavorite}
          imageIndex={selectedImageIndex ?? 0}
          onClose={closeImageModal}
          onDownloadImage={() => {
            void downloadImage(selectedImage);
          }}
          onNext={showNextImage}
          onOpenExternal={openExternalAppPage}
          onPrev={showPreviousImage}
          onToggleCompare={
            onToggleCompare
              ? () =>
                  handleToggleCompareImage(
                    selectedImage,
                    imageSectionTitle.get(selectedImage.id) || "セクション未設定",
                  )
              : undefined
          }
          onToggleImageFavorite={() => toggleImageFavorite(selectedImage.id)}
          appName={app.name}
          tags={[...app.categories, ...app.components]}
        />
      )}
    </div>
  );
}
