import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { Order } from 'src/app/models/cart.model';
import { Product } from 'src/app/models/product.model';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { StoreService } from 'src/app/services/store.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

const ROWS_HEIGHT: { [id:number]: number } = { 1: 325, 3: 375, 4: 375 };

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  mobile = false;
  cols = 3;
  rowHeight = ROWS_HEIGHT[this.cols];
  category: string | undefined;

  products: Array<Product> | undefined;
  orders: Array<Order> | undefined;

  sort = 'asc';
  count = 12;
  pageIndex = 0;
  
  productSubscription: Subscription | undefined;
  orderSubscription: Subscription | undefined;

  //tokenSubscription: Subscription | undefined;

  constructor(private cartService: CartService, 
              private storeService: StoreService, 
              private _snackBar: MatSnackBar,
              private authService: AuthService,
              private router: Router,
              private responsive: BreakpointObserver) { }

  ngOnDestroy(): void {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.responsive.observe([
      Breakpoints.TabletPortrait,
      Breakpoints.HandsetPortrait,
      Breakpoints.XSmall])
      .subscribe(result => {
        const breakpoints = result.breakpoints;
    
        if (breakpoints[Breakpoints.TabletPortrait]) {
          this.mobile = false;
        }
        else if (breakpoints[Breakpoints.HandsetLandscape]) {
          this.mobile = false;
        } else if (breakpoints[Breakpoints.XSmall]) {
          this.cols = 1;
          this.mobile = true;
        }
    
      });
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
        complete:()=>{}
      });
  }

  getOrders(): void {
    this.orderSubscription = this.cartService.getAllOrders()
      .subscribe(
        (_orders) => {
        this.orders = _orders;
        if (this.orders && this.orders.length > 0) {
          this.cartService.cart.next({status: 'open', items: this.orders[0].items, paymentMethod: undefined});
          this.cartService.order = this.orders[0];
        } else {

        }
      })
  }


  onColumnsCountChange(colsNumber: number): void {
    this.cols = colsNumber;
    this.rowHeight = ROWS_HEIGHT[this.cols];
  }
  
  onPageIndexChange(newPageIndex: number): void {
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
    // Reduce product stock by 1
    let index = this.products?.indexOf(product);

    if (this.products && index != undefined) {
      if (this.products[index].stock <= 0) {
        this._snackBar.open('There is no stock of that item left. Cannot order anymore.', 'Ok', { duration: 3000});
        return;
      }
      this.products[index].stock--;
      // update product to new stock amount.
      this.storeService.updateProduct(this.products[index])
        .subscribe();
    }
    
    this.cartService.addToCart({
      product: product,
      price: product.sellingPrice,
      quantity: 1,
    }, order)
  }

 
}
