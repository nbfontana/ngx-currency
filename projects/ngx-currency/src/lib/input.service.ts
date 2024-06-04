import { InputManager } from './input.manager';
import { NgxCurrencyConfig, NgxCurrencyInputMode } from './ngx-currency.config';

export class InputService {
  private readonly _singleDigitRegex = new RegExp(
    /^[0-9\u0660-\u0669\u06F0-\u06F9]$/,
  );
  private readonly _onlyNumbersRegex = new RegExp(
    /[^0-9\u0660-\u0669\u06F0-\u06F9]/g,
  );

  private readonly _perArNumber = new Map<string, string>([
    ['\u06F0', '0'],
    ['\u06F1', '1'],
    ['\u06F2', '2'],
    ['\u06F3', '3'],
    ['\u06F4', '4'],
    ['\u06F5', '5'],
    ['\u06F6', '6'],
    ['\u06F7', '7'],
    ['\u06F8', '8'],
    ['\u06F9', '9'],

    ['\u0660', '0'],
    ['\u0661', '1'],
    ['\u0662', '2'],
    ['\u0663', '3'],
    ['\u0664', '4'],
    ['\u0665', '5'],
    ['\u0666', '6'],
    ['\u0667', '7'],
    ['\u0668', '8'],
    ['\u0669', '9'],
  ]);

  inputManager: InputManager;

  constructor(
    htmlInputElement: HTMLInputElement,
    private _options: NgxCurrencyConfig,
  ) {
    this.inputManager = new InputManager(htmlInputElement);
  }

  addNumber(keyCode: number): void {
    const { decimal, precision, inputMode } = this._options;
    const keyChar = String.fromCharCode(keyCode);
    const isDecimalChar = keyChar === this._options.decimal;

    if (!this.rawValue) {
      this.rawValue = this.applyMask(false, keyChar);
      let selectionStart: number | undefined = undefined;
      if (inputMode === NgxCurrencyInputMode.Natural && precision > 0) {
        selectionStart = this.rawValue.indexOf(decimal);
        if (isDecimalChar) {
          selectionStart++;
        }
      }
      this.updateFieldValue(selectionStart);
    } else {
      const selectionStart = this.inputSelection.selectionStart;
      const selectionEnd = this.inputSelection.selectionEnd;
      const rawValueStart = this.rawValue.substring(0, selectionStart);
      let rawValueEnd = this.rawValue.substring(
        selectionEnd,
        this.rawValue.length,
      );

      // In natural mode, replace decimals instead of shifting them.
      const inDecimalPortion = rawValueStart.indexOf(decimal) !== -1;
      if (
        inputMode === NgxCurrencyInputMode.Natural &&
        inDecimalPortion &&
        selectionStart === selectionEnd
      ) {
        rawValueEnd = rawValueEnd.substring(1);
      }

      const newValue = rawValueStart + keyChar + rawValueEnd;
      let nextSelectionStart = selectionStart + 1;
      const isDecimalOrThousands =
        isDecimalChar || keyChar === this._options.thousands;
      if (isDecimalOrThousands && keyChar === rawValueEnd[0]) {
        // If the cursor is just before the decimal or thousands separator and the user types the
        // decimal or thousands separator, move the cursor past it.
        nextSelectionStart++;
      } else if (!this._singleDigitRegex.test(keyChar)) {
        // Ignore other non-numbers.
        return;
      }

      this.rawValue = newValue;
      this.updateFieldValue(nextSelectionStart);
    }
  }

