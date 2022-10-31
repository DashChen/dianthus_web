import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishWsDialogComponent } from './finish-ws-dialog.component';

describe('FinishWsDialogComponent', () => {
  let component: FinishWsDialogComponent;
  let fixture: ComponentFixture<FinishWsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinishWsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinishWsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
