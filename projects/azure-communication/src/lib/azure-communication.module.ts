import { ModuleWithProviders, NgModule } from '@angular/core';
import { AzureChatClient } from './azure-chat-client.service';
import { AzureConfiguration } from './azure-configuration';
import { AzureConfigurationParams } from './azure-configuration-params';



@NgModule({
  declarations: [],
  imports: [],
  exports: [],
  providers: [
    AzureChatClient
  ]
})
export class AzureCommunicationModule {
  static forRoot(params: AzureConfigurationParams): ModuleWithProviders<AzureCommunicationModule> {
    return {
      ngModule: AzureCommunicationModule,
      providers: [
        {
          provide: AzureConfiguration,
          useValue: params
        }
      ]
    };
  }
}
