import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsConditionEmployeeComponent } from './terms-condition-employee.component';

describe('TermsConditionEmployeeComponent', () => {
  let component: TermsConditionEmployeeComponent;
  let fixture: ComponentFixture<TermsConditionEmployeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TermsConditionEmployeeComponent]
    });
    fixture = TestBed.createComponent(TermsConditionEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
