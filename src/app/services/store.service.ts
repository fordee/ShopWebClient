import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { exhaustMap, Observable, take } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

//const STORE_BASE_API = '/api/mongo'
const STORE_BASE_API = environment.apiURL +  '/api/mongo'

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  pageNumber: Number = 0;

  productCount: Number = 1;
  
  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllProducts(limit=12, sort: string, pageIndex: number, category?: string): Observable<Array<Product>> {
    console.log('category1: ' + category);
    const httpOptions = {headers: new HttpHeaders({'Content-Type':  'application/json'})};
    const categoryQuery = category ? '/?category=' + category : '';
    console.log('categoryQuery: ' + categoryQuery);
    return this.authService.user.pipe(take(1), exhaustMap(user => {
      console.log('sort: ' + sort);
      console.log('reservationId: ' + user.reservationId);
      console.log('token: ' + user.token);
      httpOptions.headers = httpOptions.headers.set('Authorization', 'BEARER ' + user.token);
      console.log(`${STORE_BASE_API}/products/paged/` + sort + '/' + limit + '/' + pageIndex + categoryQuery);
      return this.http.get<Array<Product>>(`${STORE_BASE_API}/products/paged/` + sort + '/' + limit + '/' + pageIndex + categoryQuery, httpOptions);
    }));
  }

  getProductCount(): Observable<number> {
    const httpOptions = {headers: new HttpHeaders({'Content-Type':  'application/json'})};
    return this.authService.user.pipe(take(1), exhaustMap(user => {
      httpOptions.headers = httpOptions.headers.set('Authorization', 'BEARER ' + user.token);
      console.log(`${STORE_BASE_API}/products/productCount`);
      return this.http.get<number>(`${STORE_BASE_API}/products/productCount/`, httpOptions);
    }));
  }
}
