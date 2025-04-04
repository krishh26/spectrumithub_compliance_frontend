import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubPolicyCompletedComponent } from './sub-policy-completed.component';

describe('SubPolicyCompletedComponent', () => {
  let component: SubPolicyCompletedComponent;
  let fixture: ComponentFixture<SubPolicyCompletedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubPolicyCompletedComponent]
    });
    fixture = TestBed.createComponent(SubPolicyCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
