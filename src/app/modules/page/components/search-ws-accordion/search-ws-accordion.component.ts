import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ActivatedRoute, Params } from '@angular/router';
import { HandleContext } from '@cg/ng-httphandler';
import { LocalizationService } from '@cg/ng-localization';
import { TimePeriod } from '@page/enums/time-period.enum';
import { WsStatus } from '@page/enums/ws-status.enum';
import { CuzWsCondition } from '@page/models/cuz-ws-condition.model';
import { SignRole } from '@page/models/sign-role.model';
import { PageService } from '@page/services/page.service';
import { AreaDept } from '@resolver/models/area-dept.model';
import { AuthService } from '@shared-auth/services/auth.service';
import { Observable, map, catchError, of, switchMap, iif, startWith, finalize } from 'rxjs';
import { Doctor } from '../../models/doctor';
import { Select2OptionData } from "ng-select2";
import { Options } from "select2";
import { PageNewService } from '../../services/page-new.service';
import { AreaDept1 } from '../../models/area-dept1';
import { Tag } from '../../models/tag';


@Component({
  selector: 'app-search-ws-accordion',
  templateUrl: './search-ws-accordion.component.html',
  styleUrls: ['./search-ws-accordion.component.scss']
})
export class SearchWsAccordionComponent implements OnInit {

  @ViewChild(MatExpansionPanel) pannel?: MatExpansionPanel;
  @Output() emitFormVal = new EventEmitter<CuzWsCondition>();

  searchForm: FormGroup;
  timePeriods: string[] = [];
  areaDepts: AreaDept[] = [];

  panelOpenState = false;
  errorMessage = '';

  signRoles$: Observable<SignRole[]> = this.pageService.getSignRoleList().pipe(
    map((resp: HandleContext) => resp.data ?? {}),
    map((data) => (data as { [key: string]: unknown })["value"] ?? {}),
    map((value) => (value as { [key: string]: unknown })["result"] as SignRole[] ?? []),
    catchError((error: HandleContext) => {
      this.errorMessage = this.translate.get('Message.error.Agreement.list', {errorMsg: error.errorMessage});
      return of([]);
    }),
  )

  areaDeptList: AreaDept1[] = [];
  doctorList: Doctor[] = [];

  _areaDeptList: Array<Select2OptionData> = new Array<Select2OptionData>();
  filteredAreaDeptOptions: Observable<Select2OptionData[]> = new Observable<Select2OptionData[]>();

  _doctorList: Array<Select2OptionData> = new Array<Select2OptionData>();
  _doctorList2: Array<Select2OptionData> = new Array<Select2OptionData>();
  filteredDoctorOptions: Observable<Select2OptionData[]> = new Observable<Select2OptionData[]>();

  divNoList: Select2OptionData[] = [];

  options1: Options = {
    theme: "classic",
    width: "300"
  };
  options2: Options = {
    theme: "classic",
    width: "300"
  };

