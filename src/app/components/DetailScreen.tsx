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
  Download,
  ExternalLink,
  Heart,
} from "lucide-react";
import type { AppData } from "../../types/app";
import { displayImageSrc, nextDisplayFallback } from "../lib/imageUrl";

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
}: HoverActionsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-gradient-to-b from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
      <div className="absolute right-2 top-2 flex items-center gap-1.5">
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

function SectionRow({
  section,
  imageFavorites,
  onToggleImageFavorite,
  onDownloadImage,
  onDownloadSection,
  onOpenImage,
  downloadingImageId,
  downloadingSectionId,
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
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-2 md:gap-3">
          {section.images.map((image) => {
            const isFavorite = imageFavorites.has(image.id);
            const isDownloading = downloadingImageId === image.id;
            return (
              <div
                className="group relative h-[432px] w-[198px] overflow-hidden rounded-[18px] bg-white md:h-[588px] md:w-[270px]"
                key={image.id}
                onClick={() => onOpenImage(image.id)}
              >
                <img
                  alt="オンボーディング画面のプレビュー"
                  className="h-full w-full"
                  decoding="async"
                  loading="lazy"
                  src={displayImageSrc(image.src, 'detail')}
                  onError={(e) => {
                    const next = nextDisplayFallback(e.currentTarget.currentSrc || e.currentTarget.src, image.src);
                    if (next) e.currentTarget.src = next;
                  }}
                />
                <HoverActions
                  downloading={isDownloading}
                  isFavorite={isFavorite}
                  onDownload={() => {
                    void onDownloadImage(image);
                  }}
                  onToggleFavorite={() => onToggleImageFavorite(image.id)}
                />
              </div>
            );
          })}
        </div>
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
}: ImageModalProps) {
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
          <div className="relative flex h-full w-full max-w-[980px] items-center justify-center">
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
                    <div className="relative h-[min(62vh,580px)] w-auto max-w-[min(82vw,266px)] aspect-[410/893] overflow-hidden rounded-[28px] bg-white md:h-[min(76vh,980px)] md:max-w-[450px] md:rounded-[36px]">
                      <img
                        alt="モーダル拡大プレビュー"
                        className="h-full w-full"
                        decoding="async"
                        src={displayImageSrc(image.src, 'detail')}
                        onError={(e) => {
                          const next = nextDisplayFallback(e.currentTarget.currentSrc || e.currentTarget.src, image.src);
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

export function DetailScreen({ onBack, app }: DetailScreenProps) {
  const APP_FAVORITES_KEY = `ui-zukan:app-favorites:${app.id}`;
  const IMAGE_FAVORITES_KEY = `ui-zukan:image-favorites:${app.id}`;
  const [appFavorites, setAppFavorites] = useState<Set<string>>(new Set());
  const [imageFavorites, setImageFavorites] = useState<Set<string>>(new Set());
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(null);
  const [downloadingSectionId, setDownloadingSectionId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const allImages = useMemo(() => app.sections.flatMap((section) => section.images), [app.sections]);

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
    }

    if (savedImageFavorites) {
      try {
        const parsed = JSON.parse(savedImageFavorites) as string[];
        setImageFavorites(new Set(parsed));
      } catch {
        setImageFavorites(new Set());
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(APP_FAVORITES_KEY, JSON.stringify(Array.from(appFavorites)));
  }, [appFavorites]);

  useEffect(() => {
    window.localStorage.setItem(IMAGE_FAVORITES_KEY, JSON.stringify(Array.from(imageFavorites)));
  }, [imageFavorites]);

  const toggleAppFavorite = () => {
    setAppFavorites((previous) => {
      const next = new Set(previous);
      if (next.has(app.id)) {
        next.delete(app.id);
      } else {
        next.add(app.id);
      }
      return next;
    });
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
                  アプリUI図鑑
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

        <div className="flex w-full flex-col gap-8">
          {app.sections.map((section) => (
            <SectionRow
              downloadingImageId={downloadingImageId}
              downloadingSectionId={downloadingSectionId}
              imageFavorites={imageFavorites}
              key={section.id}
              onDownloadImage={downloadImage}
              onDownloadSection={downloadSectionImages}
              onOpenImage={openImageModal}
              onToggleImageFavorite={toggleImageFavorite}
              section={section}
            />
          ))}
        </div>
      </div>
      {selectedImage && (
        <ImageModal
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
          onToggleImageFavorite={() => toggleImageFavorite(selectedImage.id)}
          appName={app.name}
          tags={[...app.categories, ...app.components]}
        />
      )}
    </div>
  );
}
