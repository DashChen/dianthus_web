import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LocalizationService } from '@cg/ng-localization';
import { debounceTime, distinctUntilChanged, finalize, fromEvent, map, Observable, startWith, Subject } from 'rxjs';
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
  styleUrls: ['./create-ws-new.component.scss']
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
  showChoiceDoctorClearBtn: boolean = false;

  choiceHospital: string = "";
  showChoiceHospitalClearBtn: boolean = false;
  keyword: string = "";

  clinicData: ClinicData = new ClinicData();
  patient: Patient = new Patient();


  areaDeptList: AreaDept1[] = [];
  doctorList: Doctor[] = [];

  consentAllList: Consent[] = [];
  consentList: Consent[] = [];
  _consentList: Consent[] = [];
  consentKey: string = "";
  checkedConsetList: Consent[] = [];


  pageIndex = 0;
  pageSize = 10;
  pageLast = 0;
  x = 0;
  y = 0;

  isAllChoice = false;

  _areaDeptList: Array<Select2OptionData> = new Array<Select2OptionData>();
  filteredAreaDeptOptions: Observable<Select2OptionData[]> = new Observable<Select2OptionData[]>();
  areaDept$ = new Subject<string>();
  changeAreaDept(value: string) {
    this.areaDept$.next(value);
    const item = this._areaDeptList.find(_item => _item.id === value);
    this.workstageSignKey = item ? item['areaCode'] : '';
    this.choiceHospital = value || '';
    console.log('changeAreaDept', value, item, this.workstageSignKey, this.choiceHospital);
  }
  _filterAreaDept(value: string): Select2OptionData[] {
    // console.log('_filterAreaDept', value);
    if (value.trim().length === 0) {
      this.showChoiceHospitalClearBtn = false;
      return this._areaDeptList;
    }
    this.showChoiceHospitalClearBtn = true;
    return this._areaDeptList.filter(option => option.text.includes(value));
  }

  clearHospital(inputEl: HTMLInputElement) {
    inputEl.value = '';
    this.choiceHospital = '';
    this.changeAreaDept(this.choiceHospital);
  }

  workstageSignKey: string = '';


  _doctorList: Array<Select2OptionData> = new Array<Select2OptionData>();
  _doctorList2: Array<Select2OptionData> = new Array<Select2OptionData>();
  filteredDoctorOptions: Observable<Select2OptionData[]> = new Observable<Select2OptionData[]>();
  doctor$ = new Subject<string>();
  changeDocotr(value: string) {
    this.choiceDoctor = value || '';
    this.doctor$.next(this.choiceDoctor);
  }

  _filterDoctor(value: string): Select2OptionData[] {
    // console.log('_filterDoctor', value);
    if (value.trim().length === 0) {
      this.showChoiceDoctorClearBtn = false;
      return this._doctorList2;
    }
    this.showChoiceDoctorClearBtn = true;
    return this._doctorList2.filter(option => option.text.includes(value));
  }

  clearDoctor(inputEl: HTMLInputElement) {
    inputEl.value = '';
    this.choiceDoctor = '';
    this.changeDocotr(this.choiceDoctor);
  }

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
  divNoList: Select2OptionData[] = [];
  selectedDivNo: string = '0';

  selectDivNo(event: Event) {
    // console.log('selectDivNo', event);
    this.selectedDivNo = (event.target as HTMLSelectElement).value;
  }


  constructor(
    private pageNewService: PageNewService,
    private authService: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private pageService: PageService,
    private translate: LocalizationService) {

    this.date1 = this.pageNewService.dateAsYYYYMMDD(new Date());

    this.pageNewService.getAreaDeptListApi()
      .pipe(
        finalize(() => {
          this.filteredAreaDeptOptions = this.areaDept$.pipe(
            startWith(''),
            map(value => this._filterAreaDept(value)),
          );
        })
      )
      .subscribe(
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
                id: this.areaDeptList[i].areaName + '/' + this.areaDeptList[i].depts[j].deptName,
                text: this.areaDeptList[i].areaName + '/' + this.areaDeptList[i].depts[j].deptName,
                ...this.areaDeptList[i]
              });
            }
          }
        }
      );

    this.pageNewService.getDoctorListApi()
      .pipe(
        finalize(() => {
          this.filteredDoctorOptions = this.doctor$.pipe(
            startWith(''),
            map(value => this._filterDoctor(value)),
          );
        })
      )
    .subscribe(
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

    this.pageNewService.getDefaultDivNos().subscribe(
      (res) => {
        console.log('getDefaultDivNos', res);
        this.divNoList = res;
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
        // 取回看診資料
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
                this.changeAreaDept(result.data.clinicList[i].areaDept.split("_")[1] + "/" + result.data.clinicList[i].clinicName.split("_")[1]);
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

  changeCheck(e: any, item: Consent) {
    console.log('changeCheck', e, item);
    item.checked = e;
    if (e) {
      this.checkedConsetList.push(item);
    } else {
      const index = this.checkedConsetList.findIndex(_item => _item.templateUid === item.templateUid);
      if (index > -1) {
        this.checkedConsetList.splice(index, 1);
      }
    }
  }

  changeClinicData(index: number) {
    for (let i = 0; i < this.clinicData.clinicList.length; i++) {
      if (i != index) {
        this.clinicData.clinicList[i].checked = false;
      }
    }
    // 變更同意書院所及科別
    const focusItem = this.clinicData.clinicList[index];
    // console.log(focusItem);
    this.changeAreaDept(focusItem.checked ? (focusItem.areaDept + "/" + focusItem.clinicName) :'');
  }

  // 搜尋同意書
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
    // 改為當前頁面
    for (let i = (this.pageIndex * this.pageSize); i < ((this.pageIndex + 1) * this.pageSize); i++) {
      if (this.consentList[i]) {
        this.consentList[i].checked = this.isAllChoice;
        if (this.isAllChoice) {
          this.checkedConsetList.push(this.consentList[i]);
        } else {
          const index = this.checkedConsetList.findIndex(_item => _item.templateUid === this.consentList[i].templateUid);
          if (index > -1) {
            this.checkedConsetList.splice(index, 1);
          }
        }
      }
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

    this.checkedConsetList.forEach(_item => {
      this.selectedAgreements.push({
        templateName: _item.templateName,
        templateUid: _item.templateUid,
        status: 1,
        wsId: '',
        errorMsg: '',
        additionInfo: {},
        workstageSignKey: this.workstageSignKey
      });
    });

    if (this.selectedAgreements.length <= 0) {
      alert("請至少選擇一份同意書");
      return;
    }

    let docName = "";
    if (this.clinicData.clinicList.length > 0) {
      docName = this.clinicData.clinicList.filter(x => x.checked == true)[0].doctorName;
    } else {
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
      // console.log(docName, this.choiceDoctor);
      alert("請填寫看診資料");
      return;
    }

    if (!this.selectedDivNo || this.selectedDivNo == '-1') {
      alert("請選擇診別");
      return;
    }


    this.showResult = true;

    // 新增 Div_No_Name 診別
    const Div_No_Name = this.divNoList.find(_item => _item.id === this.selectedDivNo)?.text;
    // 院區/科別 分拆進 Clinic_Name:XX院 Division_Name:XX科
    const DIV_NAME = this.choiceHospital.split(':')[0];
    this.additionInfo = {
      doctorNo: docName,
      clinicDate: this.date1.replace('-', '/').replace('-', '/'),
      DIV_NO: divno,
      DIV_NAME: DIV_NAME,
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
      Div_No_Name: Div_No_Name || '',
      Clinic_Name: DIV_NAME.split('/')[0] || '',
      Division_Name: DIV_NAME.split('/')[1] || ''
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
    const deleted = this.checkedConsetList.splice(index, 1);
    const i = this.consentList.findIndex(_item => _item.templateUid === deleted[0].templateUid);
    if (i > -1) {
      const nItem = this.consentList[i];
      nItem.checked = false;
      this.consentList.splice(i, 1, nItem);
    }
  }
}
