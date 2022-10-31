import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchWsAccordionComponent } from './search-ws-accordion.component';

describe('SearchWsAccordionComponent', () => {
  let component: SearchWsAccordionComponent;
  let fixture: ComponentFixture<SearchWsAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchWsAccordionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchWsAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
