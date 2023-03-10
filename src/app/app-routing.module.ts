import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CartComponent } from './pages/cart/cart.component';
import { AuthComponent } from './pages/auth/auth.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { OrderSummaryComponent } from './pages/order.summary/order.summary.component';

const routes: Routes = [{
  path: 'home',
  component: HomeComponent
},
{
  path: 'orders',
  component: OrdersComponent
},
{
  path: 'cart',
  component: CartComponent
},
{
  path: 'auth',
  component: AuthComponent
},
{
  path: 'summary',
  component: OrderSummaryComponent
},
{
  path: '', redirectTo: 'home', pathMatch: 'full'
},];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
