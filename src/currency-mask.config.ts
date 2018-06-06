import {InjectionToken} from "@angular/core";

export interface CurrencyMaskConfig {
  align: string;
  allowNegative: boolean;
  allowZero: boolean;
  decimal: string;
  precision: number;
  prefix: string;
  suffix: string;
  thousands: string;
  nullable: boolean;
}

export let CURRENCY_MASK_CONFIG = new InjectionToken<CurrencyMaskConfig>("currency.mask.config");
