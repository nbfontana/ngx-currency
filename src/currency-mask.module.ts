import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NgModule} from "@angular/core";

import {CurrencyMaskDirective} from "./currency-mask.directive";

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    CurrencyMaskDirective
  ],
  exports: [
    CurrencyMaskDirective
  ]
})
export class CurrencyMaskModule {
}
