import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-box',
  templateUrl: './product-box-component.html', 
})
export class ProductBoxComponent implements OnInit {
  @Input() fullWidthMode = false;
  @Input() mobile = false;
  @Input() product: Product | undefined;

  apiPath = '';
  imagePath = '';

  // product: Product | undefined = {
  //   id: "abcd-1233",
  //   title: "Eta Peanuts",
  //   category: "Drinks",
  //   description: "string",
  //   price: 3.50,
  //   image: "https://via.placeholder.com/150",
  // };
  @Output() addToCart = new EventEmitter();
  constructor(private responsive: BreakpointObserver) { }

  ngOnInit(): void {
    this.apiPath = environment.apiURL;
    this.imagePath = environment.imagePath;

    this.responsive.observe([
      Breakpoints.TabletPortrait,
      Breakpoints.HandsetPortrait,
      Breakpoints.XSmall])
      .subscribe(result => {
        console.log("Result");
        console.log(result);
        const breakpoints = result.breakpoints;
    
        if (breakpoints[Breakpoints.TabletPortrait]) {
          console.log("screens matches TabletPortrait");
          this.mobile = false;
        }
        else if (breakpoints[Breakpoints.HandsetLandscape]) {
          console.log("screens matches HandsetLandscape");
          this.mobile = false;
        } else if (breakpoints[Breakpoints.XSmall]) {
          console.log("screens matches XSmall");
          this.mobile = true;
        }
    
      });
  }

  onAddToCart(): void {
   //console.log(this.product);
    this.addToCart.emit(this.product);
  }

}
