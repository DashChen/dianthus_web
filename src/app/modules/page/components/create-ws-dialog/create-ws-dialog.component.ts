import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalizationService } from '@cg/ng-localization';

@Component({
  selector: 'app-create-ws-dialog',
  templateUrl: './create-ws-dialog.component.html',
  styleUrls: ['./create-ws-dialog.component.scss']
})
export class CreateWsDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<CreateWsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public errorMsg: {title: string, errorMsgs: String[]},
    private translate: LocalizationService
  ) { }

  ngOnInit(): void {
    if (this.errorMsg.errorMsgs === undefined || this.errorMsg.errorMsgs.length === 0) {
      console.warn('[CreateWsDialogComponent] no error message');
      this.errorMsg.errorMsgs.push(this.translate.get('Message.error.noErrorMsg'));
    }
  }

  close(): void {
    this.dialogRef.close(0);
  }

}
