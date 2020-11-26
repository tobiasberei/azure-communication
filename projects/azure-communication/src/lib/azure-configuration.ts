import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AzureConfiguration {
    endpointUrl: string = '';
    tokenFn: () => string = () => '';
}