  applyMask(
    isNumber: boolean,
    rawValue: string,
    disablePadAndTrim = false,
  ): string {
    const {
      allowNegative,
      decimal,
      precision,
      prefix,
      suffix,
      thousands,
      min,
      inputMode,
    } = this._options;

    let { max } = this._options;

    rawValue = isNumber ? new Number(rawValue).toFixed(precision) : rawValue;
    let onlyNumbers = rawValue.replace(this._onlyNumbersRegex, '');

    if (!onlyNumbers && rawValue !== decimal) {
      return '';
    }

    if (
      inputMode === NgxCurrencyInputMode.Natural &&
      !isNumber &&
      !disablePadAndTrim
    ) {
      rawValue = this.padOrTrimPrecision(rawValue);
      onlyNumbers = rawValue.replace(this._onlyNumbersRegex, '');
    }

    let integerPart = onlyNumbers
      .slice(0, onlyNumbers.length - precision)
      .replace(/^\u0660*/g, '')
      .replace(/^\u06F0*/g, '')
      .replace(/^0*/g, '');

    if (integerPart == '') {
      integerPart = '0';
    }
    const integerValue = parseInt(integerPart);

    integerPart = integerPart.replace(
      /\B(?=([0-9\u0660-\u0669\u06F0-\u06F9]{3})+(?![0-9\u0660-\u0669\u06F0-\u06F9]))/g,
      thousands,
    );
    if (thousands && integerPart.startsWith(thousands)) {
      integerPart = integerPart.substring(1);
    }

    let newRawValue = integerPart;
    const decimalPart = onlyNumbers.slice(onlyNumbers.length - precision);
    const decimalValue = parseInt(decimalPart) || 0;

    const isNegative = rawValue.indexOf('-') > -1;

    // Ensure max is at least as large as min.
    max =
      max === null || max === undefined || min === null || min === undefined
        ? max
        : Math.max(max, min);

    // Ensure precision number works well with more than 2 digits
    // 23 / 100... 233 / 1000 and so on
    const divideBy = Number('1'.padEnd(precision + 1, '0'));

    // Restrict to the min and max values.
    let newValue = integerValue + decimalValue / divideBy;

    newValue = isNegative ? -newValue : newValue;
    if (max !== null && max !== undefined && newValue > max) {
      return this.applyMask(true, max + '');
    } else if (min !== null && min !== undefined && newValue < min) {
      return this.applyMask(true, min + '');
    }

    if (precision > 0) {
      if (newRawValue == '0' && decimalPart.length < precision) {
        newRawValue += decimal + '0'.repeat(precision - 1) + decimalPart;
      } else {
        newRawValue += decimal + decimalPart;
      }
    }

    // let isZero = newValue == 0;
    const operator = isNegative && allowNegative /*&& !isZero */ ? '-' : '';
    return operator + prefix + newRawValue + suffix;
  }

  padOrTrimPrecision(rawValue: string): string {
    const { decimal, precision } = this._options;

    let decimalIndex = rawValue.lastIndexOf(decimal);
    if (decimalIndex === -1) {
      decimalIndex = rawValue.length;
      rawValue += decimal;
    }

    let decimalPortion = rawValue
      .substring(decimalIndex)
      .replace(this._onlyNumbersRegex, '');
    const actualPrecision = decimalPortion.length;
    if (actualPrecision < precision) {
      for (let i = actualPrecision; i < precision; i++) {
        decimalPortion += '0';
      }
    } else if (actualPrecision > precision) {
      decimalPortion = decimalPortion.substring(
        0,
        decimalPortion.length + precision - actualPrecision,
      );
    }

    return rawValue.substring(0, decimalIndex) + decimal + decimalPortion;
  }

  clearMask(rawValue: string | null): number | null {
    if (this.isNullable() && rawValue === '') return null;

    let value = (rawValue || '0')
      .replace(this._options.prefix, '')
      .replace(this._options.suffix, '');

    if (this._options.thousands) {
      value = value.replace(
        new RegExp('\\' + this._options.thousands, 'g'),
        '',
      );
    }

    if (this._options.decimal) {
      value = value.replace(this._options.decimal, '.');
    }

    this._perArNumber.forEach((val: string, key: string) => {
      const re = new RegExp(key, 'g');
      value = value.replace(re, val);
    });
    return parseFloat(value);
  }

  changeToNegative(): void {
    if (
      this._options.allowNegative /*&& this.rawValue != ""*/ &&
      this.rawValue?.charAt(0) != '-' /*&& this.value != 0*/
    ) {
      // Apply the mask to ensure the min and max values are enforced.
      this.rawValue = this.applyMask(
        false,
        '-' + (this.rawValue ? this.rawValue : '0'),
      );
    }
  }

  changeToPositive(): void {
    // Apply the mask to ensure the min and max values are enforced.
    this.rawValue = this.applyMask(
      false,
      this.rawValue?.replace('-', '') ?? '',
    );
  }

