import {InputService} from "./input.service";
import {CurrencyMaskInputMode} from "./currency-mask.config";

export class InputHandler {

    private inputService: InputService;
    private onModelChange: Function;
    private onModelTouched: Function;

    constructor(htmlInputElement: HTMLInputElement, options: any) {
        this.inputService = new InputService(htmlInputElement, options);
    }

    handleCut(event: any): void {
        setTimeout(() => {
            this.inputService.updateFieldValue();
            this.setValue(this.inputService.value);
            this.onModelChange(this.inputService.value);
        }, 0);
    }

    handleInput(event: any): void {
        let keyPressed = event.data;
        let rawValueLength = this.inputService.rawValue.length;
        let storedRawValueLength = this.inputService.storedRawValue.length;
        let inputSelection = this.inputService.inputSelection;

        this.setInputFieldValueAndResetCursor(this.inputService.storedRawValue);

        if (this.isFinancialMode()) {
            if (rawValueLength != inputSelection.selectionEnd ||
                Math.abs(rawValueLength - storedRawValueLength) != 1) {
                this.setCursorPositionToEnd(event);
                this.fixateCursorAfterZeroTimeout();
                return;
            }
        } else {
            this.adjustCursorForNaturalMode(keyPressed === null, inputSelection.selectionStart);
        }

        if (rawValueLength < storedRawValueLength) {
            this.inputService.removeNumber(8);
        }

        if (rawValueLength > storedRawValueLength) {
            switch (keyPressed) {
                case "+":
                    this.inputService.changeToPositive();
                    break;
                case "-":
                    this.inputService.changeToNegative();
                    break;
                default:
                    if (!this.inputService.canInputMoreNumbers) {
                        return;
                    }

                    this.inputService.addNumber(keyPressed.charCodeAt(0));
                    break;
            }
        }

        this.fixateCursorAfterZeroTimeout();
        this.onModelChange(this.inputService.value);
    }

    handleKeydown(event: any): void {
        let keyCode = event.which || event.charCode || event.keyCode;
        if (keyCode == 8 || keyCode == 46 || keyCode == 63272) {
            event.preventDefault();

            if (this.inputService.inputSelection.selectionStart <= this.inputService.prefixLength() &&
                this.inputService.inputSelection.selectionEnd >= this.inputService.rawValue.length - this.inputService.suffixLength()) {
                this.clearValue();
            } else {
                this.inputService.removeNumber(keyCode);
                this.onModelChange(this.inputService.value);
            }
        }
    }

    clearValue() {
        this.setValue(this.inputService.isNullable() ? null : 0);
        this.onModelChange(this.inputService.value);
    }

    handleKeypress(event: any): void {
        let keyCode = event.which || event.charCode || event.keyCode;
        event.preventDefault();
        if (keyCode === 97 && event.ctrlKey) {
            return;
        }

        switch (keyCode) {
            case undefined:
            case 9:
            case 13:
                return;
            case 43:
                this.inputService.changeToPositive();
                break;
            case 45:
                this.inputService.changeToNegative();
                break;
            default:
                if (this.inputService.canInputMoreNumbers) {
                    let selectionRangeLength = Math.abs(this.inputService.inputSelection.selectionEnd - this.inputService.inputSelection.selectionStart);

                    if (selectionRangeLength == this.inputService.rawValue.length) {
                        this.setValue(null);
                    }

                    this.inputService.addNumber(keyCode);
                }
                break;
        }

        this.onModelChange(this.inputService.value);
    }

    handlePaste(event: any): void {
        setTimeout(() => {
            this.inputService.updateFieldValue();
            this.setValue(this.inputService.value);
            this.onModelChange(this.inputService.value);
        }, 1);
    }

    updateOptions(options: any): void {
        this.inputService.updateOptions(options);
    }

    getOnModelChange(): Function {
        return this.onModelChange;
    }

    setOnModelChange(callbackFunction: Function): void {
        this.onModelChange = callbackFunction;
    }

    getOnModelTouched(): Function {
        return this.onModelTouched;
    }

    setOnModelTouched(callbackFunction: Function) {
        this.onModelTouched = callbackFunction;
    }

    setValue(value: number): void {
        this.inputService.value = value;
    }

    private adjustCursorForNaturalMode(isRemoval: boolean, savedPosition: number): void {
        if (isRemoval) {
            this.inputService.setCursorPosition(savedPosition + 1);
        } else {
            this.inputService.setCursorPosition(savedPosition - 1);
        }
    }

    private setInputFieldValueAndResetCursor(rawValue) {
        this.inputService.rawValue = rawValue;
    }

    private fixateCursorAfterZeroTimeout(): void {
        let position = this.inputService.inputSelection.selectionStart;
        setTimeout(() =>
                this.inputService.setCursorPosition(position),
            0);
    }

    private isFinancialMode(): boolean {
        return this.inputService.getOptions().inputMode === CurrencyMaskInputMode.FINANCIAL;
    }

    private setCursorPositionToEnd(event: any): void {
        event.target.setSelectionRange(event.target.value.length, event.target.value.length);
    }
}
