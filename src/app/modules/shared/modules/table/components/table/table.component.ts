import { AfterContentInit, AfterViewInit, Component, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, ViewChild } from '@angular/core';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatRowDef, MatColumnDef, MatTable } from '@angular/material/table';
import { LocalizationService } from '@cg/ng-localization';
import { PageChangeEvent } from '@shared-table/models/page-change-event.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

type PaginatorPosition = "BOTH" | "BEFORE" | "AFTER" | "NONE";


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, AfterContentInit, AfterViewInit {

  @ContentChildren(MatRowDef) rowDefs!: QueryList<MatRowDef<unknown>>;
  @ContentChildren(MatColumnDef) columnDefs!: QueryList<MatColumnDef>;
  @ViewChild(MatTable, {static: true}) table!: MatTable<unknown>;

  @Input() dataList: unknown[] | null = null;
  @Input() displayedColumns!: string[];
  @Input() refresh$?: BehaviorSubject<boolean>;

  @Input() showPaginator?: PaginatorPosition;
  @Input() total?: number | null = this.total ?? 0;
  @Input() pageIndex?: number = this.pageIndex ?? 0;
  @Input() pageSize?: number = this.pageSize ?? 10;

  @Output() pageChange = new EventEmitter<PageChangeEvent>();

  refreshSubscription: Subscription | undefined;

  constructor(
    private matPaginatorIntl: MatPaginatorIntl,
    private translate: LocalizationService
  ) { }


  ngOnInit(): void {
    this.dataList = this.dataList ?? [];
    if (this.total === 0) {
      this.showPaginator = "NONE";
    }

    if (this.refresh$) {
      this.subscribeRefresh();
    }

  }

  ngAfterContentInit(): void {
    this.columnDefs.forEach(columnDef => this.table.addColumnDef(columnDef));
    this.rowDefs.forEach(rowDef => this.table.addRowDef(rowDef));
  }

  ngAfterViewInit(): void {
    this.matPaginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
      if (length === 0 || pageSize === 0) {
        return this.translate.get('general.pageCount', {startIndex: 0, endIndex: 0, total: 0});
      }

      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return this.translate.get('general.pageCount', {startIndex: (startIndex + 1), endIndex: endIndex, total: length});
    };
    this.matPaginatorIntl.itemsPerPageLabel =  this.translate.get('general.perPage');
    this.matPaginatorIntl.nextPageLabel =  this.translate.get('general.nextPage');
    this.matPaginatorIntl.previousPageLabel =  this.translate.get('general.previousPage');
    this.matPaginatorIntl.firstPageLabel = this.translate.get('general.firstPage');
    this.matPaginatorIntl.lastPageLabel = this.translate.get('general.lastPage');
  }

  changePage(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    });
  }

  subscribeRefresh(): void {
    this.refreshSubscription = this.refresh$!.pipe(
      filter(isRefresh => isRefresh),
    ).subscribe({next: () => this.dataList = []});
  }

  ngOnDestory(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

}
