import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LocalizationService } from '@cg/ng-localization';
import { debounceTime, distinctUntilChanged, fromEvent } from 'rxjs';
import { AuthService } from '../../../shared/modules/auth/services/auth.service';
import { ProcessState } from '../../enums/process-state.enum';
import { AreaDept1 } from '../../models/area-dept1';
import { Clinic } from '../../models/clinic';
import { ClinicData } from '../../models/clinic-data';
import { Template1 } from '../../models/template1';
import { PageNewService } from '../../services/page-new.service';
import { Select2OptionData } from "ng-select2";
import { Options } from "select2";
import { Doctor } from '../../models/doctor';
import { Consent } from '../../models/consent';
import { Agreement } from '../../models/agreement.model';
import { PageService } from '../../services/page.service';
import { CreateWsDialogComponent } from '../../components/create-ws-dialog/create-ws-dialog.component';
import { Patient } from '../../models/patient';
import { ActivatedRoute, Params } from '@angular/router';
import { Tag } from '../../models/tag';


@Component({
  selector: 'app-create-ws-new',
  templateUrl: './create-ws-new.component.html',
  styleUrls: ['./create-ws-new.component.css']
})
export class CreateWsNewComponent implements OnInit {



  panelOpenState1 = true;
  panelOpenState2 = false;
  panelOpenState3 = false;
  panelOpenState4 = false;

  pid: string = "";
  date1: string = "";
  choiceClass: string = "0";
  choiceDoctor: string = "";

  choiceHospital: string = "";
  keyword: string = "";

  clinicData: ClinicData = new ClinicData();
  patient: Patient = new Patient();


  areaDeptList: AreaDept1[] = [];
  doctorList: Doctor[] = [];

  consentAllList: Consent[] = [];
  consentList: Consent[] = [];
  _consentList: Consent[] = [];
  consentKey: string = "";


  pageIndex = 0;
  pageSize = 10;
  pageLast = 0;
  x = 0;
  y = 0;

  isAllChoice = false;

  _areaDeptList: Array<Select2OptionData> = new Array<Select2OptionData>();
  _doctorList: Array<Select2OptionData> = new Array<Select2OptionData>();
  _doctorList2: Array<Select2OptionData> = new Array<Select2OptionData>();
  options: Options = {
    theme: "classic",
    width: "300",
  };


  selectedDoctor: { [key: string]: string | number } = {};
  selectedPatient: { [key: string]: string | number } = {};
  additionInfo: { [key: string]: string | number } = {};
  selectedAgreements: Agreement[] = [];
  opAgreements: Agreement[] = [];

  canOpenMultiEditor = true;
  showResult = false;

  tagList: Tag[] = [];


