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

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllProducts(limit=12, sort='d'): Observable<Array<Product>> {
    const httpOptions = {headers: new HttpHeaders({'Content-Type':  'application/json'})};
    return this.authService.user.pipe(take(1), exhaustMap(user => {
      console.log('user: ' + user);
      console.log('reservationId: ' + user.reservationId);
      console.log('token: ' + user.token);
      httpOptions.headers = httpOptions.headers.set('Authorization', 'BEARER ' + user.token);
      return this.http.get<Array<Product>>(`${STORE_BASE_API}/products`, httpOptions);
    }));
  }

  
}
