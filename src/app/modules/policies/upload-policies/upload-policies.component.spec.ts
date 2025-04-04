import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPoliciesComponent } from './upload-policies.component';

describe('UploadPoliciesComponent', () => {
  let component: UploadPoliciesComponent;
  let fixture: ComponentFixture<UploadPoliciesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadPoliciesComponent]
    });
    fixture = TestBed.createComponent(UploadPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
