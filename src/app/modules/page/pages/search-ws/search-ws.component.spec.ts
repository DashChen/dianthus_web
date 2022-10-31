import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchWsComponent } from './search-ws.component';

describe('SearchWsComponent', () => {
  let component: SearchWsComponent;
  let fixture: ComponentFixture<SearchWsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchWsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchWsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
