import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    //'reservationId',
    'status',
    'submittedTime',
    'deliveredTime',
    //'paid',
    //'itemsCount',
    'actions'
  ];

  orderSubscription: Subscription | undefined;
  constructor(private authService: AuthService, private ordersService: OrdersService, private router: Router) { }

  ngOnInit(): void {
    this.authService.autoLogin();
    this.getOrders();
  }

  getOrders(): void {
    this.orderSubscription = this.ordersService.getAllOrders()
      .subscribe({
        next: (_orders) => {this.orders = _orders;},
        error: (err)=>{console.log('error', err); this.router.navigate(['/auth']);},
        complete:()=>{}
      });
  }

  getDeliveredDate(deliveredTime: MongoDate | undefined ): string {
    if (deliveredTime === undefined) {
      return '';
    } else {
      return deliveredTime.$date;
    }
  }

  onOrderSummaryView(id: string) {
    this.router.navigate(['/summary', {'id': id}])
  }

}
