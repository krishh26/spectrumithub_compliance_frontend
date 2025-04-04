import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowExamQuestionsAdminComponent } from './show-exam-questions-admin.component';

describe('ShowExamQuestionsAdminComponent', () => {
  let component: ShowExamQuestionsAdminComponent;
  let fixture: ComponentFixture<ShowExamQuestionsAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowExamQuestionsAdminComponent]
    });
    fixture = TestBed.createComponent(ShowExamQuestionsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
