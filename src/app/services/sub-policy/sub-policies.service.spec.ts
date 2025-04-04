import { TestBed } from '@angular/core/testing';

import { SubPoliciesService } from './sub-policies.service';

describe('SubPoliciesService', () => {
  let service: SubPoliciesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubPoliciesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
