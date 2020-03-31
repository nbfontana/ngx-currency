import {InputManager} from "./input.manager";
import {CurrencyMaskConfig} from "./currency-mask.config";


export class InputService {
    PER_AR_NUMBER: Map<string, string> = new Map<string, string>();

    initialize() {
        this.PER_AR_NUMBER.set("\u06F0", "0");
        this.PER_AR_NUMBER.set("\u06F1", "1");
        this.PER_AR_NUMBER.set("\u06F2", "2");
        this.PER_AR_NUMBER.set("\u06F3", "3");
        this.PER_AR_NUMBER.set("\u06F4", "4");
        this.PER_AR_NUMBER.set("\u06F5", "5");
        this.PER_AR_NUMBER.set("\u06F6", "6");
        this.PER_AR_NUMBER.set("\u06F7", "7");
        this.PER_AR_NUMBER.set("\u06F8", "8");
        this.PER_AR_NUMBER.set("\u06F9", "9");

        this.PER_AR_NUMBER.set("\u0660", "0");
        this.PER_AR_NUMBER.set("\u0661", "1");
        this.PER_AR_NUMBER.set("\u0662", "2");
        this.PER_AR_NUMBER.set("\u0663", "3");
        this.PER_AR_NUMBER.set("\u0664", "4");
        this.PER_AR_NUMBER.set("\u0665", "5");
        this.PER_AR_NUMBER.set("\u0666", "6");
        this.PER_AR_NUMBER.set("\u0667", "7");
        this.PER_AR_NUMBER.set("\u0668", "8");
        this.PER_AR_NUMBER.set("\u0669", "9");
    }

    inputManager: InputManager;

    constructor(private htmlInputElement: any, private options: CurrencyMaskConfig) {
        this.inputManager = new InputManager(htmlInputElement);
        this.initialize()
    }

    addNumber(keyCode: number): void {
        let keyChar = String.fromCharCode(keyCode);

        if (!this.rawValue) {
            this.rawValue = this.applyMask(false, keyChar);
            this.updateFieldValue();
        } else {
            let selectionStart = this.inputSelection.selectionStart;
            let selectionEnd = this.inputSelection.selectionEnd;
            const rawValueStart = this.rawValue.substring(0, selectionStart);
            const rawValueEnd = this.rawValue.substring(selectionEnd, this.rawValue.length);
            this.rawValue = rawValueStart + keyChar + rawValueEnd;
            let nextSelectionStart = selectionStart + 1;

            // If the cursor is just before the decimal or thousands separator and the user types the
            // decimal or thousands separator, move the cursor past it.
            if ((keyChar === this.options.decimal || keyChar === this.options.thousands) && 
                keyChar === rawValueEnd.substring(0, 1)) {
                nextSelectionStart++;
            }

            this.updateFieldValue(nextSelectionStart);
        }
    }

    applyMask(isNumber: boolean, rawValue: string): string {
        let {allowNegative, decimal, precision, prefix, suffix, thousands, nullable, min, max} = this.options;
        rawValue = isNumber ? new Number(rawValue).toFixed(precision) : rawValue;
        let onlyNumbers = rawValue.replace(/[^0-9\u0660-\u0669\u06F0-\u06F9]/g, "");

        if (!onlyNumbers) {
            return "";
        }

        let integerPart = onlyNumbers.slice(0, onlyNumbers.length - precision)
          .replace(/^\u0660*/g, "")
          .replace(/^\u06F0*/g, "")
          .replace(/^0*/g, "");

        if (integerPart == "") {
            integerPart = "0";
        }
        let integerValue = parseInt(integerPart);

        integerPart = integerPart.replace(/\B(?=([0-9\u0660-\u0669\u06F0-\u06F9]{3})+(?![0-9\u0660-\u0669\u06F0-\u06F9]))/g, thousands);
        if (thousands && integerPart.startsWith(thousands)) {
            integerPart = integerPart.substring(1);
        }

        let newRawValue = integerPart;
        let decimalPart = onlyNumbers.slice(onlyNumbers.length - precision);
        let decimalValue = parseInt(decimalPart) || 0;

        let isNegative = rawValue.indexOf("-") > -1;

        // Ensure max is at least as large as min.
        max = (this.isNullOrUndefined(max) || this.isNullOrUndefined(min)) ? max : Math.max(max, min);

        // Restrict to the min and max values.
        let newValue = integerValue + (decimalValue / 100);
        newValue = isNegative ? -newValue : newValue;
        if (!this.isNullOrUndefined(max) && newValue > max) {
            return this.applyMask(true, max + '');
        } else if (!this.isNullOrUndefined(min) && newValue < min) {
            return this.applyMask(true, min + '');
        }

        if (precision > 0) {
            if (newRawValue == "0" && decimalPart.length < precision) {
                newRawValue += decimal + "0".repeat(precision - 1) + decimalPart;
            } else {
                newRawValue += decimal + decimalPart;
            }
        }

        let isZero = newValue == 0;
        let operator = (isNegative && allowNegative && !isZero) ? "-" : "";
        return operator + prefix + newRawValue + suffix;
    }

