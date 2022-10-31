import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWsComponent } from './create-ws.component';

describe('CreateWsComponent', () => {
  let component: CreateWsComponent;
  let fixture: ComponentFixture<CreateWsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateWsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
