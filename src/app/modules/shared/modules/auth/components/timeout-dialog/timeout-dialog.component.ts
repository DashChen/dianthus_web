import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalizationService } from '@cg/ng-localization';

@Component({
  selector: 'app-timeout-dialog',
  templateUrl: './timeout-dialog.component.html',
  styleUrls: ['./timeout-dialog.component.scss']
})
export class TimeoutDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<TimeoutDialogComponent>,
    // @Inject(MAT_DIALOG_DATA) public errorMsg: {title: string, errorMsgs: String[]},
    private translate: LocalizationService
  ) { }

  ngOnInit(): void {
    // if (this.errorMsg.errorMsgs === undefined || this.errorMsg.errorMsgs.length === 0) {
    //   console.warn('[TimeoutDialogComponent] no error message');
    //   this.errorMsg.errorMsgs.push(this.translate.get('Message.error.noErrorMsg'));
    // }
  }

  close(): void {
    this.dialogRef.close(0);
  }

}
