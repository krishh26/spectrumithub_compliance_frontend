import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompilanceTestComponent } from './compilance-test.component';

describe('CompilanceTestComponent', () => {
  let component: CompilanceTestComponent;
  let fixture: ComponentFixture<CompilanceTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompilanceTestComponent]
    });
    fixture = TestBed.createComponent(CompilanceTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
