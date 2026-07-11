export type PaginatedDocs<T = any> = {
  docs: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage?: null | number | undefined;
  page?: number;
  pagingCounter: number;
  prevPage?: null | number | undefined;
  totalDocs: number;
  totalPages: number;
};

export interface Media {
  id: string;
  alt: string;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}

export interface Project {
  id: string;
  cate: "creative" | "commercial";
  heroMedia: string | Media;
  name: string;
  slug: string;
  galleryMedia: {
    media: string | Media;
    id: string;
  }[];
  updatedAt: string;
  createdAt: string;
}

export type Projects = PaginatedDocs<Project>;
