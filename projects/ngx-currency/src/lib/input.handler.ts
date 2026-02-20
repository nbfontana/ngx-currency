import { InputService } from './input.service';
import { NgxCurrencyConfig } from './ngx-currency.config';

export class InputHandler {
  inputService: InputService;
  onModelChange: (value: number | null) => void = () => undefined;
  onModelTouched: () => void = () => undefined;

  constructor(htmlInputElement: HTMLInputElement, options: NgxCurrencyConfig) {
    this.inputService = new InputService(htmlInputElement, options);
  }

  handleCut(): void {
    setTimeout(() => {
      this.inputService.updateFieldValue();
      this.setValue(this.inputService.value);
      this.onModelChange(this.inputService.value);
    }, 0);
  }

  handleInput(): void {
    const rawValue = this.inputService.rawValue ?? '';
    const selectionStart = this.inputService.inputSelection.selectionStart;
    const keyChar = rawValue[selectionStart - 1];
    const rawValueLength = rawValue.length;
    const storedRawValueLength = this.inputService.storedRawValue.length;

    // Multi-character change (paste, select-all+type, autocomplete, etc.)
    // Fix for: https://github.com/nbfontana/ngx-currency/issues/96
    if (Math.abs(rawValueLength - storedRawValueLength) != 1) {
      // Extract numeric characters and decimal point from the new value
      const numericChars = rawValue.replace(/[^0-9.]/g, '');

      if (numericChars.length > 0) {
        // Clear the field first
        this.setValue(null);

        // Process each character sequentially
        for (const char of numericChars) {
          if (char === '.') {
            // Decimal point handling - addNumber handles this
            this.inputService.addNumber(char);
          } else {
            this.inputService.addNumber(char);
          }
        }
      } else {
        // No numeric content - just update field
        this.inputService.updateFieldValue(selectionStart);
      }

      this.onModelChange(this.inputService.value);
      return;
    }

    // Restore the old value.
    this.inputService.rawValue = this.inputService.storedRawValue;

    if (rawValueLength < storedRawValueLength) {
      // Chrome Android seems to move the cursor in response to a backspace AFTER processing the
      // input event, so we need to wrap this in a timeout.
      this.timer(() => {
        // Move the cursor to just after the deleted value.
        this.inputService.updateFieldValue(selectionStart + 1);

        // Then backspace it.
        this.inputService.removeNumber('Backspace');
        this.onModelChange(this.inputService.value);
      }, 0);
    }

    if (rawValueLength > storedRawValueLength) {
      // Move the cursor to just before the new value.
      this.inputService.updateFieldValue(selectionStart - 1);

      // Process the character like a keypress.
      switch (keyChar) {
        case undefined:
        case 'Tab':
        case 'Enter':
          return;
        case '+':
          this.inputService.changeToPositive();
          break;
        case '-':
          this.inputService.changeToNegative();
          break;
        default:
          if (this.inputService.canInputMoreNumbers) {
            const selectionRangeLength = Math.abs(
              this.inputService.inputSelection.selectionEnd -
                this.inputService.inputSelection.selectionStart,
            );

            if (
              selectionRangeLength == (this.inputService.rawValue?.length ?? 0)
            ) {
              this.setValue(null);
            }

            this.inputService.addNumber(keyChar);
          }
          break;
      }

      this.onModelChange(this.inputService.value);
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();

      if (
        this.inputService.inputSelection.selectionStart <=
          this.inputService.prefixLength() &&
        this.inputService.inputSelection.selectionEnd >=
          (this.inputService.rawValue?.length ?? 0) -
            this.inputService.suffixLength()
      ) {
        this.clearValue();
      } else {
        this.inputService.removeNumber(event.key);
        this.onModelChange(this.inputService.value);
      }
    }
  }

  clearValue() {
    this.setValue(this.inputService.isNullable() ? null : 0);
    this.onModelChange(this.inputService.value);
  }

  handlePaste(): void {
    setTimeout(() => {
      this.inputService.updateFieldValue();
      this.setValue(this.inputService.value);
      this.onModelChange(this.inputService.value);
    }, 1);
  }

  updateOptions(options: NgxCurrencyConfig): void {
    this.inputService.updateOptions(options);
  }

  getOnModelChange(): (value: number | null) => void {
    return this.onModelChange;
  }

  setOnModelChange(callbackFunction: (value: number | null) => void): void {
    this.onModelChange = callbackFunction;
  }

  getOnModelTouched(): () => void {
    return this.onModelTouched;
  }

  setOnModelTouched(callbackFunction: () => void) {
    this.onModelTouched = callbackFunction;
  }

  setValue(value: number | null): void {
    this.inputService.value = value;
  }

  /**
   * Passthrough to setTimeout that can be stubbed out in tests.
   */
  timer(callback: () => void, delayMilliseconds: number) {
    setTimeout(callback, delayMilliseconds);
  }
}
