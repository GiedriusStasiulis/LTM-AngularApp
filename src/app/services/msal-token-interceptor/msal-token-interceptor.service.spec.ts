import { TestBed } from '@angular/core/testing';

import { MsalTokenInterceptorService } from './msal-token-interceptor.service';

describe('MsalTokenInterceptorService', () => {
  let service: MsalTokenInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsalTokenInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
