import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginedLayoutComponent } from './logined-layout.component';

describe('LoginedLayoutComponent', () => {
  let component: LoginedLayoutComponent;
  let fixture: ComponentFixture<LoginedLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginedLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginedLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
