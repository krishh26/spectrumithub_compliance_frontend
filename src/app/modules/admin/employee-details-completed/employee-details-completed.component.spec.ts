import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDetailsCompletedComponent } from './employee-details-completed.component';

describe('EmployeeDetailsCompletedComponent', () => {
  let component: EmployeeDetailsCompletedComponent;
  let fixture: ComponentFixture<EmployeeDetailsCompletedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeDetailsCompletedComponent]
    });
    fixture = TestBed.createComponent(EmployeeDetailsCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
