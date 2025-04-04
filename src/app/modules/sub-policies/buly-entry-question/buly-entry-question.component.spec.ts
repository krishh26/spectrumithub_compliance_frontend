import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulyEntryQuestionComponent } from './buly-entry-question.component';

describe('BulyEntryQuestionComponent', () => {
  let component: BulyEntryQuestionComponent;
  let fixture: ComponentFixture<BulyEntryQuestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulyEntryQuestionComponent]
    });
    fixture = TestBed.createComponent(BulyEntryQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
