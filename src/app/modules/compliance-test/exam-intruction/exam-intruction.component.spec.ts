import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamIntructionComponent } from './exam-intruction.component';

describe('ExamIntructionComponent', () => {
  let component: ExamIntructionComponent;
  let fixture: ComponentFixture<ExamIntructionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExamIntructionComponent]
    });
    fixture = TestBed.createComponent(ExamIntructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
