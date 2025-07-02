// src/app/core/services/blog.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BlogPaginationData } from '../models/blog.model';
import { ApiResponse } from '../models/api-response.model';
import { BlogDetail } from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  // Lấy URL của API từ file environment để dễ dàng thay đổi giữa môi trường dev và production
  private apiUrl = `${environment.apiUrl}/public/blogs`;

  // Tiêm HttpClient vào service để có thể gửi request
  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách blog đã được phân trang từ API.
   * @param page - Số trang muốn lấy (bắt đầu từ 0).
   * @param size - Số lượng bài viết trên mỗi trang.
   * @returns Một Observable chứa dữ liệu phân trang của blog.
   */
  getBlogs(page: number = 0, size: number = 8): Observable<BlogPaginationData> {
    // Tạo các tham số cho URL (ví dụ: ?page=0&size=10)
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Gọi API và chỉ trả về phần "data" của response
    return this.http.get<ApiResponse<BlogPaginationData>>(this.apiUrl, { params }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Lấy thông tin chi tiết của một bài blog từ API.
   * @param id - ID của bài blog cần lấy.
   * @returns Một Observable chứa dữ liệu chi tiết của bài blog.
   */
  getBlogById(id: number): Observable<BlogDetail> {
    // Tạo URL đầy đủ, ví dụ: /api/public/blogs/123
    const detailUrl = `${this.apiUrl}/${id}`;

    // Gọi API và chỉ trả về phần "data" của response
    return this.http.get<ApiResponse<BlogDetail>>(detailUrl).pipe(
      map(response => response.data)
    );
  }
}