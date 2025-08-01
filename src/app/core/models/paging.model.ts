/*
  File: src/app/core/models/paging.model.ts
  Lý do: Tạo model PagingDTO để dùng chung trong toàn dự án.
*/
export interface PagingDTO<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
