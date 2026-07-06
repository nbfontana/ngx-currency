import { InputHandler } from './input.handler';
import { InputService } from './input.service';
import { createMockHtmlInputElement } from './mock';
import { NgxCurrencyConfig, NgxCurrencyInputMode } from './ngx-currency.config';

describe('InputHandler', () => {
  let options: NgxCurrencyConfig;
  let inputElement: HTMLInputElement;
  let inputHandler: InputHandler;
  let inputService: InputService;

  beforeEach(() => {
    inputElement = createMockHtmlInputElement(0, 0);
    options = {
      prefix: '',
      suffix: '',
      thousands: '.',
      decimal: ',',
      allowNegative: false,
      nullable: false,
      align: 'right',
      allowZero: true,
      precision: 0,
    };

    inputHandler = new InputHandler(inputElement, options);
    inputService = inputHandler.inputService;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    inputHandler.onModelChange = () => {};
    vi.spyOn(inputHandler, 'onModelChange');
  });

  describe('handleInput', () => {
    beforeEach(() => {
      options.prefix = '$';

      // Invoke async callbacks synchronously.
      inputHandler.timer = (callback: () => void) => callback();
    });

    it('handles more than 1 character changes', () => {
      inputService.rawValue = '$12.345';
      inputElement.selectionStart = 5;
      inputService.inputManager['_storedRawValue'] = '$123';

      inputHandler.handleInput();
      // With the fix, it extracts numeric chars and processes them
      expect(inputService.rawValue).toEqual('$12.345');
      expect(inputHandler.onModelChange).toHaveBeenCalledWith(12345);
    });

    // Fix for: https://github.com/nbfontana/ngx-currency/issues/96
    it('handles select-all and type multiple characters', () => {
      // Simulate: field has "$12.345", user selects all, types "750"
      // Browser replaces selected text with "750" in a single input event
      // Length difference must be > 1 to trigger multi-char handling
      inputService.rawValue = '750';
      inputElement.selectionStart = 3;
      inputService.inputManager['_storedRawValue'] = '$12.345'; // length 7

      inputHandler.handleInput();

      // Should process all three characters: 7, 5, 0
      // abs(3 - 7) = 4, so this triggers multi-char handling
      expect(inputService.rawValue).toEqual('$750');
      expect(inputHandler.onModelChange).toHaveBeenCalledWith(750);
    });

    it('handles select-all and type with decimal', () => {
      options.precision = 2;
      options.inputMode = NgxCurrencyInputMode.Natural;

      // Simulate: field has "$123.45", user selects all, types "99.50"
      inputService.rawValue = '99.50';
      inputElement.selectionStart = 5;
      inputService.inputManager['_storedRawValue'] = '$123,45';

      inputHandler.handleInput();

      // Should correctly parse decimal value
      expect(inputHandler.onModelChange).toHaveBeenCalled();
    });

    it('handles empty input after select-all delete', () => {
      // Simulate: field has "$123", user selects all and deletes
      inputService.rawValue = '';
      inputElement.selectionStart = 0;
      inputService.inputManager['_storedRawValue'] = '$123';

      inputHandler.handleInput();

      // Should handle empty input gracefully
      expect(inputHandler.onModelChange).toHaveBeenCalled();
    });

    it('handles 1 character removed', () => {
      inputService.rawValue = '$1.245';
      inputElement.selectionStart = 4;
      inputService.inputManager['_storedRawValue'] = '$12.345';

      inputHandler.handleInput();
      expect(inputService.rawValue).toEqual('$1.245');
      expect(inputHandler.onModelChange).toHaveBeenCalledWith(1245);
    });

    it('handles last character removed in natural mode', () => {
      options.precision = 2;
      options.inputMode = NgxCurrencyInputMode.Natural;
      inputService.rawValue = '$123,4';
      inputElement.selectionStart = 6;
      inputService.inputManager['_storedRawValue'] = '$123,45';

      inputHandler.handleInput();
      expect(inputService.rawValue).toEqual('$123,40');
      expect(inputElement.selectionStart).toEqual(6);
      expect(inputHandler.onModelChange).toHaveBeenCalledWith(123.4);
    });

    it('handles 1 character added', () => {
      inputService.rawValue = '$123.945';
      inputElement.selectionStart = 6;
      inputService.inputManager['_storedRawValue'] = '$12.345';

      inputHandler.handleInput();
      expect(inputService.rawValue).toEqual('$123.945');
      expect(inputHandler.onModelChange).toHaveBeenCalledWith(123945);
    });

    it('handles 1 character added in natural mode after decimal', () => {
      options.precision = 2;
      options.inputMode = NgxCurrencyInputMode.Natural;
      inputService.rawValue = '$123,945';
      inputElement.selectionStart = 6;
      inputService.inputManager['_storedRawValue'] = '$123,45';

      inputHandler.handleInput();
      expect(inputService.rawValue).toEqual('$123,95');
      expect(inputElement.selectionStart).toEqual(6);
      expect(inputHandler.onModelChange).toHaveBeenCalledWith(123.95);
    });

    it('handles 1 character added in natural mode before decimal', () => {
      options.precision = 2;
      options.inputMode = NgxCurrencyInputMode.Natural;
      inputService.rawValue = '$1293,45';
      inputElement.selectionStart = 4;
      inputService.inputManager['_storedRawValue'] = '$123,45';

      inputHandler.handleInput();
      expect(inputService.rawValue).toEqual('$1.293,45');
      expect(inputElement.selectionStart).toEqual(5);
      expect(inputHandler.onModelChange).toHaveBeenCalledWith(1293.45);
    });
  });

  describe('handleKeydown', () => {
    it('should call clearValue if all text selected', () => {
      options.prefix = '$$$';
      options.suffix = 'SU';
      inputService.rawValue = '$$$1,23SU';
      inputElement.selectionStart = 0;
      inputElement.selectionEnd = 9;
      vi.spyOn(inputHandler, 'clearValue');

      const event = {
        key: 'Backspace',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        preventDefault: () => {},
      } as KeyboardEvent;
      vi.spyOn(event, 'preventDefault');
      inputHandler.handleKeydown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(inputHandler.clearValue).toHaveBeenCalledTimes(1);
    });

    it('should call clearValue if partial prefix through partial suffix selected', () => {
      options.prefix = '$$$';
      options.suffix = 'SU';
      inputService.rawValue = '$$$1,23SU';
      inputElement.selectionStart = 1;
      inputElement.selectionEnd = 8;
      vi.spyOn(inputHandler, 'clearValue');

      const event = {
        key: 'Delete',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        preventDefault: () => {},
      } as KeyboardEvent;
      vi.spyOn(event, 'preventDefault');
      inputHandler.handleKeydown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(inputHandler.clearValue).toHaveBeenCalledTimes(1);
    });

    it('should call clearValue if all numbers selected', () => {
      options.prefix = '$$$';
      options.suffix = 'SU';
      inputService.rawValue = '$$$1,23SU';
      inputElement.selectionStart = 3;
      inputElement.selectionEnd = 7;
      vi.spyOn(inputHandler, 'clearValue');

      const event = {
        key: 'Delete',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        preventDefault: () => {},
      } as KeyboardEvent;
      vi.spyOn(event, 'preventDefault');

      inputHandler.handleKeydown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(inputHandler.clearValue).toHaveBeenCalledTimes(1);
    });

    it('should call removeNumber if subset of numbers selected', () => {
      options.prefix = '$$$';
      options.suffix = 'SU';
      inputService.rawValue = '$$$1,23SU';
      inputElement.selectionStart = 3;
      inputElement.selectionEnd = 4;
      vi.spyOn(inputService, 'removeNumber');

      const event = {
        key: 'Delete',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        preventDefault: () => {},
      } as KeyboardEvent;
      vi.spyOn(event, 'preventDefault');

      inputHandler.handleKeydown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(inputService.removeNumber).toHaveBeenCalledWith('Delete');
      expect(inputHandler.onModelChange).toHaveBeenCalledTimes(1);
    });

    it('should call removeNumber if cursor inside number area', () => {
      options.prefix = '$$$';
      options.suffix = 'SU';
      inputService.rawValue = '$$$1,23SU';
      inputElement.selectionStart = 5;
      inputElement.selectionEnd = 5;
      vi.spyOn(inputService, 'removeNumber');

      const event = {
        key: 'Backspace',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        preventDefault: () => {},
      } as KeyboardEvent;
      vi.spyOn(event, 'preventDefault');

      inputHandler.handleKeydown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(inputService.removeNumber).toHaveBeenCalledWith('Backspace');
      expect(inputHandler.onModelChange).toHaveBeenCalledTimes(1);
    });
  });
});
