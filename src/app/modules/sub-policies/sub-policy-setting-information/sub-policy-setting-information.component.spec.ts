import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubPolicySettingInformationComponent } from './sub-policy-setting-information.component';

describe('SubPolicySettingInformationComponent', () => {
  let component: SubPolicySettingInformationComponent;
  let fixture: ComponentFixture<SubPolicySettingInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubPolicySettingInformationComponent]
    });
    fixture = TestBed.createComponent(SubPolicySettingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
