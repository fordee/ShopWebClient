import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MongoItem, Order } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';
import { OrdersService } from 'src/app/services/orders.service';
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

  displayedColumns: Array<string> = [
    'image',
    'name',
    'quantity',
    'price',
  ];


  constructor(private route: ActivatedRoute, private ordersService: OrdersService, private cartService: CartService) { }

  ngOnInit(): void {
     this.id = this.route.snapshot.paramMap.get('id');
     console.log(this.id);
     this.imagePath = environment.imagePath
     this.getOrder()
  }

  ngOnDestroy(): void {
      if (this.orderSubscription) {
        this.orderSubscription.unsubscribe();
      }
  }

  getOrder(): void {
    console.log('getOrder');
    if (this.id) {
    this.orderSubscription = this.ordersService.getOrder(this.id)
      .subscribe((_order) => {
        this.order = _order;
        console.log(_order);
        console.log('got Order');
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

}
