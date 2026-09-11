export type ImageLibraryCategory = 'wheels' | 'backgrounds';

export interface LibraryImage {
  name: string;
  fileName: string;
  collection: string;
  path: string;
  category: ImageLibraryCategory;
}

export interface ImageLibraryManifest {
  generatedAt: string;
  wheels: LibraryImage[];
  backgrounds: LibraryImage[];
}
