import { Injectable } from '@angular/core';
import { NgConfigService } from '@cg/ng-config';
import { AreaDept } from '@resolver/models/area-dept.model';

@Injectable()
export class ResolverService {

  _areaDepts: AreaDept[] = [];

  constructor(
    private configService: NgConfigService
  ) { }

  getAreaDept(): AreaDept[] {
    if (this._areaDepts.length !== 0) {
      return this._areaDepts;
    }
    const temp = this.configService.get('areaDept') as {
      areaCode: string,
      areaName: string,
      depts: { deptCode: string, deptName: string }[]
    }[];
    // Todo: 判斷是不是空的，如果是空的，呼叫第三方API
    if (temp.length === 0) {
      console.warn('[ResolverService]: get area dept response is empty.');
    }

    temp.forEach(araes => {
      araes.depts.forEach(dept => {
        const select = new AreaDept({label: `${araes.areaName}/${dept.deptName}`, value: dept.deptCode});
        this._areaDepts = [...this._areaDepts, ...[select]];
      });
    });

    this._areaDepts = [... this._areaDepts, ...[new AreaDept({label: `不拘`, value: '0'})]]

    return this._areaDepts;
  }
}
