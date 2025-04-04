import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubPolicyOutstandingComponent } from './sub-policy-outstanding.component';

describe('SubPolicyOutstandingComponent', () => {
  let component: SubPolicyOutstandingComponent;
  let fixture: ComponentFixture<SubPolicyOutstandingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubPolicyOutstandingComponent]
    });
    fixture = TestBed.createComponent(SubPolicyOutstandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
