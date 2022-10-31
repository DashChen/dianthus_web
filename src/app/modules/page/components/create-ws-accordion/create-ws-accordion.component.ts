import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControlStatus, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HandleContext } from '@cg/ng-httphandler';
import { LocalizationService } from '@cg/ng-localization';
import { BloodType } from '@page/enums/blood-type.enum';
import { ChooseStatus } from '@page/enums/choose-status.enum';
import { Gender } from '@page/enums/gender.enum';
import { TimePeriod } from '@page/enums/time-period.enum';
import { Agreement } from '@page/models/agreement.model';
import { PageService } from '@page/services/page.service';
import { AreaDept } from '@resolver/models/area-dept.model';
import { AuthService } from '@shared-auth/services/auth.service';
import { PageChangeEvent } from '@shared-table/models/page-change-event.model';
import { BehaviorSubject, Observable, filter, switchMap, of, startWith, combineLatest, map, catchError, shareReplay, tap, distinctUntilChanged, debounceTime, Subscription } from 'rxjs';
import { CreateWsDialogComponent } from '@page/components/create-ws-dialog/create-ws-dialog.component';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-create-ws-accordion',
  templateUrl: './create-ws-accordion.component.html',
  styleUrls: ['./create-ws-accordion.component.scss']
})
export class CreateWsAccordionComponent implements OnInit, OnDestroy {

  @Output() emitDoctorForm = new EventEmitter<{[key: string]: string | number}>();
  @Output() emitPatientForm = new EventEmitter<{[key: string]: string | number}>();
  @Output() emitAgreementForm = new EventEmitter<Agreement[]>();

  TIME_PERIOD: typeof TimePeriod = TimePeriod;
  CHOOSE_STATUS: typeof ChooseStatus = ChooseStatus;

  doctorForm: FormGroup;
  patientForm: FormGroup;
  agreementForm: FormGroup;

  doctorValChangedSubscription  : Subscription | undefined = undefined;
  patientValChangedSubscription : Subscription | undefined = undefined;
  ptNoChangedSubscription: Subscription | undefined = undefined;
  selectValChangedSubscription : Subscription | undefined = undefined;


  timePeriods: string[] = [];
  areaDepts: AreaDept[] = [];
  genders: number[] = [];
  bloods: number[] = [];

  loginedAreaDept: AreaDept | undefined;
  errorMessage = '';

  dSatus$: BehaviorSubject<FormControlStatus> = new BehaviorSubject<FormControlStatus>("PENDING");
  dExpansion$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  doctorInfo$: Observable<string> = this.dSatus$.pipe(
    switchMap(status => of(this.changeDoctorInfo(status))),
    startWith('')
  )
  dBtnContent$: Observable<string> = combineLatest([this.dExpansion$, this.dSatus$]).pipe(
    switchMap(([isExpaned, status]) => of(this.changeDoctorBtn({isExpaned: isExpaned, status: status}))),
    startWith(this.translate.get('general.choose'))
  )

  pSatus$: BehaviorSubject<FormControlStatus> = new BehaviorSubject<FormControlStatus>("PENDING");
  pExpansion$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  patientInfo$: Observable<string> = this.pSatus$.pipe(
    switchMap(pSatus => of(this.changePatientInfo(pSatus))),
    startWith('')
  )
  pBtnContent$: Observable<string> = combineLatest([this.pExpansion$, this.pSatus$]).pipe(
    switchMap(([isExpaned, pSatus]) => of(this.changePatientBtn({isExpaned: isExpaned, status: pSatus}))),
    startWith(this.translate.get('History.choosePatient'))
  );

  selection = new SelectionModel<Agreement>(true, []);
  selectionCtrl$ = new BehaviorSubject<FormControlStatus>("PENDING");
  selected$ = new BehaviorSubject<number>(-1);

  aExpansion$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  agreement$: Observable<string> = this.selected$.pipe(
    switchMap(value => of(this.changeAgreementMsg(value))),
    startWith(this.translate.get('History.noAgreement'))
  );
  aBtnContent$: Observable<string> = combineLatest([this.aExpansion$, this.selectionCtrl$]).pipe(
    switchMap(([isExpaned, status]) => of(this.changeAgreementBtn({isExpaned: isExpaned, isFirstTime: status === "PENDING"}))),
    startWith(this.translate.get('History.choose'))
  );