  removeNumber(keyCode: number): void {
    const { decimal, thousands, prefix, suffix, inputMode } = this._options;

    if (this.isNullable() && this.value == 0) {
      this.rawValue = null;
      return;
    }

    let selectionEnd = this.inputSelection.selectionEnd;
    let selectionStart = this.inputSelection.selectionStart;

    const suffixStart = (this.rawValue?.length ?? 0) - suffix.length;
    selectionEnd = Math.min(suffixStart, Math.max(selectionEnd, prefix.length));
    selectionStart = Math.min(
      suffixStart,
      Math.max(selectionStart, prefix.length),
    );

    // Check if selection was entirely in the prefix or suffix.
    if (
      selectionStart === selectionEnd &&
      this.inputSelection.selectionStart !== this.inputSelection.selectionEnd
    ) {
      this.updateFieldValue(selectionStart);
      return;
    }

    let decimalIndex = this.rawValue?.indexOf(decimal) ?? -1;
    if (decimalIndex === -1) {
      decimalIndex = this.rawValue?.length ?? 0;
    }

    let shiftSelection = 0;
    let insertChars = '';

    const isCursorInDecimals = decimalIndex < selectionEnd;
    const isCursorImmediatelyAfterDecimalPoint =
      decimalIndex + 1 === selectionEnd;

    if (selectionEnd === selectionStart) {
      if (keyCode == 8) {
        if (selectionStart <= prefix.length) {
          return;
        }
        selectionStart--;

        // If previous char isn't a number, go back one more.
        if (
          !this.rawValue
            ?.substring(selectionStart, selectionStart + 1)
            .match(/\d/)
        ) {
          selectionStart--;
        }

        // In natural mode, jump backwards when in decimal portion of number.
        if (inputMode === NgxCurrencyInputMode.Natural && isCursorInDecimals) {
          shiftSelection = -1;
          // when removing a single whole number, replace it with 0
          if (
            isCursorImmediatelyAfterDecimalPoint &&
            (this.value ?? 0) < 10 &&
            (this.value ?? 0) > -10
          ) {
            insertChars += '0';
          }
        }
      } else if (keyCode == 46 || keyCode == 63272) {
        if (selectionStart === suffixStart) {
          return;
        }
        selectionEnd++;

        // If next char isn't a number, go one more.
        if (
          !this.rawValue
            ?.substring(selectionStart, selectionStart + 1)
            .match(/\d/)
        ) {
          selectionStart++;
          selectionEnd++;
        }
      }
    }

    // In natural mode, replace decimals with 0s.
    if (
      inputMode === NgxCurrencyInputMode.Natural &&
      selectionStart > decimalIndex
    ) {
      const replacedDecimalCount = selectionEnd - selectionStart;
      for (let i = 0; i < replacedDecimalCount; i++) {
        insertChars += '0';
      }
    }

    let selectionFromEnd = (this.rawValue?.length ?? 0) - selectionEnd;
    this.rawValue =
      this.rawValue?.substring(0, selectionStart) +
      insertChars +
      this.rawValue?.substring(selectionEnd);

    // Remove leading thousand separator from raw value.
    const startChar = this.rawValue.substring(prefix.length, prefix.length + 1);
    if (startChar === thousands) {
      this.rawValue =
        this.rawValue.substring(0, prefix.length) +
        this.rawValue.substring(prefix.length + 1);
      selectionFromEnd = Math.min(
        selectionFromEnd,
        this.rawValue.length - prefix.length,
      );
    }

    this.updateFieldValue(
      this.rawValue.length - selectionFromEnd + shiftSelection,
      true,
    );
  }

  updateFieldValue(selectionStart?: number, disablePadAndTrim = false): void {
    const newRawValue = this.applyMask(
      false,
      this.rawValue ?? '',
      disablePadAndTrim,
    );
    selectionStart ??= this.rawValue?.length ?? 0;
    selectionStart = Math.max(
      this._options.prefix.length,
      Math.min(
        selectionStart,
        (this.rawValue?.length ?? 0) - this._options.suffix.length,
      ),
    );
    this.inputManager.updateValueAndCursor(
      newRawValue,
      this.rawValue?.length ?? 0,
      selectionStart,
    );
  }

  updateOptions(options: NgxCurrencyConfig): void {
    const value = this.value;
    this._options = options;
    this.value = value;
  }

  prefixLength(): number {
    return this._options.prefix.length;
  }

  suffixLength(): number {
    return this._options.suffix.length;
  }

  isNullable() {
    return this._options.nullable;
  }

  get canInputMoreNumbers(): boolean {
    return this.inputManager.canInputMoreNumbers;
  }

  get inputSelection(): {
    selectionStart: number;
    selectionEnd: number;
  } {
    return this.inputManager.inputSelection;
  }

  get rawValue(): string | null {
    return this.inputManager.rawValue;
  }

  set rawValue(value: string | null) {
    this.inputManager.rawValue = value;
  }

  get storedRawValue(): string {
    return this.inputManager.storedRawValue;
  }

  get value(): number | null {
    return this.clearMask(this.rawValue);
  }

  set value(value: number | null) {
    this.rawValue = this.applyMask(true, '' + value);
  }

  private _isNullOrUndefined(value: number | null | undefined): boolean {
    return value === null || value === undefined;
  }
}
