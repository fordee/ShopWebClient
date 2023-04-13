import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-products-footer',
  templateUrl: 'products-footer.component.html'
})
export class ProductsFooterComponent implements OnInit {

  // @Output() columnsCountChange = new EventEmitter<number>();
  @Output() itemsCountChange = new EventEmitter<number>();
  // @Output() sortChange = new EventEmitter<string>();
  @Output() pageIndexChange = new EventEmitter<number>();
  
  productCountSubscription: Subscription | undefined

  sort = 'asc';
  itemsShowCount = 12;

  length = 0;
  pageSize = 12;
  pageIndex = 0;
  pageSizeOptions = [3, 4, 6, 12];

  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = false;
  disabled = false;

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    this.getProductCount();
  }

  // onColumnsUpdated(colsNum: number): void {
  //   this.columnsCountChange.emit(colsNum);
  // }


  getProductCount(): void {    
    this.productCountSubscription = this.storeService.getProductCount()
      .subscribe({
        next: (_productCount)=> {this.length = _productCount;},
        //error: (err)=>{console.log('error', err); this.router.navigate(['/auth']);},
        complete:()=>{}
      });
  }

  handlePageEvent(pageEvent: PageEvent): void {

    if (this.itemsShowCount != pageEvent.pageSize) {
      this.itemsShowCount = pageEvent.pageSize;
      this.pageSize = pageEvent.pageSize;
      console.log('page size: ' + this.pageSize);
      console.log('itemsShowCount: ' + this.itemsShowCount);
      this.itemsCountChange.emit(this.itemsShowCount);
    }
    if (this.pageIndex != pageEvent.pageIndex) {
      this.pageIndex = pageEvent.pageIndex;
      this.pageIndexChange.emit(this.pageIndex);
    }
  }

}
