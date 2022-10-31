export class CuzWsCondition {
  ClinicDate: string = '';

  //clinicApn?: string;
  DIV_NO?: string;

  //areaDept?: string;
  DIV_NAME?: string;

  doctorNo?: string;
  ptNO?: string;
  ptIDNO?: string;
  state?: string;
  processState?: string;
  signRoleName?: string;

  orderBy: string = 'createTime';
  orderType: "desc" | "asc" = "desc";

  //keyword?: string;
  //tags?: string;



  constructor(init?: Partial<CuzWsCondition>) {
    Object.assign(this, init);
  }

  updatePartical(init: Partial<CuzWsCondition>) {
    Object.assign(this, init);
  }
}
