export class SignRole {
    signRoleId: number = 0;
    signRoleName: string = '';
    desc: string = '';
    
    constructor(init: SignRole) {
        Object.assign(this, init);
    }
}
  