import {InjectionToken} from "@angular/core";

export interface CurrencyMaskConfig {
  align: string;
  allowNegative: boolean;
  showNegativeOperator: boolean;
  allowZero: boolean;
  decimal: string;
  precision: number;
  prefix: string;
  suffix: string;
  thousands: string;
  nullable: boolean;
  min?: number;
  max?: number;
  inputMode? : CurrencyMaskInputMode;
}

export enum CurrencyMaskInputMode {
  FINANCIAL,
  NATURAL,
}

export let CURRENCY_MASK_CONFIG = new InjectionToken<CurrencyMaskConfig>("currency.mask.config");
