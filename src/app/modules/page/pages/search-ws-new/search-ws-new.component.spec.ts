import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchWsNewComponent } from './search-ws-new.component';

describe('SearchWsNewComponent', () => {
  let component: SearchWsNewComponent;
  let fixture: ComponentFixture<SearchWsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchWsNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchWsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
