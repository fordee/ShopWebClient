import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, catchError, exhaustMap, Observable, shareReplay, Subscription, take, tap, throwError } from 'rxjs';
import { Cart, MongoItem, Order, StatusFilter, StatusItemsUpdate, StatusUpdate, Token } from '../models/cart.model';
import { AuthService } from './auth.service';
import { MongoId } from '../models/product.model';
import { environment } from 'src/environments/environment';

const STORE_BASE_API = environment.apiURL + '/api/mongo'


@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart = new BehaviorSubject<Cart>({status: 'open', items: [], paymentMethod: 'cash'});
  order: Order | undefined;

  paymentMethod: string = 'cash';
  notes: string = "";

  // orderSubscription: Subscription | undefined;
  // itemSubscription: Subscription | undefined;

  constructor(private _snackBar: MatSnackBar, private http: HttpClient, private authService: AuthService) {}

   getAllOrders(): Observable<Array<Order>> {//<Order>> {
    const statusFilter = new StatusFilter(['open']);
    const httpOptions = {headers: new HttpHeaders({'Content-Type':  'application/json'})};
    
    return this.authService.user.pipe(take(1), exhaustMap(user => {
      httpOptions.headers = httpOptions.headers.set('Authorization', 'BEARER ' + user.token);
      return this.http.get<Array<Order>>(`${STORE_BASE_API}/orders/` + user.reservationId + '/open', httpOptions);
      //return this.http.request('GET', `${STORE_BASE_API}/orders/` + user.reservationId, httpOptions);// {body: statusFilter, headers: httpOptions.headers} );//<Array<Order>>(`${STORE_BASE_API}/orders/` + user.reservationId, httpOptions);
    }));
  }

  patchItemToOrder(item: MongoItem, order: Order | null): void {
    if (order?._id?.$oid) { 
      const httpOptions = {headers: new HttpHeaders({'Content-Type':  'application/json'})};
      const path = `${STORE_BASE_API}/orders/` + order?._id.$oid + '/addOrderItem';
      this.authService.user.pipe(take(1), exhaustMap(user => {
        httpOptions.headers = httpOptions.headers.set('Authorization', 'BEARER ' + user.token);
        return this.http.patch<MongoItem>(path, item)})); 
    } else {// TODO: if there is no existing order
    }
  }

  updatePaymentMethod(paymentMethod: string) {
    this.paymentMethod = paymentMethod;
  }

  updateOrderItems(): void {
    if (this.order?._id?.$oid) { 
      const path = `${STORE_BASE_API}/orders/` + this.order?._id.$oid + '/updateStatusItems';
      this.cart.value.paymentMethod = this.paymentMethod;
      this.http.patch<MongoItem>(path, this.cart.value).subscribe((_item) => {
        // console.log('PATCH')
        // console.log(_item);
      }) ;
    } else { // TODO: if there is no existing order
      const timeElapsed = Date.now();
      const today = new Date(timeElapsed);
      const newOrder = new Order(undefined, this.authService.user.value.reservationId, 'open', this.cart.value.items, {'$date': today.toISOString()}, undefined, false, this.paymentMethod, this.notes);
      const path = `${STORE_BASE_API}/orders/`;
      this.http.post<Order>(path, newOrder).subscribe(_order => {
        this.order = _order;
      });
    }
  } 
  
  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

  addToCart(item: MongoItem, order: Order | null): void {
    const items = [...this.cart.value.items];
    const itemInCart = items.find((_item) => _item.product._id.$oid === item.product._id.$oid);
    if (itemInCart) {
      itemInCart.quantity += 1;
    } else {
      items.push(item);
    }

    this.cart.next({status: 'open', items: items, paymentMethod: undefined});
    this._snackBar.open( item.product.name + ' added to cart.', 'Ok', { duration: 3000 });
    this.updateOrderItems();
  }

  getTotal(items: Array<MongoItem>): number {
    return items.map((item) => item.price * item.quantity )
      .reduce((prev, current) => prev + current, 0);
  }

  clearCart(): void {
    this.cart.next({status: 'open', items: [], paymentMethod: undefined });
    if (this.order) {
      this.updateOrderItems();
    }
    this._snackBar.open('Cart is cleared.', 'Ok', {duration: 3000});
  }

  removeFromCart(item: MongoItem, update = true): Array<MongoItem> {
    const filteredItems: Array<MongoItem> = this.cart.value.items.filter(
      (_item) => _item.product._id !== item.product._id
    );

    if (update) {
      this.cart.next({status: 'open', items: filteredItems, paymentMethod: undefined});
      this._snackBar.open('1 item has been removed from cart.', 'Ok', {duration: 3000});
    }
    if (this.order) {
        this.updateOrderItems();
    }
    return filteredItems;
  }

  removeQuantity(item: MongoItem): void {
    let itemForRemoval: MongoItem | undefined;
    let filteredItems = this.cart.value.items.map((_item) => {  
      if (_item.product._id === item.product._id) {
        _item.quantity--;
        if (_item.quantity === 0) {
          itemForRemoval = _item;
        }
      }
      return _item;
    });

    if (itemForRemoval) {
      //console.log(itemForRemoval);
      filteredItems = this.removeFromCart(itemForRemoval, true);
      //console.log(filteredItems);
    } else {
      this.updateOrderItems();
    }
    this.cart.next({status: 'open', items: filteredItems, paymentMethod: undefined});
    //console.log(this.cart);
    this._snackBar.open('1 item revomved from cart.', 'Ok', { duration: 3000});
  }

  submitOrder(): void {
    //const statusUpdate = new StatusUpdate('submitted');
    const statusItemsUpdate = new StatusItemsUpdate('submitted', this.cart.value.items, this.paymentMethod);
    if (this.order) {
      const path = `${STORE_BASE_API}/orders/` + this.order?._id?.$oid + '/updateStatusItems';
      this.http.patch<Order>(path, statusItemsUpdate).subscribe(_order => {
        this.cart.next({status: 'submitted', items: [], paymentMethod: this.paymentMethod});;
        this._snackBar.open('Your order was submitted.', 'Ok', {duration: 3000});
        this.order = undefined;
      });
    }
  }
  
}
