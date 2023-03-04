import { InjectionToken } from '@angular/core';

export interface NgxCurrencyConfig {
  align: string;
  allowNegative: boolean;
  allowZero: boolean;
  decimal: string;
  precision: number;
  prefix: string;
  suffix: string;
  thousands: string;
  nullable: boolean;
  min?: number;
  max?: number;
  inputMode?: NgxCurrencyInputMode;
}

export enum NgxCurrencyInputMode {
  Financial,
  Natural,
}

export const NGX_CURRENCY_CONFIG = new InjectionToken<
  Partial<NgxCurrencyConfig>
>('ngx-currency.config');