  //tagList: Tag[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    private authService: AuthService,
    private pageService: PageService,
    private translate: LocalizationService,
    private pageNewService: PageNewService
  ) {

    this.areaDepts = this.pageService.areaDepts;
    //const loginedAreaDept = this.areaDepts.find(areaDept => areaDept.label === this.authService.getPrincipal()['areaDept'] as string);
    //console.log(loginedAreaDept);
    this.searchForm = this.fb.group({
      clinicDateStart: [this.getLastWeekDate(), Validators.required],
      clinicDateEnd: [new Date(), Validators.required],
      clinicApn: [TimePeriod.ALL],
      areaDept: ["不拘", Validators.required],
      doctorNo: [" "],
      ptNO: [],
      ptIDNO: [],
      divNo: '0',
      templateName: '',
      status: [WsStatus.ALL]
    });
    Object.values(TimePeriod).forEach(val => {
      this.timePeriods = [...this.timePeriods, ...[val]];
    });

    this.pageNewService.getAreaDeptListApi()
      .pipe(
        finalize(() => {
          this.filteredAreaDeptOptions = this.searchForm.controls['areaDept'].valueChanges.pipe(
            startWith(' '),
            map(value => this._filterAreaDept(value)),
          );
        })
      ).subscribe(
        result => {
          this.areaDeptList = result;
        },
        err => {
          alert(JSON.stringify(err));
        },
        () => {
          this._areaDeptList.push({
            id: "不拘",
            text: "不拘"
          });
          for (let i = 0; i < this.areaDeptList.length; i++) {
            for (let j = 0; j < this.areaDeptList[i].depts.length; j++) {
              this._areaDeptList.push({
                id: this.areaDeptList[i].areaName + '/' + this.areaDeptList[i].depts[j].deptName,
                text: this.areaDeptList[i].areaName + '/' + this.areaDeptList[i].depts[j].deptName
              });
            }
          }
        }
      );

    this.pageNewService.getDoctorListApi()
        .pipe(finalize(() => {
          this.filteredDoctorOptions = this.searchForm.controls['doctorNo'].valueChanges.pipe(
            startWith(' '),
            map(value => this._filterDoctor(value)),
          );
        })).subscribe(
          result => {
            this.doctorList = result.data;
          },
          err => {
            alert(JSON.stringify(err));
          },
          () => {
            this._doctorList.push({
              id: " ",
              text: "不拘"
            });
            for (let i = 0; i < this.doctorList.length ; i++) {
              this._doctorList.push({
                id: this.doctorList[i].doctorName,
                text: this.doctorList[i].doctorName
              });
            }
            this._doctorList2 = this._doctorList;
          }
        );

    this.pageNewService.getDefaultDivNos().subscribe(
      (res) => {
        console.log('getDefaultDivNos', res);
        this.divNoList = res;
      }
    );


    //this.pageNewService.getTagListApi().subscribe(
    //  result => {
    //    for (let i = 0; i < result.data.length; i++) {
    //      this.tagList.push({ checked: false, tagSeq: result.data[i].tagSeq, increseId: result.data[i].increseId, tagName: result.data[i].tagName });
    //    }
    //  },
    //  err => {
    //    alert(JSON.stringify(err));
    //  },
    //  () => {

    //  }
    //);
  }

  _filterAreaDept(value: string): Select2OptionData[] {
    console.log('_filterAreaDept', value);
    if (value.trim().length === 0) {
      return this._areaDeptList;
    }
    return this._areaDeptList.filter(option => option.text.includes(value));
  }

  _filterDoctor (value: string): Select2OptionData[] {
    console.log('_filterDoctor', value);
    if (value.trim().length === 0) {
      return this._doctorList2;
    }
    return this._doctorList2.filter(option => option.text.includes(value));
  }

  ngOnInit(): void {
    const qParam = (Object.entries(this.route.snapshot.queryParams).length > 0) ? this.route.snapshot.queryParams : undefined ; 
    this.initFormValFromRoute(qParam);
    this.searchForm.statusChanges.pipe(
      switchMap(status => iif(() => status === "VALID", of([]), Object.entries(this.searchForm.controls).filter(([key, ctrl]) => ctrl.invalid))),
    ).subscribe({
      next: ctrl => {
        if (ctrl.length === 0) {
          this.errorMessage = '';
        } else {
          this.errorMessage = this.translate.get('Message.notify.' + ctrl[0]);
        }
      }
    });
  }

  initFormValFromRoute(qParam: Params| undefined): void {

    if (qParam === undefined) {
      console.warn('[SearchWsAccordionComponent]: Can not get ptNo or clinicDateRange from queryParam.');
      return;
    }

    this.searchForm.controls['ptNO'].patchValue(qParam['ptNo']);
    const splitDate = qParam['clinicDateRange'].split('-') ?? [];
    const startDate = new Date(splitDate[0]);
    const endDate = new Date(splitDate[1]);
    this.searchForm.controls['clinicDateStart'].patchValue(startDate);
    this.searchForm.controls['clinicDateEnd'].patchValue(endDate);

  }

  getLastWeekDate(): Date {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const day = today.getDate();
    return new Date(year, month, day - 7);
  }

  search(): void {

    this.searchForm.value['areaDept'] = String(this.searchForm.value['areaDept']).trim();
    this.searchForm.value['doctorNo'] = String(this.searchForm.value['doctorNo']).trim();
    //alert(this.searchForm.value['areaDept']);

    const clinicDateStart = this.datepipe.transform(this.searchForm.value['clinicDateStart'], 'yyyy/MM/dd');
    const clinicDateEnd = this.datepipe.transform(this.searchForm.value['clinicDateEnd'], 'yyyy/MM/dd');
    const clinicDate = `${clinicDateStart}-${clinicDateEnd}`;
    const temp = new CuzWsCondition({ClinicDate: clinicDate});
    const status = this.searchForm.value['status'];
    let updateObj = {};

    switch (status) {
      case WsStatus.FINISHED:
        updateObj = {
          processState: '1,2,3,4',
          state: WsStatus.FINISHED + ''
        }
        break;
      case WsStatus.TO_BE_STORE:
        updateObj = {
          processState: '1,2,3,4',
          state: WsStatus.TO_BE_STORE + ''
        }
        break;
      default:
        if (status !== WsStatus.FINISHED && status !== -1) {
          if (Number.isInteger(status)) {
            updateObj = {
              signRoleName: status,
              processState: '1,2'
            }
          } else {
            updateObj = {
              processState: '3',
              state: WsStatus.NORMAL + ''
            }
          }
        }
    }
    temp.updatePartical(updateObj);


    let clinicApn = '';
    if (this.searchForm.value['clinicApn'] !== TimePeriod.ALL) {
      clinicApn = this.searchForm.value['clinicApn'];
      temp.updatePartical({ DIV_NO: clinicApn});
    }
    const areaDept = this.searchForm.value['areaDept'].toString().trim();
    if (areaDept.length > 0 && areaDept.includes('/')) {
      const DIV_NAME = areaDept.split('/');
      // 院區/科別 分拆進 Clinic_Name:XX院 Division_Name:XX科
      temp.updatePartical({
        DIV_NAME: areaDept,
        Clinic_Name: DIV_NAME[0] || '',
        Division_Name: DIV_NAME[1] || '',
      });
    }
    // 診別
    if (this.searchForm.value['divNo'] !== '-1') {
      const Div_No_Name = this.divNoList.find(_item => _item.id === this.searchForm.value['divNo'])?.text;
      temp.updatePartical({
        Div_No_Name: Div_No_Name,
      });
    }
    if (this.searchForm.value['doctorNo'] !== null && this.searchForm.value['doctorNo'].length > 0) {
      temp.updatePartical({doctorNo: this.searchForm.value['doctorNo']});
    }
    if (this.searchForm.value['ptNO'] !== null && this.searchForm.value['ptNO'].length > 0) {
      temp.updatePartical({ptNO: this.searchForm.value['ptNO']});
    }
    if (this.searchForm.value['ptIDNO'] !== null && this.searchForm.value['ptIDNO'].length > 0) {
      temp.updatePartical({ptIDNO: this.searchForm.value['ptIDNO']});
    }
    if (this.searchForm.value['templateName'].length > 0) {
      temp.updatePartical({
        templateName: this.searchForm.value['templateName'],
      });
    }

    //if (this.searchForm.value['keyword'] !== null && this.searchForm.value['keyword'].length > 0) {
    //  temp.updatePartical({ keyword: this.searchForm.value['keyword'] });
    //}

    //if (this.searchForm.value['tags'] !== null && this.searchForm.value['tags'].length > 0) {
    //  temp.updatePartical({ tags: this.searchForm.value['tags'] });
    //}
   
    console.log(temp);
 
    this.emitFormVal.emit(temp);
    this.pannel?.close();
  }


}
