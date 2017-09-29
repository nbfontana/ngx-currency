import {Component} from '@angular/core';

@Component({
  selector: 'demo-app',
  template: `
    <form class="container">
      <div class="row">
        <div class="col-md-3 col-sm-5 form-group">

          <input class="form-control" maxlength="20" currencyMask [(ngModel)]="value"
                 [placeholder]="'Teste'" [options]="ngxCurrencyOptions">

        </div>
      </div>
    </form>`
})
export class DemoComponent {

  public value: number;

  public ngxCurrencyOptions = {
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    allowNegative: false
  };

}
