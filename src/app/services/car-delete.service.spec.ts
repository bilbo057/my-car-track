import { TestBed } from '@angular/core/testing';

import { CarDeleteService } from './car-delete.service';

describe('CarDeleteService', () => {
  let service: CarDeleteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarDeleteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
