import { TestBed } from '@angular/core/testing';

import { MsalTokenService } from './msal-token.service';

describe('MsalTokenService', () => {
  let service: MsalTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsalTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
