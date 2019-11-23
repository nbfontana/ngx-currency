import { InputService } from './../src/input.service';
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
  
  describe('applyMask', ()=> {
    it('should use precision 2 and consider decimal part when typing 1 with empty value', () => {        
      options.precision = 2;

      inputService = new InputService({
        selectionStart: 0,
        selectionEnd: 0
      }, options);

      const result = inputService.applyMask(false, '1');
      expect(result).to.be.equal('0,01');
    });

    it('should use precision 3 and consider decimal part when typing 1 with empty value', () => {
      options.precision = 3;

      inputService = new InputService({
        selectionStart: 0,
        selectionEnd: 0
      }, options);

      const result = inputService.applyMask(false, '1');
      expect(result).to.be.equal('0,001');
    });

    it('should use precision 2 when typing a key with previous value', () => {
      options.precision = 2;

      inputService = new InputService({
        selectionStart: 6,
        selectionEnd: 6
      }, options);
      
      const result = inputService.applyMask(false, '12345');
      expect(result).to.be.equal('123,45');
    });

    it('should use precision 3 when typing a key with previous value', () => {
      options.precision = 3;

      inputService = new InputService({
          selectionStart: 6,
          selectionEnd: 6
        }, options);

      const result = inputService.applyMask(false, '234567');
      expect(result).to.be.equal('234,567');
    });
  });
});
