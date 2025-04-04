import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowExamQuestionsComponent } from './show-exam-questions.component';

describe('ShowExamQuestionsComponent', () => {
  let component: ShowExamQuestionsComponent;
  let fixture: ComponentFixture<ShowExamQuestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowExamQuestionsComponent]
    });
    fixture = TestBed.createComponent(ShowExamQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
