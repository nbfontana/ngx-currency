import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  NgxCurrencyDirective,
  NgxCurrencyInputMode,
} from 'projects/ngx-currency/src/public-api';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [ReactiveFormsModule, JsonPipe, NgxCurrencyDirective],
})
export class AppComponent implements OnInit {
  public form: FormGroup;
  public ngxCurrencyOptions = {
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    allowNegative: true,
    nullable: true,
    max: 250_000_000,
    inputMode: NgxCurrencyInputMode.Financial,
  };
  ngxCurrencyInputMode = NgxCurrencyInputMode;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      value: 0,
      inputMode: this.ngxCurrencyOptions.inputMode,
    });
  }

  ngOnInit() {
    this.form.controls['inputMode'].valueChanges.subscribe((val) => {
      this.ngxCurrencyOptions.inputMode = val;

      // Clear the value input when the input mode is changed.container
      this.form.patchValue({ value: 0 });
    });
  }
}
