import { ProcessState } from "@page/enums/process-state.enum";

export class Agreement {
  templateName: string = '';
  templateUid: string = '';
  status: number = ProcessState.PROCRSSING;
  additionInfo: { [key: string]: string | number } = {};
  wsId: string = '';
  errorMsg: string = '';
  workstageSignKey: string = '';

  constructor(init: Agreement) {
    Object.assign(this, init);
  }

}
