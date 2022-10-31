import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgConfigService } from '@cg/ng-config';
import { Observable, of } from 'rxjs';
import { AreaDept1 } from '../models/area-dept1';
import { Clinic } from '../models/clinic';
import { Dept } from '../models/dept';
import { History } from '../models/history';
import { Template1 } from '../models/template1';

//@Injectable({
//  providedIn: 'root'
//})
@Injectable()
export class PageNewService {

  
  coreUrl = "";

  constructor(private http: HttpClient, private configService: NgConfigService,) {
    this.coreUrl = this.configService.get('coreUrl');
  }

  dateAsYYYYMMDD(date: any): string {
    return date.getFullYear()
      + '-' + this.leftpad(date.getMonth() + 1, 2)
      + '-' + this.leftpad(date.getDate(), 2);
  }

  dateAsYYYYMMDD2(date: any): string {
    return date.getFullYear()
      + '/' + this.leftpad(date.getMonth() + 1, 2)
      + '/' + this.leftpad(date.getDate(), 2);
  }

  leftpad(val: any, resultLength = 2, leftpadChar = '0'): string {
    return (String(leftpadChar).repeat(resultLength)
      + String(val)).slice(String(val).length);
  }

  getPatientApi(pno: string): Observable<any> {
    return this.http.get<any>(this.coreUrl + '/rest/patient', { params: { pno: pno } })
  }

  getClinicDataApi(pno: string, date1: string): Observable<any> { 
    return this.http.get<any>(this.coreUrl +'/rest/clinicData', { params: { pno: pno, clinicDate: date1 } });
  }


  getAreaDeptListApi() {
    const areaDeptList: AreaDept1[] = this.configService.get('areaDept');    
    const obsofPatient = of(areaDeptList);
    return obsofPatient;
  }

  getDoctorListApi() {
    return this.http.get<any>(this.coreUrl +'/rest/component/doctor');
  }

  getConsentListApi() {
    return this.http.get<any>(this.coreUrl +'/rest/component/consent');
  }

  getTagsConsentListApi() {
    return this.http.get<any>(this.coreUrl + '/rest/component/tags/consent');
  }

  getTagListApi() {
    return this.http.get<any>(this.coreUrl + '/rest/component/consent/tags');
  }

  getHistoryListApi() {
    const historyList: History[] = [
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "1202541", name: "陳先生", idcard: "A12345678", createTime: "2022-09-15 11:15:50", state: "簽署完成" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "2549984", name: "王先生", idcard: "B12356879", createTime: "2022-09-15 11:15:50", state: "待歸檔" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "9846321", name: "李先生", idcard: "V18412151", createTime: "2022-09-15 11:15:50", state: "待病患簽屬" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "3657418", name: "吳小姐", idcard: "T28412251", createTime: "2022-09-15 11:15:50", state: "簽署完成" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "5685479", name: "蔡小姐", idcard: "A22555847", createTime: "2022-09-15 11:15:50", state: "待歸檔" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "4958562", name: "黃小姐", idcard: "B28848938", createTime: "2022-09-15 11:15:50", state: "待病患簽屬" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "9785412", name: "林先生", idcard: "F15896359", createTime: "2022-09-15 11:15:50", state: "簽署完成" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "8898786", name: "張小姐", idcard: "D20588997", createTime: "2022-09-15 11:15:50", state: "待病患簽屬" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "1202541", name: "陳先生", idcard: "A12345678", createTime: "2022-09-15 11:15:50", state: "簽署完成" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "2549984", name: "王先生", idcard: "B12356879", createTime: "2022-09-15 11:15:50", state: "待歸檔" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "9846321", name: "李先生", idcard: "V18412151", createTime: "2022-09-15 11:15:50", state: "待病患簽屬" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "3657418", name: "吳小姐", idcard: "T28412251", createTime: "2022-09-15 11:15:50", state: "簽署完成" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "5685479", name: "蔡小姐", idcard: "A22555847", createTime: "2022-09-15 11:15:50", state: "待歸檔" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "4958562", name: "黃小姐", idcard: "B28848938", createTime: "2022-09-15 11:15:50", state: "待病患簽屬" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "9785412", name: "林先生", idcard: "F15896359", createTime: "2022-09-15 11:15:50", state: "簽署完成" },
      { checked: false, templateName: "看診及收費標準暨自費說明同意書", patientId: "8898786", name: "張小姐", idcard: "D20588997", createTime: "2022-09-15 11:15:50", state: "待病患簽屬" },
    ];
    const obsofPatient = of(historyList);
    return obsofPatient;
  }

 

}
