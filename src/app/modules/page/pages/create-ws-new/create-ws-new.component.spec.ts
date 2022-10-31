import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWsNewComponent } from './create-ws-new.component';

describe('CreateWsNewComponent', () => {
  let component: CreateWsNewComponent;
  let fixture: ComponentFixture<CreateWsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateWsNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
