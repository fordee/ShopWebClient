import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Cart, MongoItem, Order } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';
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

  //reservationId = "HMRBJSWW93";

  paymentMethod = "Select Payment Method";

  dataSource: Array<MongoItem> = [];
  displayedColumns: Array<string> = [
    'product',
    'name',
    'price',
    'quantity',
    'total',
    'action',
  ];

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.imagePath = environment.imagePath;
    
    this.cartSubscription = this.cartService.cart.subscribe((_cart: Cart) => {
      this.cart = _cart;
      this.dataSource = _cart.items;
      //console.log(_cart.items);
    });
    
    //console.log("cart ngOnInit()");
    
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  getTotal(items: Array<MongoItem>): number {
    return this.cartService.getTotal(items);
  }

  onClearCart(): void {
    this.cartService.clearCart();
  }

  onRemoveFromCart(item: MongoItem): void {
    this.cartService.removeFromCart(item, true);
  }

  onAddQuantity(item: MongoItem): void {
    this.cartService.addToCart(item, null);
  }

  onRemoveQuantity(item: MongoItem): void {
    console.log("onRemoveQuantity");
    console.log(item.product.name);
    this.cartService.removeQuantity(item);
  }

  onUpdatePaymentMethod(newPaymentMethod: string): void {
    this.paymentMethod = newPaymentMethod;
    console.log('Payment method: ' + newPaymentMethod);
  }

  onSubmitOrder(): void {
    console.log('items:');
    console.log(this.cart.items);
    this.cartService.submitOrder();
  }

}
