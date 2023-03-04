import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { NgxCurrencyConfig, NGX_CURRENCY_CONFIG } from './ngx-currency.config';

export function provideEnvironmentNgxCurrency(
  config: Partial<NgxCurrencyConfig>
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NGX_CURRENCY_CONFIG,
      useValue: config,
    },
  ]);
}
