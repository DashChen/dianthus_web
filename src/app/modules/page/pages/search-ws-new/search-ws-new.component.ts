import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HandleContext } from '@cg/ng-httphandler';
import { LocalizationService } from '@cg/ng-localization';
import { FinishWsDialogComponent } from '@page/components/finish-ws-dialog/finish-ws-dialog.component';
import { SignStatus } from '@page/enums/sign-status.enum';
import { WsStatus } from '@page/enums/ws-status.enum';
import { CuzWsCondition } from '@page/models/cuz-ws-condition.model';
import { Workstage } from '@page/models/workstage.model';
import { PageService } from '@page/services/page.service';
import { PageChangeEvent } from '@shared-table/models/page-change-event.model';
import { BehaviorSubject, catchError, combineLatest, filter, iif, map, Observable, of, shareReplay, skip, switchMap, tap, throwError } from 'rxjs';


@Component({
  selector: 'app-search-ws-new',
  templateUrl: './search-ws-new.component.html',
  styleUrls: ['./search-ws-new.component.css']
})
export class SearchWsNewComponent implements OnInit {


  WS_STATE: typeof WsStatus = WsStatus;
  SIGN_STATE: typeof SignStatus = SignStatus;

  errorMessage = '';
  showResult = false;

  refresh$ = new BehaviorSubject<boolean>(false);

  selection = new SelectionModel<Workstage>(true, []);
  searchCondition$ = new BehaviorSubject<CuzWsCondition>(new CuzWsCondition());
  pagination$ = new BehaviorSubject<PageChangeEvent>({
    pageIndex: 0,
    pageSize: 10
  });
  displayedColumns: string[] = [
    "select",
    "name",
    "ptNo",
    "ptInfo",
    "createTime",
    "status",
    "action"
  ];
  wsQuery$ = combineLatest([this.pagination$, this.searchCondition$, this.refresh$]).pipe(
    skip(1),
    // tap(([page, condition]) => console.log(condition)),
    switchMap(([page, condition]) =>
      this.pageService.getCuzWsPageList(condition, {
        pageIndex: page.pageIndex,
        pageSize: page.pageSize,
      })
    ),
    map((resp: HandleContext) => resp.data ?? {}),
    tap(() => this.showResult = true),
    catchError((error: HandleContext) => {
      this.errorMessage = this.translate.get('Message.error.SignSearch.list', { errorMsg: error.errorMessage });
      return of([]);
    }),
    shareReplay(1)
  );

  wsList$ = this.wsQuery$.pipe(
    map((data) => (data as { [key: string]: unknown })["workstages"] as Workstage[] ?? []),
    tap((data) => {
      // console.log('wsList', data, this.selectedItems);
      // 找出已選
      if (this.selectedItems.length > 0) {
        const selected: Workstage[] = [];
        data.forEach(_item => {
          const index = this.selectedItems.findIndex(_sI => _sI.workstageId === _item.workstageId);
          if (index > -1) {
            selected.push(_item);
          }
        });
        if (selected.length > 0) {
          this.selection.select(...selected);
        }
      }
    }),
    shareReplay(1)
  );

  canFinishedWs$ = this.wsList$.pipe(
    map(ws => ws.filter(w => w.workstageSignStatus === SignStatus.SIGNED && w.workstageStatus === WsStatus.NORMAL))
  )

  wsTotal$ = this.wsQuery$.pipe(
    map((data) => (data as { [key: string]: unknown })["amount"] as number ?? 0)
  );

  disOpenLinkStatus = [this.WS_STATE.FINISHED, this.WS_STATE.REJECTED, this.WS_STATE.DELETED];
  selectedItems: Workstage[] = [];

  constructor(
    private dialog: MatDialog,
    private pageService: PageService,
    private translate: LocalizationService
  ) {


  }

  ngOnInit(): void {

  }

  search(condition: CuzWsCondition): void {
    // 搜尋後清除已選
    this.selectedItems = [];
    this.selection.clear();
    this.searchCondition$.next(condition);
    this.pagination$.next({
      pageIndex: 0,
      pageSize: this.pagination$.value.pageSize ?? 10,
    });
  }

  changePage(event: PageChangeEvent): void {
    this.selection.clear();
    this.pagination$.next({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
  }

  isAllSelected(): Observable<boolean> {
    return (
      this.canFinishedWs$.pipe(
        switchMap((list: Workstage[]) => {
          // console.log('isAllSelected', list.length, this.selection.selected.length);
          return of(list.length === this.selection.selected.length);
        })
      ) ?? of(false)
    );
  }

  masterToggle(): void {
    this.isAllSelected()
      .pipe(
        switchMap((isAllSelected: boolean) =>
          iif(
            () => isAllSelected === false,
            of(isAllSelected),
            throwError(isAllSelected)
          )
        ),
        switchMap(() => this.canFinishedWs$)
      )
      .subscribe({
        next: (list: Workstage[]) => {
          list.forEach(_item => {
            const index = this.selectedItems.findIndex(_sI => _sI.workstageId === _item.workstageId);
            if (index < 0) {
              this.selectedItems.push(_item);
            }
          });
          this.selection.select(...list);
        },
        error: () => {
          this.selection.selected.forEach(_item => {
            const index = this.selectedItems.findIndex(_sI => _sI.workstageId === _item.workstageId);
            if (index > -1) {
              this.selectedItems.splice(index, 1);
            }
          });
          this.selection.clear();
        },
      });
  }

  changeCheck(event: any, element: Workstage) {
    if (event) {
      this.selection.toggle(element);
      this.selectedItems.push(element);
    } else {
      const index = this.selectedItems.findIndex(_sI => _sI.workstageId === element.workstageId);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      }
    }
  }

  getSelectedCheckBoxes(): Workstage[] {
    return this.selection.selected;
  }

  refresh(): void {
    this.refresh$.next(true);
    this.selectedItems = [];
    this.selection.clear();
    this.pagination$.next({
      pageIndex: 0,
      pageSize: this.pagination$.value.pageSize ?? 10,
    });
  }

  finishWs(workstage: Workstage): void {
    this.openFinishWsDiaolog([new Workstage(workstage)]);
  }

  finishMultiWs(): void {
    if (this.selectedItems.length === 0) {
      return;
    }
    const fWs = this.selectedItems.map(select => new Workstage(select));
    this.openFinishWsDiaolog(fWs);
  }

  openFinishWsDiaolog(workstages: Workstage[]): void {
    const dialogRef = this.dialog.open(FinishWsDialogComponent, {
      width: "675px",
      data: workstages,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().pipe(
      tap(() => this.selection.clear()),
      tap(resp => console.log(resp)),
      filter(resp => resp === 0)
    ).subscribe(() => {
      this.refresh();
    });
  }

  openeEditor(ws: Workstage): void {
    const url = this.pageService.getOpenEditorUrl(ws.workstageId);
    window.open(url, '_blank');
  }

  downloadWS(ws: Workstage): void {
    this.pageService.downloadWS(ws.workstageId).subscribe({
      next: rst => {
        const url = window.URL.createObjectURL(rst as Blob);
        const data = new Blob([rst as Blob], { type: 'application/pdf' });
        const a = document.createElement('a');

        a.setAttribute('download', `${ws.workstageId}.pdf`);
        a.href = url;
        document.body.appendChild(a);

        window.requestAnimationFrame(function () {
          const event = new MouseEvent('click');
          a.dispatchEvent(event);
          document.body.removeChild(a);
        });
      },
      error: error => {
        console.error(error);
      }
    })
  }
}
