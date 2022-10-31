import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HandleContext } from '@cg/ng-httphandler';
import { ProcessState } from '@page/enums/process-state.enum';
import { Agreement } from '@page/models/agreement.model';
import { PageService } from '@page/services/page.service';
import { Observable, of, switchMap, tap } from 'rxjs';


@Component({
  selector: 'app-create-ws-result',
  templateUrl: './create-ws-result.component.html',
  styleUrls: ['./create-ws-result.component.scss']
})
export class CreateWsResultComponent implements OnInit {

  CREAT_WS_STATUS: typeof ProcessState = ProcessState;

  @Input() agreements: Agreement[] = [];
  @Output() sEditorAgreement = new EventEmitter<Agreement[]>();

  selection = new SelectionModel<Agreement>(true, []);

  displayedColumns: string[] = [
    "select",
    "index",
    "name",
    "status"
  ];

  constructor(
    private pageService: PageService
  ) { }

  ngOnInit(): void {
    console.log(this.agreements);
    this.selection.changed.pipe(
      switchMap(() => of(this.selection.selected))
    ).subscribe({
      next: selected => {
        this.sEditorAgreement.emit(selected);
      }
    });
  }

  retryCreateWs(agreement: Agreement): void {
    agreement.status = ProcessState.PROCRSSING;
    this.pageService.createWsByCuzIdWithVal(agreement.templateUid, agreement.additionInfo, agreement.workstageSignKey)
    .subscribe({
      next: rst => {
        agreement.status = ProcessState.SUCCESS;
        agreement.wsId = rst.data?.['workstage_id'];
      },
      error: (error: HandleContext) => {
        agreement.status = ProcessState.ERROR;
        agreement.errorMsg = error.errorMessage;
        console.log(error);
      }
    });
  }

  openeEditor(agreement: Agreement): void {
    const url = this.pageService.getOpenEditorUrl(agreement.wsId);
    window.open(url, '_blank');
  }

  isAllSelected(): boolean {
    return this.agreements.length === this.selection.selected.length
  }

  masterToggle(): void {
    this.isAllSelected() ? this.selection.clear() : this.agreements.forEach(agre => this.selection.select(agre))
  }

}
