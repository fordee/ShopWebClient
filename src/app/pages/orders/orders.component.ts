import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Order } from 'src/app/models/cart.model';
import { MongoDate } from 'src/app/models/product.model';
import { AuthService } from 'src/app/services/auth.service';
import { OrdersService } from 'src/app/services/orders.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  orders: Array<Order> = [];

  displayedColumns: Array<string> = [
    'id',
    'reservationId',
    'status',
    'submittedTime',
    'deliveredTime',
    'itemsCount'
  ];

  orderSubscription: Subscription | undefined;
  constructor(private authService: AuthService, private ordersService: OrdersService) { }

  ngOnInit(): void {
    this.authService.autoLogin();
    this.getOrders();
  }

  getOrders(): void {
    this.orderSubscription = this.ordersService.getAllOrders()
      .subscribe((_orders) => {
        this.orders = _orders;
        console.log(_orders);
        // if (this.orders && this.orders.length > 0) {
        //   console.log('Order Id: ' + this.orders[0]._id?.$oid);
        //   console.log('Item count: ' + this.orders[0].items.length);
        // } else {
        //   console.log('No orrders');
        // }
      })
  }

  getDeliveredDate(deliveredTime: MongoDate | undefined ): string {
    console.log('getDeliveredDate');
    console.log(deliveredTime);
    if (deliveredTime === undefined) {
      return '';
    } else {
      return deliveredTime.$date;
    }
  }

}
