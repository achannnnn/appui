export type AppImage = {
  id: string;
  src: string;
  filename: string;
  components?: string[];
};

export type AppSection = {
  id: string;
  title: string;
  images: AppImage[];
};

export type AppData = {
  id: string;
  slug?: string;
  name: string;
  description: string;
  iconUrl: string;
  externalUrl: string;
  categories: string[];
  components: string[];
  sections: AppSection[];
};

export type AppIndexItem = AppData;

export type ComponentImageHit = {
  appId: string;
  appSlug: string;
  appName: string;
  sectionId: string;
  sectionTitle: string;
  imageId: string;
  src: string;
  components: string[];
};
