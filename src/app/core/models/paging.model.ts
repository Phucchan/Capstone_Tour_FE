/*
  File: src/app/core/models/paging.model.ts
  Lý do: Tạo model Paging để dùng chung trong toàn dự án.
*/
export interface Paging<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
