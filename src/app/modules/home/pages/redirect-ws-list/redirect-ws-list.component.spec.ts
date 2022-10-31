import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectWsListComponent } from './redirect-ws-list.component';

describe('RedirectWsListComponent', () => {
  let component: RedirectWsListComponent;
  let fixture: ComponentFixture<RedirectWsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedirectWsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectWsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
