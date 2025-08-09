/*
================================================================
File: src/app/features/marketing/models/blog.model.ts
Description: Contains TypeScript interfaces corresponding to backend DTOs.
================================================================
*/
export interface GeneralResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PagingDTO<T> {
  page: number;
  size: number;
  total: number;
  items: T[];
}

export interface BlogManagerDTO {
  id: number;
  title: string;
  description: string;
  thumbnailImageUrl: string;
  authorName: string;
  tags: string[];
  deleted: boolean;
}

export interface BlogDetailManagerDTO {
  id: number;
  title: string;
  description: string;
  content: string;
  thumbnailImageUrl: string;
  authorName: string;
  tags: string[];
  deleted: boolean;
}

export interface BlogManagerRequestDTO {
  title: string;
  description: string;
  content: string;
  thumbnailImageUrl: string;
  authorId: number;
  tagIds: number[];
}

export interface Tag {
  id: number;
  name: string;
}
