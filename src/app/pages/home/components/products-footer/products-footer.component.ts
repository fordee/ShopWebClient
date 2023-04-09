import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-products-footer',
  templateUrl: 'products-footer.component.html'
})
export class ProductsFooterComponent implements OnInit {

  // @Output() columnsCountChange = new EventEmitter<number>();
  @Output() itemsCountChange = new EventEmitter<number>();
  // @Output() sortChange = new EventEmitter<string>();
  @Output() pageIndexChange = new EventEmitter<number>();
  
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

  constructor() { }

  ngOnInit(): void {
  }

  // onColumnsUpdated(colsNum: number): void {
  //   this.columnsCountChange.emit(colsNum);
  // }

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
