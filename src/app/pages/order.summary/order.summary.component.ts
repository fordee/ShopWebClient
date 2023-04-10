import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MongoItem, Order } from 'src/app/models/cart.model';
import { Product } from 'src/app/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { OrdersService } from 'src/app/services/orders.service';
import { StoreService } from 'src/app/services/store.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order.summary',
  templateUrl: './order.summary.component.html',
})
export class OrderSummaryComponent implements OnInit, OnDestroy {

  orderSubscription: Subscription | undefined;
  order: Order | undefined;
  id: string | null = null;
  imagePath = ''

  products: Array<Product> | undefined;

  productSubscription: Subscription | undefined;

  displayedColumns: Array<string> = [
    'image',
    'quantity',
    'price',
  ];


  constructor(private route: ActivatedRoute, 
              private router: Router,
              private ordersService: OrdersService, 
              private cartService: CartService,
              private storeService: StoreService) { }

  ngOnInit(): void {
     this.id = this.route.snapshot.paramMap.get('id');
     this.imagePath = environment.imagePath
     this.getOrder()
     this.getProducts();
  }

  ngOnDestroy(): void {
      if (this.orderSubscription) {
        this.orderSubscription.unsubscribe();
      }
      if (this.productSubscription) {
        this.productSubscription.unsubscribe();
      }
  }

  cancelOrder(): void {
    console.log(this.order);
    if (this.order != undefined) {
      this.ordersService.updateStatus(this.order, 'cancelled');
    }
  }

  getOrder(): void {
    if (this.id) {
    this.orderSubscription = this.ordersService.getOrder(this.id)
      .subscribe((_order) => {
        this.order = _order;
      })
    }
  }

  getPaymentType(type: string): string {
    switch(type) {
      case 'internetBanking':
        return 'Internet Banking'
      case 'viaAirBnB':
        return 'Pay via AirBnB'
      case 'cash':
        return 'Pay with cash'
    }
    return ''
  }

  getTotal(items: Array<MongoItem>): number {
    return this.cartService.getTotal(items);
  }

  getProducts(): void {
    this.productSubscription = this.storeService.getAllProducts(1000, 'asc', 0)
      .subscribe({
        next: (_products)=> {this.products = _products;},
        error: (err)=>{console.log('error', err); this.router.navigate(['/auth']);},
        complete:()=>{ }
      });
  }

}