  constructor(private pageNewService: PageNewService, private authService: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private pageService: PageService,
    private translate: LocalizationService) {

    this.date1 = this.pageNewService.dateAsYYYYMMDD(new Date());

    this.pageNewService.getAreaDeptListApi().subscribe(
      result => {
        this.areaDeptList = result;
      },
      err => {
        alert(JSON.stringify(err));
      },
      () => {
        for (let i = 0; i < this.areaDeptList.length; i++) {
          for (let j = 0; j < this.areaDeptList[i].depts.length; j++) {

            this._areaDeptList.push({
              id: this.areaDeptList[i].areaName + '/' + this.areaDeptList[i].depts[j].deptName + ':' + this.areaDeptList[i].areaCode,
              text: this.areaDeptList[i].areaName + '/' + this.areaDeptList[i].depts[j].deptName
            });
          }
        }
      }
    );

    this.pageNewService.getDoctorListApi().subscribe(
      result => {
        this.doctorList = result.data;
      },
      err => {
        alert(JSON.stringify(err));
      },
      () => {
        for (let i = 0; i < this.doctorList.length; i++) {
          this._doctorList.push({ id: this.doctorList[i].doctorName, text: this.doctorList[i].doctorName });
        }
        this._doctorList2 = this._doctorList;

      }
    );

    this.pageNewService.getConsentListApi().subscribe(
      result => {
        console.log(result.data);
        for (let i = 0; i < result.data.length; i++) {
          this.consentAllList.push({ checked: false, templateUid: result.data[i].templateUid, templateName: result.data[i].templateName, tags: result.data[i].tags });
        }
      },
      err => {
        alert(JSON.stringify(err));
      },
      () => {
        this.consentList = this.consentAllList.filter(x => x.templateName.indexOf(this.consentKey) >= 0);
        this.pageLast = Math.ceil(this.consentList.length / this.pageSize);
        if (this.consentList.length > 0) {
          this.x = this.pageIndex * this.pageSize + 1;
        }
        if (this.consentList.length < this.pageSize) {
          this.y = this.consentList.length;
        }
        else {
          this.y = this.pageSize;
        }

        for (let i = this.x - 1; i < this.y; i++) {
          this._consentList.push(this.consentList[i]);
        }
      }
    );


    this.pageNewService.getTagListApi().subscribe(
      result => {
        for (let i = 0; i < result.data.length; i++) {
          this.tagList.push({ checked: false, tagSeq: result.data[i].tagSeq, increseId: result.data[i].increseId, tagName: result.data[i].tagName });
        }
      },
      err => {
        alert(JSON.stringify(err));
      },
      () => {
      
      }
    );


  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('ptNo')) {
      this.pid = String(this.route.snapshot.queryParamMap.get('ptNo'));
    }
    if (this.route.snapshot.queryParamMap.get('clinicDate')) {
      this.date1 = String(this.route.snapshot.queryParamMap.get('clinicDate')).replace('/', '-').replace('/', '-');
    }
    if (this.pid && this.date1) {
      this.getClinicData();
    }

  }



  getClinicData() {

    if (this.date1 == "" || this.pid == "") {
      alert("請輸入必填欄位...");
      return;
    }

    let longTime = new Date(this.date1).getTime().toString();
    let pno = "";
    if (this.pid.length < 7) {
      pno = this.pageNewService.leftpad(this.pid, 7);
    }
    else {
      pno = this.pid;
    }
    this.patient = new Patient();
    this.clinicData = new ClinicData();

    this.pageNewService.getPatientApi(pno).subscribe(
      result => {
        this.patient = result.data;
        if (this.patient.sex == "0") {
          this.patient.sex = "男";
        }
        else {
          this.patient.sex = "女";
        }
      },
      err => {
        //err.status
        alert(JSON.stringify(err));
      },
      () => {        
        this.panelOpenState1 = true;
        this.panelOpenState2 = true;
        this.panelOpenState3 = true;
        this.panelOpenState4 = true;

        //alert(this.pageNewService.leftpad(this.pid, 7));
        this.pageNewService.getClinicDataApi(pno, longTime).subscribe(
          result => {
            this.clinicData.medicalRecordsNo = result.data.medicalRecordsNo;
            this.clinicData.patient = result.data.patient;
            this.clinicData.patientId = result.data.patientId;
            this.clinicData.patientPhone = result.data.patientPhone;
            for (let i = 0; i < result.data.clinicList.length; i++) {
              this.clinicData.clinicList.push({
                checked: i == 0 ? true : false,
                doctorName: result.data.clinicList[i].doctorName.split("_")[1],
                diagnosis: result.data.clinicList[i].diagnosis.split("_")[1],
                areaDept: result.data.clinicList[i].areaDept.split("_")[1],
                executionDate: result.data.clinicList[i].executionDate,
                clinicName: result.data.clinicList[i].clinicName.split("_")[1],
                shift: result.data.clinicList[i].shift.split("_")[1],
              })
              if (i == 0) {
                this.choiceHospital = result.data.clinicList[i].areaDept.split("_")[1] + "/" + result.data.clinicList[i].clinicName.split("_")[1];
                alert(this.choiceHospital);
              }
            }
          },
          err => {
            //err.status
            alert(JSON.stringify(err));
          },
          () => {

          }
        );
      }
    );
  



  }

  checked(index: number) {
    for (let i = 0; i < this.clinicData.clinicList.length; i++) {
      if (i != index) {
        this.clinicData.clinicList[i].checked = false;
      }
    }
  }



  searchConsentList() {
    this._consentList = [];
    this.consentList = [];
    this.pageIndex = 0;

    let tempList: any = [];
    let temp: Consent[] = [];
    let isSearchTag = this.tagList.find(x => x.checked == true) ? true : false;

    if (isSearchTag) {
      for (let i = 0; i < this.tagList.length; i++) {
        if (this.tagList[i].checked) {
          temp = [];
          for (let j = 0; j < this.consentAllList.length; j++) {
            let hasTag = this.consentAllList[j].tags.find(x => x.id == this.tagList[i].increseId) ? true : false;

            if (hasTag) {
              if (!temp.find(x => x.templateUid == this.consentAllList[j].templateUid)) {
                temp.push(this.consentAllList[j]);
              }
            }
          }
          tempList.push(temp);
        }
      }      
      for (var i = 0; i < tempList.length; i++) {
        var currentList = tempList[i];
        for (var y = 0; y < currentList.length; y++) {
          var currentValue = currentList[y];
          if (this.consentList.indexOf(currentValue) === -1) {
            var existsInAll = true;
            for (var x = 0; x < tempList.length; x++) {
              if (tempList[x].indexOf(currentValue) === -1) {
                existsInAll = false;
                break;
              }
            }
            if (existsInAll) {
              this.consentList.push(currentValue);
            }
          }
        }
      }
      this.consentList = this.consentList.filter(x => x.templateName.indexOf(this.consentKey) >= 0);
    }
    else {
      this.consentList = this.consentAllList.filter(x => x.templateName.indexOf(this.consentKey) >= 0);
    }


    this.pageLast = Math.ceil(this.consentList.length / this.pageSize);
    if (this.consentList.length > 0) {
      this.x = this.pageIndex * this.pageSize + 1;
    }
    if (this.consentList.length < this.pageSize) {
      this.y = this.consentList.length;
    }
    else {
      this.y = this.pageSize;
    }

    for (let i = this.x - 1; i < this.y; i++) {
      this._consentList.push(this.consentList[i]);
    }
  }



  changeSize() {
    this._consentList = [];
    this.pageIndex = 0;

    this.pageLast = Math.ceil(this.consentList.length / this.pageSize);
    if (this.consentList.length > 0) {
      this.x = this.pageIndex * this.pageSize + 1;
    }
    if (this.consentList.length < this.pageSize) {
      this.y = this.consentList.length;
    }
    else {
      this.y = this.pageSize;
    }

    for (let i = this.x - 1; i < this.y; i++) {
      this._consentList.push(this.consentList[i]);
    }

  }

  changeIndex(index: number) {
    this._consentList = [];

    this.pageIndex = index;

    this.x = this.pageIndex * this.pageSize + 1;

    if (this.consentList.length < (this.pageIndex + 1) * this.pageSize) {
      this.y = this.consentList.length;
    }
    else {
      this.y = (this.pageIndex + 1) * this.pageSize;
    }

    for (let i = this.x - 1; i < this.y; i++) {
      this._consentList.push(this.consentList[i]);
    }

  }

  changeAllChoice() {
    for (let i = 0; i < this.consentList.length; i++) {
      this.consentList[i].checked = this.isAllChoice;
    }
  }


  saveSelectedDoctor(info: { [key: string]: string | number }): void {
    // this.selectedDoctor = {...this.selectedDoctor, ...info};
    console.log("saveSelectedDoctor");
    console.log(info);
    this.selectedDoctor = info;
    this.combineAdditionInfo(this.selectedDoctor);
  }

  saveSelectedPatient(info: { [key: string]: string | number }): void {
    // this.selectedPatient = {...this.selectedPatient, ...info};
    console.log("saveSelectedPatient");
    console.log(info);
    this.selectedPatient = info;
    this.combineAdditionInfo(this.selectedPatient);
  }

  combineAdditionInfo(info: { [key: string]: string | number }): void {
    console.log("combineAdditionInfo");
    console.log(info);
    this.additionInfo = { ...this.additionInfo, ...info };
  }

  saveSelectedAgreements(agreements: Agreement[]): void {
    console.log("saveSelectedAgreements");
    console.log(agreements);
    this.selectedAgreements = agreements.map(a => new Agreement(a));
  }

  saveOpenAgreements(agreements: Agreement[]): void {
    console.log("saveOpenAgreements");
    console.log(agreements);
    this.opAgreements = agreements;
  }

  createMultiWs(): void {
    //let errorMsgs = new Array();
    //if (Object.entries(this.selectedDoctor).length === 0) {
    //  console.log('[同意書起單] 看診資料: ', this.selectedDoctor);
    //  console.warn('[同意書起單] 請輸入看診資料');
    //  errorMsgs.push(this.translate.get('Message.error.createWs.requiredDoctorInfo1'));
    //}

    //if (Object.entries(this.selectedPatient).length === 0) {
    //  console.log('[同意書起單] 病患資料: ', this.selectedPatient);
    //  console.warn('[同意書起單] 請輸入病患資料');
    //  errorMsgs.push(this.translate.get('Message.error.createWs.requiredPatientInfo'));
    //}

    //if (Object.entries(this.additionInfo).length === 0) {
    //  console.log('[同意書起單] 病患資料: ', this.additionInfo);
    //  console.warn('[同意書起單] 請輸入additionInfo');
    //}

    //if (this.selectedAgreements.length === 0) {
    //  console.log('[同意書起單] 選擇同意書: ', this.selectedAgreements);
    //  console.warn('[同意書起單] 請選擇同意書');
    //  errorMsgs.push(this.translate.get('Message.error.createWs.requiredAgreement'));
    //}

    //if (errorMsgs.length > 0) {
    //  const dialogRef = this.dialog.open(CreateWsDialogComponent, {
    //    width: "400px",
    //    data: { title: this.translate.get('Message.error.createWs.fail'), errorMsgs: errorMsgs },
    //    autoFocus: false,
    //    disableClose: false
    //  });
    //  return;
    //}

    //********************

    if (!this.choiceHospital) {
      alert("請選擇院所 / 科別");
      return;
    }
    if (!this.pid) {
      alert("請填寫病歷號碼");
      return;
    }
    if (!this.date1) {
      alert("請填寫看診日期");
      return;
    }
    if (!this.clinicData.medicalRecordsNo) {
      alert("無病患基本資料");
      return;
    }

    this.selectedAgreements = [];
    for (let i = 0; i < this.consentAllList.length; i++) {
      if (this.consentAllList[i].checked) {
        this.selectedAgreements.push({
          templateName: this.consentAllList[i].templateName, templateUid: this.consentAllList[i].templateUid, status: 1, wsId: '', errorMsg: '', additionInfo: {}, workstageSignKey: this.choiceHospital.split(':')[1]
        });
      }
    }

    if (this.selectedAgreements.length <= 0) {
      alert("請至少選擇一份同意書");
      return;
    }

    let docName = "";
    if (this.clinicData.clinicList.length > 0) {
      docName = this.clinicData.clinicList.filter(x => x.checked == true)[0].doctorName;
    }
    else {
      docName = this.choiceDoctor;
    }

    let divno = "0";
    if (this.clinicData.clinicList.length > 0) {
      divno = this.clinicData.clinicList.filter(x => x.checked == true)[0].shift;
      if (divno == "早班") {
        divno = "1";
      }
      else if (divno == "中班") {
        divno = "2";
      }
      else if (divno == "午班") {
        divno = "3";
      }
      else if (divno == "晚班") {
        divno = "4";
      }
      else if (divno == "夜班") {
        divno = "5";
      }
      else {
        divno = "0";
      }
    }
    else {
      divno = this.choiceClass;
    }


    if (!docName) {
      alert("請填寫看診資料");
      return;
    }


    this.showResult = true;

    this.additionInfo = {
      doctorNo: docName,
      clinicDate: this.date1.replace('-', '/').replace('-', '/'),
      DIV_NO: divno,
      DIV_NAME: this.choiceHospital.split(':')[0],
      ptNO: this.clinicData.medicalRecordsNo,
      ptName: this.clinicData.patient,
      ptGender: this.patient.sex,
      ptBirth: this.pageNewService.dateAsYYYYMMDD2(new Date(this.patient.birth)),
      ptIDNO: this.clinicData.patientId,
      ptBlood: this.patient.bloodType,
      ptContractNum: this.patient.phone,
      ptAddress: this.patient.address,
      mName: this.patient.motherName,
      contractName1: '',
      contractNum1: '',
      contractRela1: '',
      motherName: this.patient.motherName,
    }
    console.log("*******************************************");
    console.log("*******************************************");
    console.log("*******************************************");
    console.log("*******************************************");
    console.log(this.selectedAgreements);
    console.log(this.additionInfo);

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

  clearConsent(index: number) {
    this.consentList[index].checked = false;
  }


}
