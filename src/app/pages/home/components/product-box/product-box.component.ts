import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-box',
  templateUrl: './product-box-component.html', 
})
export class ProductBoxComponent implements OnInit {
  @Input() fullWidthMode = false;
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
  constructor() { }

  ngOnInit(): void {
    this.apiPath = environment.apiURL;
    this.imagePath = environment.imagePath;
  }

  onAddToCart(): void {
   //console.log(this.product);
    this.addToCart.emit(this.product);
  }

}
