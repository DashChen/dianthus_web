import { Principal } from "./principal.model";

export class AuthToken {
  accessToken = '';
  refreshToken = '';
  tokenType = '';
  expiresIn: number | undefined; // unit: second
  scope: {permissionName: string, permissionClass: string}[] = [];
  userInfo: { [key: string]: unknown } = {};

  constructor(init?: AuthToken) {
    Object.assign(this, init);
  }

  updateProperty(init: AuthToken): void {
    Object.assign(this, init);
  }

  clearProperty(): void {
    this.accessToken = '';
    this.refreshToken = '';
    this.tokenType = '';
    this.expiresIn = undefined;
    this.scope = [];
    this.userInfo = {};

  }

}


  