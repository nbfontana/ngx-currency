import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  NgxCurrencyDirective,
  NgxCurrencyInputMode,
} from '../../projects/ngx-currency/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [ReactiveFormsModule, JsonPipe, NgxCurrencyDirective],
})
export class AppComponent {
  ngxCurrencyOptions = {
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    allowNegative: true,
    nullable: true,
    max: 250_000_000,
    inputMode: NgxCurrencyInputMode.Financial,
  };
  ngxCurrencyInputMode = NgxCurrencyInputMode;

  form = inject(FormBuilder).nonNullable.group({
    value: 0,
    inputMode: this.ngxCurrencyOptions.inputMode,
  });

  constructor() {
    this.form.controls.inputMode.valueChanges.subscribe(val => {
      this.ngxCurrencyOptions.inputMode = val;

      // Clear the value input when the input mode is changed.container
      this.form.patchValue({ value: 0 });
    });
  }
}
