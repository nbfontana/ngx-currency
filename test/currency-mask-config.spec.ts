import { InputService } from './../src/input.service';
import { fakeAsync } from "@angular/core/testing";
import { expect } from "chai";

describe('Testing CurrencyMaskConfig', () => {
  var options: any;
  var inputService: InputService;

  beforeEach(() => {
    options = [{
      prefix: 'R$ ',
      thousands: '.',
      decimal: ',',
      allowNegative: false,
      nullable: false
    }];

    inputService = new InputService(null, options);
  })

  it('should return null because the nullable parameterization is true', fakeAsync(() => {
    var option: any = { nullable: true }
    inputService.updateOptions(option);
    inputService.value = null;
    expect(null).to.equals(inputService.clearMask(""));
  }));

  it('should return zero because the nullable parameterization is false', fakeAsync(() => {
    var option: any = { nullable: false }
    inputService.updateOptions(option);
    inputService.value = null;
    expect(0).to.equals(inputService.clearMask(""));
  }));
});
