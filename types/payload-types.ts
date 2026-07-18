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

export interface Contact {
  id: string;
  firstAgency: {
    label: string;
    email: string;
  };
  secondAgency: {
    label: string;
    tagline: string;
    email: string;
    phone: string;
  };
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface About {
  id: string;
  portrait: string | Media;
  content: {
    paragraph: string;
    id: string;
  }[];
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface Selector {
  id: string;
  heading: string;
  creative: {
    heading: string;
    images: {
      image: string | Media;
      id: string;
    }[];
  };
  commerical: {
    heading: string;
    images: {
      image: string | Media;
      id: string;
    }[];
  };
  updatedAt?: string | null;
  createdAt?: string | null;
}
