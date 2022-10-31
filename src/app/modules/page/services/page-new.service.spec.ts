import { TestBed } from '@angular/core/testing';

import { PageNewService } from './page-new.service';

describe('PageNewService', () => {
  let service: PageNewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageNewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