  displayedColumns: string[] = [
    "select",
    // "name",
  ];
  pagination$ = new BehaviorSubject<PageChangeEvent>({
    pageIndex: 0,
    pageSize: 10
  });

  selectAreaDept$ = new BehaviorSubject<string>('');
  agreemetQuery$ = combineLatest([this.pagination$, this.selectAreaDept$]).pipe(
    filter(([page, areaDept]) => areaDept !== ''),
    switchMap(([page]) =>
      this.pageService.getAgreementPageList({
        pageIndex: page.pageIndex,
        pageSize: page.pageSize,
      })
    ),
    map((resp: HandleContext) => resp.data ?? []),
    catchError((error: HandleContext) => {
      this.errorMessage = this.translate.get('Message.error.Agreement.list', {errorMsg: error.errorMessage});
      return of([]);
    }),
    shareReplay(1)
  );

  agreemetList$ = this.agreemetQuery$.pipe(
    map((data) => (data as { [key: string]: unknown })["result"] as Agreement[] ?? []),
    shareReplay(1)
  );

  agreemetTotal$ = this.agreemetQuery$.pipe(
    map((data) => (data as { [key: string]: unknown })["amount"] as number ?? 0)
  );

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    private pageService: PageService,
    private authService: AuthService,
    private translate: LocalizationService
  ) {
    this.doctorForm = this.fb.group({
      clinicDate: [, Validators.required],
      clinicApn: ['', Validators.required],
      areaDept: ['', Validators.required],
      doctorNo: ['']
    });
    this.patientForm = this.fb.group({
      ptNO: ['', Validators.required],
      ptName: [''],
      ptGender: [''],
      ptBirth: [''],
      ptIDNO: [''],
      ptBlood: [''],
      ptContractNum: [''],
      ptAddress: [''],
      mName: [''],
      contractName1: [''],
      contractNum1: [''],
      contractRela1: [''],
    });
    this.agreementForm = this.fb.group({
      areaDept: ['']
    });
    Object.values(TimePeriod).forEach(val => {
      this.timePeriods = [...this.timePeriods, ...[val]];
    });
    Object.values(Gender).filter(val => !isNaN(Number(val))).forEach(val => {
      this.genders = [...this.genders, ...[+val]];
    });
    Object.values(BloodType).filter(val => !isNaN(Number(val))).forEach(val => {
      this.bloods = [...this.bloods, ...[+val]];
    });
    this.areaDepts = this.pageService.areaDepts;
    this.loginedAreaDept = this.areaDepts.find(areaDept => areaDept.label === this.authService.getPrincipal()['areaDept'] as string);
    if (this.loginedAreaDept === undefined) {
      this.loginedAreaDept = this.areaDepts.find(areaDept => areaDept.label === '不拘');
    }
  }

  ngOnInit(): void {
    const qParam = (Object.entries(this.route.snapshot.queryParams).length > 0) ? this.route.snapshot.queryParams : undefined ;

    this.doctorValChangedSubscription = this.doctorForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(()  => {
      this.changeDoctor();
    });

    this.patientValChangedSubscription = this.patientForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(()  => {
      this.changePatient();
    });

    this.selectValChangedSubscription = this.selection.changed.pipe(
      switchMap(() => of(this.selection.selected)),
      tap(selected => this.emitAgreementForm.emit(selected)),
      tap(selected => this.selected$.next(selected.length)),
    ).subscribe({
      next: selected => {
        if (selected.length <= 0) {
          this.selectionCtrl$.next("INVALID");
        } else {
          this.selectionCtrl$.next("VALID");
        }
      }
    });

    this.initDocFormValue();
    this.initFormValFromRoute(qParam);
  }

  ngOnDestroy(): void {
    if (this.doctorValChangedSubscription !== undefined) {
      this.doctorValChangedSubscription.unsubscribe();
    }
    if (this.patientValChangedSubscription !== undefined) {
      this.patientValChangedSubscription.unsubscribe();
    }
    if (this.selectValChangedSubscription !== undefined) {
      this.selectValChangedSubscription.unsubscribe();
    }
    if (this.ptNoChangedSubscription !== undefined) {
      this.ptNoChangedSubscription.unsubscribe();
    }
  }

  initFormValFromRoute(qParam: Params| undefined): void {

    if (qParam === undefined) {
      console.warn('[CreateWsAccordionComponent]: Can not get ptNo 、clinicDate or agreements from queryParam.');
      return;
    }

    if (qParam['ptNo'] !== undefined) {
      this.patientForm.controls['ptNO'].patchValue(qParam['ptNo']);
      this.searchPatient();
    }

    if (qParam['clinicDate'] !== undefined) {
      this.doctorForm.controls['clinicDate'].patchValue(new Date(qParam['clinicDate']));
    }

    const chooseAgreements = qParam['agreements'] as string[] ?? [];
    if (chooseAgreements.length > 0) {
      this.agreementForm.controls['areaDept'].patchValue(this.loginedAreaDept?.value as string);
      this.selectAreaDept$.next(this.loginedAreaDept?.value as string);
      this.agreemetList$.subscribe({
        next: agreements => {
          agreements.forEach(a => {
            if (chooseAgreements.includes(a.templateUid)) {
              this.selection.select(a);
            }
          });
        }
      });
    }

  }

  initDocFormValue(): void {
    const nDate = new Date();
    const nTime = nDate.getHours();
    const initPeriod = this.initTimePeriod(nTime);
    const doctorName = this.authService.getPrincipal()['cname'] as string
    this.doctorForm.setValue({
      clinicDate: nDate,
      clinicApn: initPeriod,
      areaDept: this.loginedAreaDept,
      doctorNo: doctorName
    }, {onlySelf: true});

  }

  initTimePeriod(hour: number): string {
    if (hour >= 13 && hour < 18) {
      return this.TIME_PERIOD.AFTERNOON
    }
    if (hour >= 18 && hour < 22) {
      return this.TIME_PERIOD.NIGHT
    }
    return this.TIME_PERIOD.MORNUNG;
  }


  changeDoctor(isExpaned?: boolean): void {
    if (isExpaned !== undefined) {
      this.dExpansion$.next(isExpaned);
    }

    this.dSatus$.next(this.doctorForm.status);
    if (this.doctorForm.invalid) {
      this.emitDoctorForm.emit({});
      return;
    }

    const clinicDate = (this.datepipe.transform(this.doctorForm.value['clinicDate'], 'yyyy/MM/dd') ?? '');
    let temp = {doctorNo: this.doctorForm.value['doctorNo']};
    if (this.doctorForm.value['clinicApn'] === TimePeriod.ALL) {
      temp = {...temp, ...{clinicApn: ''}};
    }
    temp = {...temp, ...{clinicDate: clinicDate}};
    temp = {...temp, ...{DIV_NO: this.doctorForm.value['areaDept'].value, DIV_NAME: this.doctorForm.value['areaDept'].label}};
    if (this.doctorForm.value['areaDept'].value === '0') {
      temp = {...temp, ...{DIV_NO: '', DIV_NAME: ''}};
    }
    this.emitDoctorForm.emit(temp);
  }

  changeDoctorInfo(status: FormControlStatus): string {
    if (status === "INVALID") {
      return this.translate.get('Message.error.createWs.requiredNotFill');
    }

    const doctor = this.doctorForm.value['doctorNo'];

    if (doctor === '') {
      // return this.translate.get('History.noDoctor');
      return '';
    }
    return this.translate.get('History.doctorInCharge') + ' ' + this.doctorForm.value['doctorNo'];
    //return '';
  }

  changeDoctorBtn(param: {isExpaned: boolean, status: FormControlStatus}): string {

    if (param.status === "PENDING") {
      const doctor = this.doctorForm.value['doctorNo'];
      if (doctor === '') {
        return this.translate.get('general.choose');
      }
      return this.translate.get('general.reChoose');
    }
    if (param.isExpaned === true) {
      return this.translate.get('general.confirm');
    }

    return this.translate.get('general.reChoose');
  }

  changePatient(isExpaned?: boolean): void {
    if (isExpaned !== undefined) {
      this.pExpansion$.next(isExpaned);
    }

    this.pSatus$.next(this.patientForm.status);
    if (this.patientForm.invalid) {
      this.emitPatientForm.emit({});
      return;
    }

    let temp = this.patientForm.value;
    const birth = (this.datepipe.transform(this.patientForm.value['ptBirth'], 'yyyy/MM/dd') ?? '');
    Object.assign(temp, ...[{ptBirth: birth}]);
    this.emitPatientForm.emit(temp);
  }

  changePatientInfo(status: FormControlStatus): string {
    if (status === "INVALID") {
      return this.translate.get('Message.error.template', { msg: this.translate.get('History.noPatient') + '，'  + this.translate.get('Message.notify.ptNO') })
    }

    const ptNo = this.patientForm.value['ptNO'];

    if (ptNo === '') {
      return this.translate.get('History.noPatient');
    }
    return this.patientForm.value['ptNO']+ ' ' + this.patientForm.value['ptName'] + ' ' +
    (this.datepipe.transform(this.patientForm.value['ptBirth'], 'yyyy/MM/dd') ?? '');

  }

  changePatientBtn(param: {isExpaned: boolean, status: FormControlStatus}): void {
    if (param.isExpaned === true) {
      return this.translate.get('general.confirm');
    }

    if (param.status === "PENDING") {
      return this.translate.get('History.choosePatient');
    }

    if (param.status === "INVALID") {
      return this.translate.get('History.choosePatient');
    }

    return this.translate.get('History.reChoose');
  }

  changeAgreement(isExpaned: boolean): void {
    this.aExpansion$.next(isExpaned);
    if (this.selection.selected.length == 0) {
      this.selected$.next(0);
    }
    if (this.agreementForm.invalid) {
      return;
    }
  }

  changeAgreementBtn(param: {isExpaned: boolean, isFirstTime: boolean}): string {
    if (param.isExpaned === true) {
      return this.translate.get('general.confirm');
    }
    if (param.isFirstTime === true) {
      return this.translate.get('general.choose');
    }
    return this.translate.get('general.reChoose');
  }

  changeAgreementMsg(agreementLen: number): string {
    if (agreementLen == -1) {
      return this.translate.get('History.noAgreement', { msgType: 'text--strong' });
    } else if (agreementLen == 0) {
      return this.translate.get('History.noAgreement', { msgType: 'text--warn' });
    } else {
      return this.translate.get('History.selectedAgreement',{amount: agreementLen});
    }
  }

  changeAreaDept(): void {
    this.selectAreaDept$.next(this.agreementForm.value['areaDept']);
  }

  removeAgreement(item: Agreement): void {
    this.selection.deselect(item);
  }

  changePage(event: PageChangeEvent): void {
    this.pagination$.next({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
  }

  searchPatient(): void {
    const ptNo = this.patientForm.value['ptNO'];

    this.pageService.getPatientData(ptNo).pipe(
      map((resp: HandleContext) => resp.data ?? {}),
    ).subscribe({
      next: data => {

        this.patientForm.patchValue({
          ptName: data?.['cname'],
          ptGender: data?.['sex'],
          ptBirth: new Date(data?.['birth']),
          ptIDNO: data?.['pid'],
          ptBlood: data?.['bloodType'],
          ptContractNum: data?.['phone'],
          ptAddress: data?.['address'],
          mName: data?.['motherName'],
          contractName1: data?.['contactList'][0]?.['cname'],
          contractNum1: data?.['contactList'][0]?.['phone'],
          contractRela1: data?.['contactList'][0]?.['relation'],
        });

        if (this.ptNoChangedSubscription === undefined) {
          this.subscribePtNoChange();
        }
  
      },
      error: (error:HandleContext) => {
        const dialogRef = this.dialog.open(CreateWsDialogComponent, {
          width: "400px",
          data: {title: this.translate.get('Message.error.createWs.patientData'), errorMsgs: [error.errorMessage]},
          autoFocus: false,
          disableClose: false
        });
      }
    });

  }

  subscribePtNoChange(): void {
    this.ptNoChangedSubscription = this.patientForm.controls['ptNO'].valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe({
      next: () => {
        this.patientForm.patchValue({
          ptName: '',
          ptGender: '',
          ptBirth: '',
          ptIDNO: '',
          ptBlood:'',
          ptContractNum: '',
          ptAddress: '',
          mName: '',
          contractName1: '',
          contractNum1: '',
          contractRela1: '',
        });
      }
    });
  }
  








}
