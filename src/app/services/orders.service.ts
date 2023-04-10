import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { exhaustMap, Observable, take } from 'rxjs';
import { Order, StatusUpdate } from '../models/cart.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';


const ORDERS_BASE_API = environment.apiURL + '/api/mongo'

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private http: HttpClient,
              private _snackBar: MatSnackBar,
              private authService: AuthService) { }

  getAllOrders(limit=12, sort='d'): Observable<Array<Order>> {
    const httpOptions = {headers: new HttpHeaders({'Content-Type':  'application/json'})};
    return this.authService.user.pipe(take(1), exhaustMap(user => {
      httpOptions.headers = httpOptions.headers.set('Authorization', 'BEARER ' + user.token);
      return this.http.get<Array<Order>>(`${ORDERS_BASE_API}/orders/` + user.reservationId + '/submitted,delivered,cancelled', httpOptions);
    }));
  }

  getOrder(id: string): Observable<Order> {
    const httpOptions = {headers: new HttpHeaders({'Content-Type':  'application/json'})};
    return this.authService.user.pipe(take(1), exhaustMap(user => {
      httpOptions.headers = httpOptions.headers.set('Authorization', 'BEARER ' + user.token);
      return this.http.get<Order>(`${ORDERS_BASE_API}/orders/order/` + id, httpOptions);
    }));
  }

  updateStatus(order: Order, status: string): void {
    const statusUpdate = new StatusUpdate(status);

    const httpOptions = {headers: new HttpHeaders({'Content-Type':  'application/json'})};
    const path = `${ORDERS_BASE_API}/orders/` + order?._id?.$oid + '/updateStatus';
    console.log(statusUpdate)
    this.http.patch<Order>(path, statusUpdate).subscribe(_order => {
      console.log(_order);
      order.status = 'cancelled';
      this._snackBar.open('Your order was cancelled.', 'Ok', {duration: 3000});
    });
  }
}
