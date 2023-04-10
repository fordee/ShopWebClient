import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { exhaustMap, Observable, Subscription, take } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { ProductBoxComponent } from '../pages/home/components/product-box/product-box.component';
import { Router } from '@angular/router';

//const STORE_BASE_API = '/api/mongo'
const STORE_BASE_API = environment.apiURL +  '/api/mongo'

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  pageNumber: number = 0;
  productCount: number = 1;

  constructor(private http: HttpClient, 
              private authService: AuthService,
              private router: Router) { 

  }

  getAllProducts(limit=12, sort: string, pageIndex: number, category?: string): Observable<Array<Product>> {
    const httpOptions = {headers: new HttpHeaders({'Content-Type':  'application/json'})};
    const categoryQuery = category ? '/?category=' + category : '';
    return this.authService.user.pipe(take(1), exhaustMap(user => {
      //console.log("user.token: " + user.token)
      httpOptions.headers = httpOptions.headers.set('Authorization', 'BEARER ' + user.token);
      return this.http.get<Array<Product>>(`${STORE_BASE_API}/products/paged/` + sort + '/' + limit + '/' + pageIndex + categoryQuery, httpOptions);
    }));
  }

  getProductCount(): Observable<number> {
    const httpOptions = {headers: new HttpHeaders({'Content-Type':  'application/json'})};
    return this.authService.user.pipe(take(1), exhaustMap(user => {
      httpOptions.headers = httpOptions.headers.set('Authorization', 'BEARER ' + user.token);
      return this.http.get<number>(`${STORE_BASE_API}/products/productCount/`, httpOptions);
    }));
  }

  updateProduct(product: Product): Observable<Object> {
    const httpOptions = {headers: new HttpHeaders({'Content-Type':  'application/json'})};
    const path = `${STORE_BASE_API}/products/` + product?._id.$oid;
    return this.authService.user.pipe(take(1), exhaustMap(user => {
      httpOptions.headers = httpOptions.headers.set('Authorization', 'BEARER ' + user.token);
      return this.http.patch(path, product)
    })); 
    
  }

}
