import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CurrencyMaskDirective} from "./currency-mask.directive";
import {CURRENCY_MASK_CONFIG, CurrencyMaskConfig} from "./currency-mask.config";

@NgModule({
  imports: [ CommonModule, FormsModule ],
  declarations: [ CurrencyMaskDirective ],
  exports: [ CurrencyMaskDirective ]
})
export class NgxCurrencyModule {
  static forRoot(config: CurrencyMaskConfig): ModuleWithProviders {
    return {
      ngModule: NgxCurrencyModule,
      providers: [{
        provide: CURRENCY_MASK_CONFIG,
        useValue: config,
      }]
    }
  }
}
