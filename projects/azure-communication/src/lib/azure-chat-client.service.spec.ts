import { TestBed } from '@angular/core/testing';

import { AzureChatClient } from './azure-chat-client.service';

describe('AzureChatClient', () => {
  let service: AzureChatClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AzureChatClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
