import { InputService } from './input.service';
import { createMockHtmlInputElement } from './mock';
import { NgxCurrencyConfig, NgxCurrencyInputMode } from './ngx-currency.config';

describe('InputService', () => {
  let options: NgxCurrencyConfig;
  let inputService: InputService;

  beforeEach(() => {
    options = {
      prefix: '',
      suffix: '',
      thousands: '.',
      decimal: ',',
      allowNegative: false,
      nullable: false,
      align: 'right',
      allowZero: true,
      precision: 2,
    };
  });

  describe('removeNumber', () => {
    it('should remove leading . when deleting the first number followed by a .', () => {
      inputService = new InputService(
        {
          selectionStart: 0,
          selectionEnd: 0,
        } as HTMLInputElement,
        options
      );

      inputService.inputManager.rawValue = '1.234,50';
      spyOn(inputService, 'updateFieldValue');
      inputService.removeNumber(46);
      expect(inputService.inputManager.rawValue).toEqual('234,50');
      expect(inputService.updateFieldValue).toHaveBeenCalledWith(0, true);
    });

    it('should call updateFieldValue with 2 when deleting the number after the .', () => {
      inputService = new InputService(
        {
          selectionStart: 2,
          selectionEnd: 2,
        } as HTMLInputElement,
        options
      );

      inputService.inputManager.rawValue = '0.01';
      spyOn(inputService, 'updateFieldValue');
      inputService.removeNumber(46);
      expect(inputService.updateFieldValue).toHaveBeenCalledWith(2, true);
    });

    it('should remove leading . when backspacing the first number followed by a .', () => {
      inputService = new InputService(
        {
          selectionStart: 1,
          selectionEnd: 1,
        } as HTMLInputElement,
        options
      );

      inputService.inputManager.rawValue = '1.234,50';
      spyOn(inputService, 'updateFieldValue');
      inputService.removeNumber(8);
      expect(inputService.inputManager.rawValue).toEqual('234,50');
      expect(inputService.updateFieldValue).toHaveBeenCalledWith(0, true);
    });

    it('should call updateFieldValue with 2 less than the current position when backspacing any non-number character', () => {
      inputService = new InputService(
        {
          selectionStart: 6,
          selectionEnd: 6,
        } as HTMLInputElement,
        options
      );

      inputService.inputManager.rawValue = '1.234,50';
      spyOn(inputService, 'updateFieldValue');
      inputService.removeNumber(8);
      expect(inputService.updateFieldValue).toHaveBeenCalledWith(4, true);
    });

    it('should ignore backspace at beginning of string', () => {
      options.prefix = '$$';
      options.suffix = 'SUF';
      inputService = new InputService(
        {
          selectionStart: 2,
          selectionEnd: 2,
        } as HTMLInputElement,
        options
      );

      inputService.inputManager.rawValue = '$$1.234,50SUF';
      spyOn(inputService, 'updateFieldValue');
      inputService.removeNumber(8);
      expect(inputService.updateFieldValue).not.toHaveBeenCalled();
    });

    it('should ignore delete at end of string', () => {
      options.prefix = '$$';
      options.suffix = 'SUF';
      inputService = new InputService(
        {
          selectionStart: 10,
          selectionEnd: 10,
        } as HTMLInputElement,
        options
      );

      inputService.inputManager.rawValue = '$$1.234,50SUF';
      spyOn(inputService, 'updateFieldValue');
      inputService.removeNumber(46);
      expect(inputService.updateFieldValue).not.toHaveBeenCalled();
    });

    it('should remove number before . on backspace', () => {
      const htmlInputElement = createMockHtmlInputElement(8, 8);
      options.prefix = '$$';
      options.suffix = 'SUF';
      inputService = new InputService(htmlInputElement, options);

      inputService.rawValue = '$$1.234.567,89SUF';
      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$123.567,89SUF');
      expect(htmlInputElement.selectionStart).toEqual(6);
      expect(htmlInputElement.selectionEnd).toEqual(6);
    });

    it('should remove number before , on backspace', () => {
      const htmlInputElement = createMockHtmlInputElement(8, 8);
      options.prefix = '$$';
      options.suffix = 'SUF';
      inputService = new InputService(htmlInputElement, options);

      inputService.rawValue = '$$1.234,56SUF';
      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$123,56SUF');
      expect(htmlInputElement.selectionStart).toEqual(6);
      expect(htmlInputElement.selectionEnd).toEqual(6);
    });

    it('should remove number after . on delete', () => {
      const htmlInputElement = createMockHtmlInputElement(5, 5);
      options.prefix = '$$';
      options.suffix = 'SUF';
      inputService = new InputService(htmlInputElement, options);

      inputService.rawValue = '$$123.456,78SUF';
      inputService.removeNumber(46);
      expect(inputService.rawValue).toEqual('$$12.356,78SUF');
      expect(htmlInputElement.selectionStart).toEqual(6);
      expect(htmlInputElement.selectionEnd).toEqual(6);
    });

    it('should replace decimals with 0s and shift selection back one when backspacing in natural mode', () => {
      const htmlInputElement = createMockHtmlInputElement(10, 10);
      options.prefix = '$$';
      options.suffix = 'SUF';
      options.inputMode = NgxCurrencyInputMode.Natural;
      inputService = new InputService(htmlInputElement, options);
      inputService.rawValue = '$$1.234,56SUF';

      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$1.234,50SUF');
      expect(htmlInputElement.selectionStart).toEqual(9);
      expect(htmlInputElement.selectionEnd).toEqual(9);

      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$1.234,00SUF');
      expect(htmlInputElement.selectionStart).toEqual(8);
      expect(htmlInputElement.selectionEnd).toEqual(8);

      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$123,00SUF');
      expect(htmlInputElement.selectionStart).toEqual(5);
      expect(htmlInputElement.selectionEnd).toEqual(5);

      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$12,00SUF');
      expect(htmlInputElement.selectionStart).toEqual(4);
      expect(htmlInputElement.selectionEnd).toEqual(4);

      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$1,00SUF');
      expect(htmlInputElement.selectionStart).toEqual(3);
      expect(htmlInputElement.selectionEnd).toEqual(3);

      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$0,00SUF');
      expect(htmlInputElement.selectionStart).toEqual(3);
      expect(htmlInputElement.selectionEnd).toEqual(3);

      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$0,00SUF');
      expect(htmlInputElement.selectionStart).toEqual(3);
      expect(htmlInputElement.selectionEnd).toEqual(3);
    });

    it('should replace decimals with 0s when deleting in natural mode', () => {
      const htmlInputElement = createMockHtmlInputElement(7, 7);
      options.prefix = '$$';
      options.suffix = 'SUF';
      options.inputMode = NgxCurrencyInputMode.Natural;
      inputService = new InputService(htmlInputElement, options);
      inputService.rawValue = '$$1.234,56SUF';

      inputService.removeNumber(46);
      expect(inputService.rawValue).toEqual('$$1.234,06SUF');
      expect(htmlInputElement.selectionStart).toEqual(9);
      expect(htmlInputElement.selectionEnd).toEqual(9);

      inputService.removeNumber(46);
      expect(inputService.rawValue).toEqual('$$1.234,00SUF');
      expect(htmlInputElement.selectionStart).toEqual(10);
      expect(htmlInputElement.selectionEnd).toEqual(10);
    });

    it('should replace single whole numbers with 0s when backspacing in natural mode', () => {
      const htmlInputElement = createMockHtmlInputElement(4, 4);
      options.prefix = '$$';
      options.suffix = 'SUF';
      options.inputMode = NgxCurrencyInputMode.Natural;
      inputService = new InputService(htmlInputElement, options);
      inputService.rawValue = '$$1,00SUF';

      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$0,00SUF');
      expect(htmlInputElement.selectionStart).toEqual(3);
      expect(htmlInputElement.selectionEnd).toEqual(3);
    });

    it('should delete if no precision in natural mode', () => {
      const htmlInputElement = createMockHtmlInputElement(4, 4);
      options.prefix = '$$';
      options.suffix = 'SUF';
      options.precision = 0;
      options.inputMode = NgxCurrencyInputMode.Natural;
      inputService = new InputService(htmlInputElement, options);
      inputService.rawValue = '$$1.234SUF';

      inputService.removeNumber(46);
      expect(inputService.rawValue).toEqual('$$134SUF');
      expect(htmlInputElement.selectionStart).toEqual(3);
      expect(htmlInputElement.selectionEnd).toEqual(3);
    });

    it('should only delete selected range when deleting', () => {
      const htmlInputElement = createMockHtmlInputElement(5, 9);
      options.prefix = '$$';
      options.suffix = 'SUF';
      inputService = new InputService(htmlInputElement, options);
      inputService.rawValue = '$$1.234,56SUF';

      inputService.removeNumber(46);
      expect(inputService.rawValue).toEqual('$$1,26SUF');
      expect(htmlInputElement.selectionStart).toEqual(5);
      expect(htmlInputElement.selectionEnd).toEqual(5);
    });

    it('should shift numbers into decimal when backspacing over decimal in natural mode', () => {
      const htmlInputElement = createMockHtmlInputElement(5, 9);
      options.prefix = '$$';
      options.suffix = 'SUF';
      options.inputMode = NgxCurrencyInputMode.Natural;
      inputService = new InputService(htmlInputElement, options);
      inputService.rawValue = '$$1.234,56SUF';

      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$1,26SUF');
      expect(htmlInputElement.selectionStart).toEqual(5);
      expect(htmlInputElement.selectionEnd).toEqual(5);
    });

    it('should move selection without removing numbers if selection range is entirely in prefix', () => {
      const htmlInputElement = createMockHtmlInputElement(0, 1);
      options.prefix = '$$';
      options.suffix = 'SUF';
      inputService = new InputService(htmlInputElement, options);
      inputService.rawValue = '$$1.234,56SUF';

      inputService.removeNumber(46);
      expect(inputService.rawValue).toEqual('$$1.234,56SUF');
      expect(htmlInputElement.selectionStart).toEqual(2);
      expect(htmlInputElement.selectionEnd).toEqual(2);
    });

    it('should move selection without removing numbers if selection range is entirely in suffix', () => {
      const htmlInputElement = createMockHtmlInputElement(10, 12);
      options.prefix = '$$';
      options.suffix = 'SUF';
      inputService = new InputService(htmlInputElement, options);
      inputService.rawValue = '$$1.234,56SUF';

      inputService.removeNumber(8);
      expect(inputService.rawValue).toEqual('$$1.234,56SUF');
      expect(htmlInputElement.selectionStart).toEqual(10);
      expect(htmlInputElement.selectionEnd).toEqual(10);
    });
  });
});
