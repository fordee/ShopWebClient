import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { delay, Subscription } from 'rxjs';
import { Cart, MongoItem, Order } from 'src/app/models/cart.model';
import { Product } from 'src/app/models/product.model';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { StoreService } from 'src/app/services/store.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart = {status: 'open', items: [], paymentMethod: undefined};

  //orders: Array<Order> | undefined;
  //orderSubscription: Subscription | undefined;
  cartSubscription: Subscription | undefined;
  imagePath = '';
  mobile = false;

  products: Array<Product> | undefined;
  orders: Array<Order> | undefined;

  productSubscription: Subscription | undefined;
  orderSubscription: Subscription | undefined;

  paymentMethod = "Payment Method";

  dataSource: Array<MongoItem> = [];
  displayedColumns: Array<string> = [
    'product',
    'name',
    'price',
    'quantity',
    'total',
    'action',
  ];

  constructor(private cartService: CartService, 
              private router: Router,
              private _snackBar: MatSnackBar,
              private authService: AuthService,
              private storeService: StoreService,
              private responsive: BreakpointObserver) { }

  ngOnInit(): void {
    this.authService.autoLogin();
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
          this.mobile = true;
        }
    
      });
    

    this.imagePath = environment.imagePath;
    
    this.cartSubscription = this.cartService.cart.subscribe((_cart: Cart) => {
      this.cart = _cart;
      this.dataSource = _cart.items;
      //console.log(_cart.items);
    });

    this.authService.autoLogin();
    this.getProducts();
    this.getOrders();
    
    //console.log("cart ngOnInit()");
    
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
  }

  getTotal(items: Array<MongoItem>): number {
    return this.cartService.getTotal(items);
  }

  onClearCart(): void {
    //First, return the stock back to the products.
    for (var item of this.cart.items) {
      var index = this.getIndexOfProduct(item.product);
      if (this.products && index != -1) {
        // Return the quantity back to the stock levels.
        this.products[index].stock += item.quantity;
        this.storeService.updateProduct(this.products[index])
          .subscribe();
      }
    }
    
    this.cartService.clearCart();
  }

  onRemoveFromCart(item: MongoItem): void {
    var index = this.getIndexOfProduct(item.product);
    //console.log('item.quantity: ' + item.quantity);
    if (this.products && index != -1) {
      // Return the quantity back to the stock levels.
      this.products[index].stock += item.quantity;
      this.storeService.updateProduct(this.products[index])
        .subscribe();
    }
    this.cartService.removeFromCart(item, true);
  }

  // onAddQuantity(item: MongoItem): void {
  //   this.cartService.addToCart(item, null);
  // }

  onAddQuantity(item: MongoItem): void {
    const order = (this.orders && this.orders.length > 0) ? this.orders[0] : null;
    // Reduce product stock by 1
    //let index = this.products?.indexOf(item.product); // Doesn't work
    var index = this.getIndexOfProduct(item.product);
 
    if (this.products && index != -1) {
      //console.log(this.products[index].stock)
      if (this.products[index].stock <= 0) {
        this._snackBar.open('There is no stock of that item left. Cannot order anymore.', 'Ok', { duration: 3000});
        return;
      }
      this.products[index].stock--;
      // update product to new stock amount.
      this.storeService.updateProduct(this.products[index])
        .subscribe();
    } else {
      return;
    }
    
    this.cartService.addToCart({
      product: item.product,
      price: item.product.sellingPrice,
      quantity: 1,
    }, order)
  }
  
  onRemoveQuantity(item: MongoItem): void {
    const order = (this.orders && this.orders.length > 0) ? this.orders[0] : null;
    // Reduce product stock by 1
    //let index = this.products?.indexOf(item.product); // Doesn't work
    var index = this.getIndexOfProduct(item.product);
 
    if (this.products && index != -1) {
      //console.log(this.products[index].stock)
      this.products[index].stock++;
      // update product to new stock amount.
      this.storeService.updateProduct(this.products[index])
        .subscribe();
    } else {
      return;
    }

    this.cartService.removeQuantity(item);
  }

  onUpdatePaymentMethod(newPaymentMethod: string): void {
    this.paymentMethod = newPaymentMethod;
    this.cartService.paymentMethod = this.paymentMethod
  }

  onSubmitOrder(): void {
    this.cartService.submitOrder();
    delay(1500); // Delay to set the status before we query the order.
    this.router.navigate(["summary", {'id': this.cartService.order?._id?.$oid}])
  }

  getPaymentType(type: string): string {
    switch(type) {
      case 'internetBanking':
        return 'Internet Banking';
      case 'viaAirBnB':
        return 'Pay via AirBnB';
      case 'cash':
        return 'Pay with cash';
      case 'Payment Method':
        return 'Payment Method';
    }
    return ''
  }

  getIndexOfProduct(product: Product): number {
    var index = 0
    if (this.products != undefined) {
      var found = false
      for (var prod of this.products) {
        // console.log(prod._id.$oid);
        // console.log(item.product._id.$oid);
        if (prod._id.$oid == product._id.$oid) {
          found = true;
          //console.log('found!');
          break;
        }
        index++;
      }
      if (!found) {
        index = -1;
      }
    } else {
      return -1;
    }
    return index;
  }

  getProducts(): void {
    this.productSubscription = this.storeService.getAllProducts(1000, 'asc', 0)
      .subscribe({
        next: (_products)=> {this.products = _products;},
        error: (err)=>{console.log('error', err); this.router.navigate(['/auth']);},
        complete:()=>{ }
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
          console.log("No open Order")
        }
      })
  }

}
