import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDetailsOutstandingComponent } from './employee-details-outstanding.component';

describe('EmployeeDetailsOutstandingComponent', () => {
  let component: EmployeeDetailsOutstandingComponent;
  let fixture: ComponentFixture<EmployeeDetailsOutstandingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeDetailsOutstandingComponent]
    });
    fixture = TestBed.createComponent(EmployeeDetailsOutstandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
