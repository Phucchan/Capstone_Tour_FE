import { TestBed } from '@angular/core/testing';

import { layoutService } from './layout.service';

describe('LayoutServiceService', () => {
  let service: layoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(layoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
