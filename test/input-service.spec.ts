import { InputService } from './../src/input.service';
import { fakeAsync } from "@angular/core/testing";
import { expect } from "chai";
import { stub } from 'sinon';
import {CurrencyMaskConfig} from "../src/currency-mask.config";

describe('Testing InputService', () => {
  var options: CurrencyMaskConfig = {
    prefix: '',
    suffix: '',
    thousands: '.',
    decimal: ',',
    allowNegative: false,
    nullable: false,
    align: 'right',
    allowZero: true,
    precision: undefined,
  };
  var inputService: InputService;

  describe('removeNumber', () => {
    it('should call updateFieldValue with 1 when deleting the first number followed by a .', () => {
      inputService = new InputService({
        selectionStart: 0,
        selectionEnd: 0,
      }, options);

      inputService.inputManager.rawValue = '1.234,50';
      inputService.updateFieldValue = stub();
      inputService.removeNumber(46);
      expect(inputService.updateFieldValue).to.be.calledWith(1);
    });

    it('should call updateFieldValue with 1 when backspacing the first number followed by a .', () => {
      inputService = new InputService({
        selectionStart: 1,
        selectionEnd: 1,
      }, options);

      inputService.inputManager.rawValue = '1.234,50';
      inputService.updateFieldValue = stub();
      inputService.removeNumber(8);
      expect(inputService.updateFieldValue).to.be.calledWith(1);
    });

    it('should call updateFieldValue with 2 less than the current position when backspacing any non-number character', () => {
      inputService = new InputService({
        selectionStart: 6,
        selectionEnd: 6,
      }, options);

      inputService.inputManager.rawValue = '1.234,50';
      inputService.updateFieldValue = stub();
      inputService.removeNumber(8);
      expect(inputService.updateFieldValue).to.be.calledWith(4);
    });

    it('should return a value without spaces when thousands separator is empty', () => {
      options.thousands = "";
      options.precision = 0;

      inputService = new InputService({
        selectionStart: 6,
        selectionEnd: 6,
      }, options);

      const result = inputService.applyMask(false, '234567');
      expect(result).to.equal('234567');
    });
  });
});