    clearMask(rawValue: string): number {
        if (this.isNullable() && rawValue === "")
            return null;

        let value = (rawValue || "0").replace(this.options.prefix, "").replace(this.options.suffix, "");

        if (this.options.thousands) {
            value = value.replace(new RegExp("\\" + this.options.thousands, "g"), "");
        }

        if (this.options.decimal) {
            value = value.replace(this.options.decimal, ".");
        }

        this.PER_AR_NUMBER.forEach((val: string, key: string) => {
            const re = new RegExp(key, "g");
            value = value.replace(re, val);
        });
        return parseFloat(value);
    }

    changeToNegative(): void {
        if (this.options.allowNegative && this.rawValue != "" && this.rawValue.charAt(0) != "-" && this.value != 0) {
            // Apply the mask to ensure the min and max values are enforced.
            this.rawValue = this.applyMask(false, "-" + this.rawValue);
        }
    }

    changeToPositive(): void {
            // Apply the mask to ensure the min and max values are enforced.
            this.rawValue = this.applyMask(false, this.rawValue.replace("-", ""));
    }

    removeNumber(keyCode: number): void {
        if (this.isNullable() && this.value == 0) {
            this.rawValue = null;
            return;
        }

        let selectionEnd = this.inputSelection.selectionEnd;
        let selectionStart = this.inputSelection.selectionStart;

        if (selectionStart > this.rawValue.length - this.options.suffix.length) {
            selectionEnd = this.rawValue.length - this.options.suffix.length;
            selectionStart = this.rawValue.length - this.options.suffix.length;
        }

    let move = this.rawValue.substr(selectionStart - 1, 1).match(/\d/) ? 0 : -1;
    if ((
          keyCode == 8 &&
          selectionStart - 1 === 0 &&
          !(this.rawValue.substr(selectionStart, 1).match(/\d/))
        ) ||
        (
          (keyCode == 46 || keyCode == 63272) &&
          selectionStart === 0 &&
          !(this.rawValue.substr(selectionStart + 1, 1).match(/\d/))
        )
    ) {
      move = 1;
    };
    selectionEnd = keyCode == 46 || keyCode == 63272 ? selectionEnd + 1 : selectionEnd;
    selectionStart = keyCode == 8 ? selectionStart - 1 : selectionStart;
    this.rawValue = this.rawValue.substring(0, selectionStart) + this.rawValue.substring(selectionEnd, this.rawValue.length);
    this.updateFieldValue(selectionStart + move);
  }

    updateFieldValue(selectionStart?: number): void {
        let newRawValue = this.applyMask(false, this.rawValue || "");
        selectionStart = selectionStart == undefined ? this.rawValue.length : selectionStart;
        this.inputManager.updateValueAndCursor(newRawValue, this.rawValue.length, selectionStart);
    }

    updateOptions(options: any): void {
        let value: number = this.value;
        this.options = options;
        this.value = value;
    }

    prefixLength(): any {
        return this.options.prefix.length;
    }

    isNullable() {
        return this.options.nullable;
    }

    get canInputMoreNumbers(): boolean {
        return this.inputManager.canInputMoreNumbers;
    }

    get inputSelection(): any {
        return this.inputManager.inputSelection;
    }

    get rawValue(): string {
        return this.inputManager.rawValue;
    }

    set rawValue(value: string) {
        this.inputManager.rawValue = value;
    }

    get storedRawValue(): string {
        return this.inputManager.storedRawValue;
    }

    get value(): number {
        return this.clearMask(this.rawValue);
    }

    set value(value: number) {
        this.rawValue = this.applyMask(true, "" + value);
    }

    private isNullOrUndefined(value: any) {
        return value === null || value === undefined;
    }
}
