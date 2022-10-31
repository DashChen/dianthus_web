import { AuthToken } from "./auth-token.model";
import { Principal } from "./principal.model";

export class AuthSubject {
    principal: Principal;
    authToken: {[key: string]: AuthToken} = {};
  
    constructor(principal: Principal, authToken: {[key: string]: AuthToken}) {
      this.principal = principal;
      Object.assign(this.authToken, authToken);
    }

    updateAuthToken(param: {[key: string]: AuthToken}): void {
      Object.assign(this.authToken, param);
    }
  
}