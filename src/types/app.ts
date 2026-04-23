export type AppImage = {
  id: string;
  src: string;
  filename: string;
};

export type AppSection = {
  id: string;
  title: string;
  images: AppImage[];
};

export type AppData = {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  externalUrl: string;
  categories: string[];
  components: string[];
  sections: AppSection[];
};
