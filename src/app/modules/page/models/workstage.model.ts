import { ProcessState } from "@page/enums/process-state.enum";

export class Workstage {
    workstageId: string = '';
    templateName: string = '';
    groupName: string = '';
    workstageStatus: number = -1;
    workstageSignStatus: number = -1;
    createTime: number = 0;
    updateTime: number = 0;
    effectiveTime: number = 0;
    signCompleteTime: number = 0;
    finishTime: number = 0;
    rejectTime: number = 0;
    deleteTime: number = 0;
    tobeStoreTime: number = 0;
    storeTime: number = 0;
    customData: {[key: string]: unknown} = {};
    nextSignRole: {
        signRoleName: string ;
        personalId: string;
        personalName: string;
    } = {
        signRoleName: '', personalId: '', personalName: ''
    }
    status: number = ProcessState.PROCRSSING;
    errorMsg: string = '';

    constructor(init: Workstage) {
        Object.assign(this, init);
        this.status = ProcessState.PROCRSSING;
        this.errorMsg = '';
    }
}
  