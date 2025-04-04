import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubPoliciesSettingComponent } from './sub-policies-setting.component';

describe('SubPoliciesSettingComponent', () => {
  let component: SubPoliciesSettingComponent;
  let fixture: ComponentFixture<SubPoliciesSettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubPoliciesSettingComponent]
    });
    fixture = TestBed.createComponent(SubPoliciesSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
