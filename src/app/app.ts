import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import {
  NgxCurrency,
  NgxCurrencyInputMode,
} from '../../projects/ngx-currency/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, JsonPipe, NgxCurrency],
})
export class App {
  protected readonly ngxCurrencyOptions = signal({
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    allowNegative: true,
    nullable: true,
    max: 250_000_000,
    inputMode: NgxCurrencyInputMode.Financial,
  });
  protected readonly ngxCurrencyInputMode = NgxCurrencyInputMode;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    value: 0,
    inputMode: this.ngxCurrencyOptions().inputMode,
  });

  protected readonly value = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.value)),
  );

  constructor() {
    this.form.controls.inputMode.valueChanges.subscribe(val => {
      this.ngxCurrencyOptions.update(o => ({ ...o, inputMode: val }));

      // Clear the value input when the input mode is changed.container
      this.form.patchValue({ value: 0 });
    });
  }
}
