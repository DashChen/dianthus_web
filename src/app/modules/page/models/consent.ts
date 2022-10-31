

export class Consent {
  checked: boolean = false;
  templateUid: string = "";
  templateName: string = "";
  tags: Tagg[] = [];
}


export class Tagg {
  checked: boolean = false;
  tagSeq: number = 0;
  id: number = 0;
  tagName: string = "";
}
