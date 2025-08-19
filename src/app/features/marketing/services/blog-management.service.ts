/*
================================================================
File: src/app/features/marketing/services/blog-management.service.ts
Description: Service for handling blog-related API calls for marketing.
================================================================
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BlogManagerDTO,
  GeneralResponse,
  PagingDTO,
  BlogManagerRequestDTO,
  BlogDetailDTO, // SỬA LỖI: Đổi tên từ BlogDetailManagerDTO thành BlogDetailDTO
} from '../models/blog.model';

@Injectable({
  providedIn: 'root',
})
export class BlogManagementService {
  private apiUrl = `${environment.apiUrl}/marketing/blogs`;

  constructor(private http: HttpClient) {}

  getBlogs(
    page: number,
    size: number
  ): Observable<GeneralResponse<PagingDTO<BlogManagerDTO>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<GeneralResponse<PagingDTO<BlogManagerDTO>>>(
      this.apiUrl,
      { params }
    );
  }

  // SỬA LỖI: Cập nhật kiểu dữ liệu trả về
  getBlogDetail(id: number): Observable<GeneralResponse<BlogDetailDTO>> {
    return this.http.get<GeneralResponse<BlogDetailDTO>>(
      `${this.apiUrl}/${id}`
    );
  }

  createBlog(
    blogData: BlogManagerRequestDTO
  ): Observable<GeneralResponse<BlogManagerDTO>> {
    return this.http.post<GeneralResponse<BlogManagerDTO>>(
      this.apiUrl,
      blogData
    );
  }

  updateBlog(
    id: number,
    blogData: Partial<BlogManagerRequestDTO>
  ): Observable<GeneralResponse<BlogManagerDTO>> {
    return this.http.put<GeneralResponse<BlogManagerDTO>>(
      `${this.apiUrl}/${id}`,
      blogData
    );
  }

  deleteBlog(id: number): Observable<GeneralResponse<string>> {
    return this.http.delete<GeneralResponse<string>>(`${this.apiUrl}/${id}`);
  }
}
