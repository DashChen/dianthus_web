import { Contact } from "./contact";

export class Patient {
  cname: string = "";
  sex: string = "";
  birth: number = 0;
  pid: string = "";
  bloodType: number = 0;
  phone: string = "";
  address: string = "";
  motherName: string = "";
  contactList: Contact[] = [];
}
