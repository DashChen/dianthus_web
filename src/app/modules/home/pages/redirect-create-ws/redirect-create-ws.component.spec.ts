import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectCreateWsComponent } from './redirect-create-ws.component';

describe('RedirectCreateWsComponent', () => {
  let component: RedirectCreateWsComponent;
  let fixture: ComponentFixture<RedirectCreateWsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedirectCreateWsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectCreateWsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
