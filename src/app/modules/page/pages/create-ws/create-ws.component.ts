import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LocalizationService } from '@cg/ng-localization';
import { CreateWsDialogComponent } from '@page/components/create-ws-dialog/create-ws-dialog.component';
import { ProcessState } from '@page/enums/process-state.enum';
import { Agreement } from '@page/models/agreement.model';
import { PageService } from '@page/services/page.service';


@Component({
  selector: 'app-create-ws',
  templateUrl: './create-ws.component.html',
  styleUrls: ['./create-ws.component.scss']
})
export class CreateWsComponent implements OnInit {

  selectedDoctor: {[key: string]: string | number} = {};
  selectedPatient: {[key: string]: string | number} = {};
  additionInfo: {[key: string]: string | number} = {};
  selectedAgreements: Agreement[] = [];
  opAgreements: Agreement[] = [];

  canOpenMultiEditor = true;
  showResult = false;

  constructor(
    private dialog: MatDialog,
    private pageService: PageService,
    private translate: LocalizationService
  ) { }

  ngOnInit(): void {
  }

  saveSelectedDoctor(info: {[key: string]: string | number}): void {
    // this.selectedDoctor = {...this.selectedDoctor, ...info};
    this.selectedDoctor = info;
    this.combineAdditionInfo(this.selectedDoctor);
  }

  saveSelectedPatient(info: {[key: string]: string | number}): void {
    // this.selectedPatient = {...this.selectedPatient, ...info};
    this.selectedPatient = info;
    this.combineAdditionInfo(this.selectedPatient);
  }

  combineAdditionInfo(info: {[key: string]: string | number}): void {
    this.additionInfo = {...this.additionInfo, ...info};
  }

  saveSelectedAgreements(agreements: Agreement[]): void {
    this.selectedAgreements = agreements.map(a => new Agreement(a));
  }

  saveOpenAgreements(agreements: Agreement[]): void {
    this.opAgreements = agreements;
  }

  createMultiWs(): void {
    let errorMsgs = new Array();
    if (Object.entries(this.selectedDoctor).length === 0) {
      console.log('[同意書起單] 看診資料: ', this.selectedDoctor);
      console.warn('[同意書起單] 請輸入看診資料');
      errorMsgs.push(this.translate.get('Message.error.createWs.requiredDoctorInfo1'));
    }

    if (Object.entries(this.selectedPatient).length === 0) {
      console.log('[同意書起單] 病患資料: ', this.selectedPatient);
      console.warn('[同意書起單] 請輸入病患資料');
      errorMsgs.push(this.translate.get('Message.error.createWs.requiredPatientInfo'));
    }

    if (Object.entries(this.additionInfo).length === 0) {
      console.log('[同意書起單] 病患資料: ', this.additionInfo);
      console.warn('[同意書起單] 請輸入additionInfo');
    }

    if (this.selectedAgreements.length === 0) {
      console.log('[同意書起單] 選擇同意書: ', this.selectedAgreements);
      console.warn('[同意書起單] 請選擇同意書');
      errorMsgs.push(this.translate.get('Message.error.createWs.requiredAgreement'));
    }

    if (errorMsgs.length > 0) {
      const dialogRef = this.dialog.open(CreateWsDialogComponent, {
        width: "400px",
        data: {title: this.translate.get('Message.error.createWs.fail'), errorMsgs: errorMsgs},
        autoFocus: false,
        disableClose: false
      });
      return;
    }
    this.showResult = true;

    this.selectedAgreements.forEach(agreement => {
      agreement.additionInfo = this.additionInfo;
      this.pageService.createWsByCuzIdWithVal(agreement.templateUid, this.additionInfo, agreement.workstageSignKey)
      .subscribe({
        next: rst => {
          agreement.status = ProcessState.SUCCESS;
          agreement.wsId = rst.data?.['workstageId'];
          this.canOpenMultiEditor = false;
        },
        error: error => {
          agreement.status = ProcessState.ERROR;
          agreement.errorMsg = error.errorMessage;
        }
      });
    });
  }

  openMultiEditor(): void {
    this.opAgreements.forEach(agreement => {
      const url = this.pageService.getOpenEditorUrl(agreement.wsId);
      window.open(url);
    });
  }






}
