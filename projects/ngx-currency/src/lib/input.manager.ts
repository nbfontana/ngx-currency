export class InputManager {
  private _storedRawValue: string | null = null;

  constructor(private readonly _htmlInputElement: HTMLInputElement) {}

  setCursorAt(position: number): void {
    this._htmlInputElement.focus();
    this._htmlInputElement.setSelectionRange(position, position);
  }

  updateValueAndCursor(
    newRawValue: string,
    oldLength: number,
    selectionStart: number,
  ): void {
    this.rawValue = newRawValue;
    const newLength = newRawValue.length;
    selectionStart = selectionStart - (oldLength - newLength);
    this.setCursorAt(selectionStart);
  }

  get canInputMoreNumbers(): boolean {
    const onlyNumbers =
      this.rawValue?.replace(/[^0-9\u0660-\u0669\u06F0-\u06F9]/g, '') ?? '';
    const hasReachedMaxLength = !(
      onlyNumbers.length >= this._htmlInputElement.maxLength &&
      this._htmlInputElement.maxLength >= 0
    );
    const selectionStart = this.inputSelection.selectionStart;
    const selectionEnd = this.inputSelection.selectionEnd;
    const haveNumberSelected = !!(
      selectionStart != selectionEnd &&
      this._htmlInputElement.value
        .substring(selectionStart, selectionEnd)
        .match(/[^0-9\u0660-\u0669\u06F0-\u06F9]/)
    );
    const startWithZero = this._htmlInputElement.value.substring(0, 1) == '0';
    return hasReachedMaxLength || haveNumberSelected || startWithZero;
  }

  get inputSelection(): {
    selectionStart: number;
    selectionEnd: number;
  } {
    return {
      selectionStart: this._htmlInputElement.selectionStart ?? 0,
      selectionEnd: this._htmlInputElement.selectionEnd ?? 0,
    };
  }

  get rawValue(): string | null {
    return this._htmlInputElement && this._htmlInputElement.value;
  }
  set rawValue(value: string | null) {
    this._storedRawValue = value;

    if (this._htmlInputElement) {
      this._htmlInputElement.value = value ?? '';
    }
  }

  get storedRawValue(): string {
    return this._storedRawValue || '';
  }
}
