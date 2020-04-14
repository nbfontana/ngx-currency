import { InputService } from './../src/input.service';
import { expect } from "chai";
import { stub } from 'sinon';
import {CurrencyMaskConfig} from "../src/currency-mask.config";

describe('Testing InputService', () => {
  
  let options: CurrencyMaskConfig;
  let inputService: InputService;

  beforeEach(function() {
    options = {
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
  });

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

    it('should call updateFieldValue with 2 when deleting the number after the .', () => {
      inputService = new InputService({
        selectionStart: 2,
        selectionEnd: 2,
      }, options);

      inputService.inputManager.rawValue = '0.01';
      inputService.updateFieldValue = stub();
      inputService.removeNumber(46);
      expect(inputService.updateFieldValue).to.be.calledWith(2);
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

  describe('addNumber', () => {
    it('should default to min from empty raw value', () => {
      options.nullable = true;
      options.min = 10;
      options.precision = 0;
      inputService = new InputService({
        selectionStart: 0,
        selectionEnd: 0,
      }, options);

      inputService.inputManager.rawValue = null;
      inputService.addNumber(50); // '2'
      expect(inputService.value).to.be.equal(10);
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

    it('should limit to min', () => {
      options.precision = 0;
      options.allowNegative = true;
      inputService = new InputService({
          selectionStart: 0,
          selectionEnd: 0
        }, options);

      // Positive min.
      options.min = 10;
      expect(inputService.applyMask(false, '-1')).to.be.equal('10');
      expect(inputService.applyMask(false, '10')).to.be.equal('10');
      expect(inputService.applyMask(false, '11')).to.be.equal('11');

      // Negative min.
      options.min = -10;
      expect(inputService.applyMask(false, '-1')).to.be.equal('-1');
      expect(inputService.applyMask(false, '-10')).to.be.equal('-10');
      expect(inputService.applyMask(false, '-11')).to.be.equal('-10');
    });

    it('should limit to max', () => {
      options.precision = 0;
      options.allowNegative = true;
      inputService = new InputService({
          selectionStart: 0,
          selectionEnd: 0
        }, options);

      // Positive max
      options.max = 10;
      expect(inputService.applyMask(false, '-1')).to.be.equal('-1');
      expect(inputService.applyMask(false, '10')).to.be.equal('10');
      expect(inputService.applyMask(false, '11')).to.be.equal('10');

      // Negative max
      options.max = -10;
      expect(inputService.applyMask(false, '-1')).to.be.equal('-10');
      expect(inputService.applyMask(false, '-10')).to.be.equal('-10');
      expect(inputService.applyMask(false, '-11')).to.be.equal('-11');
    });

    it('should limit to min and max', () => {
      options.precision = 0;
      options.min = 10;
      options.max = 20;
      options.allowNegative = true;
      inputService = new InputService({
          selectionStart: 0,
          selectionEnd: 0
        }, options);

      expect(inputService.applyMask(false, '9')).to.be.equal('10');
      expect(inputService.applyMask(false, '10')).to.be.equal('10');
      expect(inputService.applyMask(false, '20')).to.be.equal('20');
      expect(inputService.applyMask(false, '21')).to.be.equal('20');
    });

    it('should ignore explicit null min and max', () => {
      options.precision = 0;
      options.min = null;
      options.max = null;
      options.allowNegative = true;
      inputService = new InputService({
          selectionStart: 0,
          selectionEnd: 0
        }, options);

      expect(inputService.applyMask(false, '-1')).to.be.equal('-1');
      expect(inputService.applyMask(false, '10')).to.be.equal('10');
    });
  });
});
