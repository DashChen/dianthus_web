import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWsAccordionComponent } from './create-ws-accordion.component';

describe('CreateWsAccordionComponent', () => {
  let component: CreateWsAccordionComponent;
  let fixture: ComponentFixture<CreateWsAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateWsAccordionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWsAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
