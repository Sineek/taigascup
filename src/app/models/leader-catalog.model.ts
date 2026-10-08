export interface LeaderCatalogEntry {
  code: string;
  name: string;
  image: string;
}

export interface LeaderCatalog {
  generatedAt: string;
  source: string;
  leaders: LeaderCatalogEntry[];
}

