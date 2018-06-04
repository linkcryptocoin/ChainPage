import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDetailComponent } from './Post-detail.component';

describe('ClaimDetailComponent', () => {
  let component: ClaimDetailComponent;
  let fixture: ComponentFixture<ClaimDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
