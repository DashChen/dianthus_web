import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HandleContext } from '@cg/ng-httphandler';
import { LocalizationService } from '@cg/ng-localization';
import { ProcessState } from '@page/enums/process-state.enum';
import { Workstage } from '@page/models/workstage.model';
import { PageService } from '@page/services/page.service';

@Component({
  selector: 'app-finish-ws-dialog',
  templateUrl: './finish-ws-dialog.component.html',
  styleUrls: ['./finish-ws-dialog.component.scss']
})
export class FinishWsDialogComponent implements OnInit {

  PROCESS_STATE: typeof ProcessState = ProcessState;
  
  allState = ProcessState.PROCRSSING;
  finishedCoint = 0;
  successFinishWs = 0;
  errorFinishWs = 0;

  displayedColumns: string[] = [
    "index",
    "name",
    "status"
  ];

  constructor(
    private dialogRef: MatDialogRef<FinishWsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public workstages: Workstage[],
    private pageService: PageService,
    private translate: LocalizationService
  ) { }

  ngOnInit(): void {
    if (this.workstages === undefined || this.workstages.length === 0) {
      console.error('[FinishWsDialogComponent]: workstages is undefined or empty.');
      this.dialogRef.close();
    }

    this.workstages.forEach((ws, index) => {
      this.pageService.finishWorkstage(ws.workstageId).subscribe({
        next: () => {
          ws.status = this.PROCESS_STATE.SUCCESS;
          this.successFinishWs = this.successFinishWs + 1;
          this.finishedCoint = this.finishedCoint + 1;
          if (this.finishedCoint === this.workstages.length) {
            this.allState = ProcessState.END;
          }
        },
        error: (error: HandleContext) => {
          ws.status = this.PROCESS_STATE.ERROR;
          ws.errorMsg = error.errorMessage ?? '';
          this.errorFinishWs = this.errorFinishWs + 1;
          this.finishedCoint = this.finishedCoint + 1;
          if (this.finishedCoint === this.workstages.length) {
            this.allState = ProcessState.END;
          }
        }
      });
    });
  }
  
  close(): void {
    this.dialogRef.close(0);
  }
}

