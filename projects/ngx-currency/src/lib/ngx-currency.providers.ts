import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { NGX_CURRENCY_CONFIG, NgxCurrencyConfig } from './ngx-currency.config';

export function provideEnvironmentNgxCurrency(
  config: Partial<NgxCurrencyConfig>,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NGX_CURRENCY_CONFIG,
      useValue: config,
    },
  ]);
}
