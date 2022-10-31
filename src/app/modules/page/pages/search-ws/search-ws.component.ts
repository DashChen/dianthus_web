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
  selector: 'app-search-ws',
  templateUrl: './search-ws.component.html',
  styleUrls: ['./search-ws.component.scss']
})
export class SearchWsComponent implements OnInit {

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
      this.errorMessage = this.translate.get('Message.error.SignSearch.list', {errorMsg: error.errorMessage});
      return of([]);
    }),
    shareReplay(1)
  );

  wsList$ = this.wsQuery$.pipe(
    map((data) => (data as { [key: string]: unknown })["workstages"] as Workstage[] ?? []),
    shareReplay(1)
  );

  canFinishedWs$ = this.wsList$.pipe(
    map(ws => ws.filter(w => w.workstageSignStatus === SignStatus.SIGNED && w.workstageStatus === WsStatus.NORMAL))
  )

  wsTotal$ = this.wsQuery$.pipe(
    map((data) => (data as { [key: string]: unknown })["amount"] as number ?? 0)
  );

  constructor(
    private dialog: MatDialog,
    private pageService: PageService,
    private translate: LocalizationService
  ) {
   

  }

  ngOnInit(): void {

  }

  search(condition : CuzWsCondition): void {
    this.searchCondition$.next(condition);
    this.pagination$.next({
      pageIndex: 0,
      pageSize: this.pagination$.value.pageSize ?? 10,
    });
  }

  changePage(event: PageChangeEvent): void {
    this.pagination$.next({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
  }

  isAllSelected(): Observable<boolean> {
    return (
      this.canFinishedWs$.pipe(
        switchMap((list: Workstage[]) =>
          of(list.length === this.selection.selected.length)
        )
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
          this.selection.select(...list);
        },
        error: () => this.selection.clear(),
      });
  }

  getSelectedCheckBoxes(): Workstage[] {
    return this.selection.selected;
  }

  refresh(): void {
    this.refresh$.next(true);

    this.pagination$.next({
      pageIndex: 0,
      pageSize: 10,
    });
  }

  finishWs(workstage: Workstage): void {
    this.openFinishWsDiaolog([new Workstage(workstage)]);
  }

  finishMultiWs(): void {
    if (this.selection.selected.length === 0) {
      return;
    }
    const fWs = this.selection.selected.map(select => new Workstage(select))
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
