import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsConditionAdminComponent } from './terms-condition-admin.component';

describe('TermsConditionAdminComponent', () => {
  let component: TermsConditionAdminComponent;
  let fixture: ComponentFixture<TermsConditionAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TermsConditionAdminComponent]
    });
    fixture = TestBed.createComponent(TermsConditionAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
