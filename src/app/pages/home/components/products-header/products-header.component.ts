import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-products-header',
  templateUrl: 'products-header.component.html',
})
export class ProductsHeaderComponent implements OnInit {
  @Output() columnsCountChange = new EventEmitter<number>();
  @Output() itemsCountChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() pageIndexChange = new EventEmitter<number>();
  
  sort = 'asc';
  itemsShowCount = 3;

  length = 0;
  pageSize = 3;
  pageIndex = 0;
  pageSizeOptions = [3, 4, 6, 12];

  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = false;
  disabled = false;

  productCountSubscription: Subscription | undefined

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    this.getProductCount();
  }

  getProductCount(): void {
    this.productCountSubscription = this.storeService.getProductCount()
      .subscribe({
        next: (_productCount)=> {this.length = _productCount; console.log('productCount: ' + _productCount) },
        //error: (err)=>{console.log('error', err); this.router.navigate(['/auth']);},
        complete:()=>console.log('complete')
      });
  }

  onSortUpdated(newSort: string): void {
    this.sort = newSort;
    this.sortChange.emit(newSort);
  }

  onItemsUpdated(newItemsCount: number): void {
    this.itemsShowCount = newItemsCount;
    this.itemsCountChange.emit(newItemsCount);
  }

  onColumnsUpdated(colsNum: number): void {
    this.columnsCountChange.emit(colsNum);
  }

  handlePageEvent(pageEvent: PageEvent): void {
    console.log('PageEvent')
    
    
    
    if (this.itemsShowCount != pageEvent.pageSize) {
      console.log('pageSize: ' + pageEvent.pageSize)
      this.itemsShowCount = pageEvent.pageSize;
      this.itemsCountChange.emit(this.itemsShowCount);
    }
    if (this.pageIndex != pageEvent.pageIndex) {
      
      this.pageIndex = pageEvent.pageIndex;
      this.pageIndexChange.emit(this.pageIndex);
      console.log('pageIndex: ' + this.pageIndex)
    }
  }

}
