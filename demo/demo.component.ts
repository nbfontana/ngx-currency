import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'demo-app',
  template: `
    <form class="container" [formGroup]="form">
      
      <div class="row">
        <div class="col-md-3 col-sm-5 form-group">
          <label>Example</label>
          <input class="form-control"
                 maxlength="20"
                 currencyMask formControlName="value"
                 [(ngModel)]="value"
                 [placeholder]="'R$ 0,00'"
                 [options]="ngxCurrencyOptions"/>
        </div>
      </div>
      
      <div class="row col-md-4 col-sm-6 form-group">
        <pre style="width: 100%">{{ form.value | json }}</pre>
      </div>
      
    </form>`
})
export class DemoComponent {

  public form: FormGroup;
  public value: number;
  public ngxCurrencyOptions = {
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    allowNegative: false
  };

  constructor(private formBuilder: FormBuilder) {
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      value: [null]
    });
  }
}
