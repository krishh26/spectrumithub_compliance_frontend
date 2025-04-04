import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubPoliciesListComponent } from './sub-policies-list.component';

describe('SubPoliciesListComponent', () => {
  let component: SubPoliciesListComponent;
  let fixture: ComponentFixture<SubPoliciesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubPoliciesListComponent]
    });
    fixture = TestBed.createComponent(SubPoliciesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
