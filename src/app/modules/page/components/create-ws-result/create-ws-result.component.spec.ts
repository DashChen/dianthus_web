import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWsResultComponent } from './create-ws-result.component';

describe('CreateWsResultComponent', () => {
  let component: CreateWsResultComponent;
  let fixture: ComponentFixture<CreateWsResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateWsResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWsResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
