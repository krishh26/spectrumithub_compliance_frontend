import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEntryEmployeeComponent } from './bulk-entry-employee.component';

describe('BulkEntryEmployeeComponent', () => {
  let component: BulkEntryEmployeeComponent;
  let fixture: ComponentFixture<BulkEntryEmployeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkEntryEmployeeComponent]
    });
    fixture = TestBed.createComponent(BulkEntryEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
