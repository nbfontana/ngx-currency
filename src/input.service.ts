import {InputManager} from "./input.manager";
import { CurrencyMaskConfig } from "./currency-mask.config";

export class InputService {

  private inputManager: InputManager;

  constructor(private htmlInputElement: any, private options: CurrencyMaskConfig) {
    this.inputManager = new InputManager(htmlInputElement);
  }

  addNumber(keyCode: number): void {
    if (!this.rawValue) {
      this.rawValue = this.applyMask(false, "0");
    }

    let keyChar = String.fromCharCode(keyCode);
    let selectionStart = this.inputSelection.selectionStart;
    let selectionEnd = this.inputSelection.selectionEnd;
    this.rawValue = this.rawValue.substring(0, selectionStart) + keyChar + this.rawValue.substring(selectionEnd, this.rawValue.length);
    this.updateFieldValue(selectionStart + 1);
  }

  applyMask(isNumber: boolean, rawValue: string): string {
    let {allowNegative, decimal, precision, prefix, suffix, thousands, nullable} = this.options;
    rawValue = isNumber ? new Number(rawValue).toFixed(precision) : rawValue;
    let onlyNumbers = rawValue.replace(/[^0-9]/g, "");

    if (!onlyNumbers) {
      return "";
    }

    let integerPart = onlyNumbers.slice(0, onlyNumbers.length - precision).replace(/^0*/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, thousands);

    if (integerPart == "") {
      integerPart = "0";
    }

    let newRawValue = integerPart;
    let decimalPart = onlyNumbers.slice(onlyNumbers.length - precision);

    if (precision > 0) {
      newRawValue += decimal + decimalPart;
    }

    let isZero = parseInt(integerPart) == 0 && (parseInt(decimalPart) == 0 || decimalPart == "");
    let operator = (rawValue.indexOf("-") > -1 && allowNegative && !isZero) ? "-" : "";
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

    return parseFloat(value);
  }

  changeToNegative(): void {
    if (this.options.allowNegative && this.rawValue != "" && this.rawValue.charAt(0) != "-" && this.value != 0) {
      this.rawValue = "-" + this.rawValue;
    }
  }

  changeToPositive(): void {
    this.rawValue = this.rawValue.replace("-", "");
  }

  removeNumber(keyCode: number): void {
    if (this.isNullable() && this.value == 0){
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
    move = (
      (
        keyCode == 8 &&
        selectionStart - 1 === 0 &&
        !(this.rawValue.substr(selectionStart, 1).match(/\d/))
      ) ||
      (
        (keyCode == 46 || keyCode == 63272) &&
        selectionStart === 0 &&
        !(this.rawValue.substr(selectionStart + 1, 1).match(/\d/))
      )
    ) ? 1 : move;
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

  prefixLenght():any{
    return this.options.prefix.length;
  }

  isNullable(){
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
}
