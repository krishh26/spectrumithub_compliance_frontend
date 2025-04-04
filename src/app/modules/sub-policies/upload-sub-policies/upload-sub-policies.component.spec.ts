import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadSubPoliciesComponent } from './upload-sub-policies.component';

describe('UploadSubPoliciesComponent', () => {
  let component: UploadSubPoliciesComponent;
  let fixture: ComponentFixture<UploadSubPoliciesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadSubPoliciesComponent]
    });
    fixture = TestBed.createComponent(UploadSubPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
