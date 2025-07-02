// src/app/core/models/blog.model.ts

/**
 * Interface này đại diện cho một đối tượng Blog Item duy nhất
 * nằm trong mảng "items" mà API trả về.
 */
export interface BlogItem {
  id: number;
  title: string;
  thumbnailImageUrl: string;
  authorName: string;
  createdAt: string; // API trả về string, ta giữ nguyên là string để dễ xử lý
  tags: string[];
}

/**
 * Interface này đại diện cho cấu trúc của đối tượng "data" trong API,
 * bao gồm thông tin phân trang và danh sách các bài blog.
 */
export interface BlogPaginationData {
  page: number;
  size: number;
  total: number;
  items: BlogItem[];
}

/**
 * Interface này đại diện cho dữ liệu chi tiết của một bài blog
 * khi gọi API /public/blogs/{id}.
 */
export interface BlogDetail {
  id: number;
  title: string;
  description: string;
  content: string; // Trường này chứa nội dung đầy đủ của bài viết
  thumbnailImageUrl: string;
  authorName: string;
  createdAt: string;
  tags: string[];
}