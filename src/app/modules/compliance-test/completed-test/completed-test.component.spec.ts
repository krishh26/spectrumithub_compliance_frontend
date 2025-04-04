import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedTestComponent } from './completed-test.component';

describe('CompletedTestComponent', () => {
  let component: CompletedTestComponent;
  let fixture: ComponentFixture<CompletedTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompletedTestComponent]
    });
    fixture = TestBed.createComponent(CompletedTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
