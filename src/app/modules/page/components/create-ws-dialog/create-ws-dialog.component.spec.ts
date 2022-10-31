import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWsDialogComponent } from './create-ws-dialog.component';

describe('CreateWsDialogComponent', () => {
  let component: CreateWsDialogComponent;
  let fixture: ComponentFixture<CreateWsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateWsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
