import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CurrencyMaskInputMode } from '../src/currency-mask.config';

@Component({
  selector: 'demo-app',
  template: `
    <form class="container" [formGroup]="form">
      <div class="row">
        <div class="col-md-3 col-sm-5 form-group">
          <label>Example</label>
          <input
            #valueInput
            class="form-control"
            currencyMask
            formControlName="value"
            [placeholder]="'R$ 0,00'"
            [options]="ngxCurrencyOptions"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-md-3 col-sm-5 form-group">
          <label>Input Mode</label>
          <div>
            <label class="radio-inline">
              <input
                type="radio"
                name="inputMode"
                formControlName="inputMode"
                [value]="0"
              />Financial</label>
            <label class="radio-inline">
              <input
                type="radio"
                name="inputMode"
                formControlName="inputMode"
                [value]="1"
              />Natural</label>
            </div>
          </div>
      </div>


      <div class="row col-md-4 col-sm-6 form-group">
        <label>Value</label>
        <pre style="width: 100%">{{ form.get('value').value | json }}</pre>
      </div>
    </form>
  `
})
export class DemoComponent implements OnInit {

  @ViewChild('valueInput', { static: true }) valueInput: ElementRef;

  public form: FormGroup;
  public ngxCurrencyOptions = {
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    allowNegative: true,
    nullable: true,
    max: 250_000_000,
    inputMode: CurrencyMaskInputMode.FINANCIAL,
  };

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      value: 0,
      inputMode: this.ngxCurrencyOptions.inputMode,
    });

    this.form.get('inputMode').valueChanges.subscribe(val => {
      this.ngxCurrencyOptions.inputMode = val;

      // Clear and focus the value input when the input mode is changed.container
      this.form.get('value').setValue(0);
      this.valueInput.nativeElement.focus();
    });

    // Focus on the value input when the demo starts.
    this.valueInput.nativeElement.focus();
  }
}
