import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanService {


  constructor(private http: HttpClient) { }

  getPlansByUserId(userId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/plans/list/${userId}`);
  }


  getPlanByPage(
    page: number = 0,
    size: number = 10,
    sortField: string,
    sortDirection: string = 'desc',
    userId: number = 0
  ): Observable<any> {


    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('userId', userId)
      .set('sortField', sortField)
      .set('sortDirection', sortDirection);

    console.log(params.toString())


    return this.http.get(`${environment.apiUrl}/public/plans/list`, { params });
  }


  getPlanById(planId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/plans/details/${planId}`);

  }

  deletePlan(planId: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/public/plans/delete/${planId}`);
  }


  updatePlan(planId: string, planJson: string) : Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/public/plans/update/${planId}`, planJson);
  }


  fetchProviderByCategoryAndLocationId(locationId: number, categoryName: string, ids: number[]): Observable<any> { // Convert array to comma-separated string

    return this.http.get<any>(`${environment.apiUrl}/public/plans/service-providers/list`, { 
      params : {
        locationId: locationId,
        categoryName: categoryName,
        ids: ids
      }
      
     });
  }

  fetchActivities(locationName: string, preferences: string, startIndex: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/public/plans/activity/list`, {
      params: {
        locationName: locationName,
        preferences: preferences,
        startIndex: startIndex
      }
    });
  }


}