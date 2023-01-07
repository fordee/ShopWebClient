import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { Order } from 'src/app/models/cart.model';
import { Product } from 'src/app/models/product.model';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StoreService } from 'src/app/services/store.service';

const ROWS_HEIGHT: { [id:number]: number } = { 1: 400, 3: 335, 4: 350 };

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  cols = 3;
  rowHeight = ROWS_HEIGHT[this.cols];
  category: string | undefined;

  products: Array<Product> | undefined;
  orders: Array<Order> | undefined;

  sort = 'asc';
  count = 3;
  pageIndex = 0;
  
  productSubscription: Subscription | undefined;
  orderSubscription: Subscription | undefined;

  //tokenSubscription: Subscription | undefined;

  constructor(private cartService: CartService, 
              private storeService: StoreService, 
              private loggingService: LoggingService,
              private authService: AuthService,
              private router: Router) { }

  ngOnDestroy(): void {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.authService.autoLogin();
    this.getProducts();
    this.getOrders();
    //console.log('home onInit: ' + this.orders?.length);
  }

  getProducts(): void {
    this.productSubscription = this.storeService.getAllProducts(this.count, this.sort, this.pageIndex, this.category)
      .subscribe({
        next: (_products)=> {this.products = _products;},
        error: (err)=>{console.log('error', err); this.router.navigate(['/auth']);},
        complete:()=>console.log('complete')
      });
      // .subscribe(
      //   (_products) => {
      //   this.products = _products;
      // }, error=> { console.log("error: "); console.log(error)})

  }

  getOrders(): void {
    this.orderSubscription = this.cartService.getAllOrders()
      .subscribe(
        (_orders) => {
        this.orders = _orders;
        if (this.orders && this.orders.length > 0) {
          console.log('Order Id: ' + this.orders[0]._id?.$oid);
          console.log('Item count: ' + this.orders[0].items.length);
          this.cartService.cart.next({status: 'open', items: this.orders[0].items, paymentMethod: undefined});
          this.cartService.order = this.orders[0];
        } else {
          console.log('No orrders');
        }
      })
  }


  onColumnsCountChange(colsNumber: number): void {
    this.cols = colsNumber;
    this.rowHeight = ROWS_HEIGHT[this.cols];
  }
  
  onPageIndexChange(newPageIndex: number): void {
    console.log('onPageIndexChange');
    this.pageIndex = newPageIndex;
    this.getProducts();
  }

  onItemsCountChange(newCount: number): void {
    this.count = newCount;
    this.getProducts();
  }

  onSortChange(newSort: string): void {
    this.sort = newSort; 
    this.getProducts();
  }

  onShowCategory(newCategory: string): void {
    this.category = newCategory;
    
    this.getProducts();
  }

  onAddToCart(product: Product): void {
    const order = (this.orders && this.orders.length > 0) ? this.orders[0] : null;

    console.log(product._id);
    this.cartService.addToCart({
      product: product,
      price: product.sellingPrice,
      quantity: 1,
    }, order)
  }

 
}
