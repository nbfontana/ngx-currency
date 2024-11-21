import {
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  forwardRef,
  HostListener,
  Inject,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
  Optional,
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputHandler } from './input.handler';
import {
  NGX_CURRENCY_CONFIG,
  NgxCurrencyConfig,
  NgxCurrencyInputMode,
} from './ngx-currency.config';

@Directive({
  selector: 'input[currencyMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxCurrencyDirective),
      multi: true,
    },
  ],
})
export class NgxCurrencyDirective
  implements AfterViewInit, ControlValueAccessor, DoCheck
{
  @Input()
  set currencyMask(value: Partial<NgxCurrencyConfig> | string) {
    if (typeof value === 'string') return;

    this._options = value;
  }

  /**
   * @deprecated Use currencyMask input instead
   */
  @Input()
  set options(value: Partial<NgxCurrencyConfig>) {
    this._options = value;
  }

  private readonly _inputHandler: InputHandler;
  private readonly _keyValueDiffer: KeyValueDiffer<
    keyof NgxCurrencyConfig,
    unknown
  >;

  private _options: Partial<NgxCurrencyConfig> = {};
  private readonly _optionsTemplate: NgxCurrencyConfig;

  constructor(
    @Optional()
    @Inject(NGX_CURRENCY_CONFIG)
    globalOptions: Partial<NgxCurrencyConfig>,
    keyValueDiffers: KeyValueDiffers,
    private readonly _elementRef: ElementRef<HTMLInputElement>,
  ) {
    this._optionsTemplate = {
      align: 'right',
      allowNegative: true,
      allowZero: true,
      decimal: '.',
      precision: 2,
      prefix: '$ ',
      suffix: '',
      thousands: ',',
      nullable: false,
      inputMode: NgxCurrencyInputMode.Financial,
      ...globalOptions,
    };

    this._keyValueDiffer = keyValueDiffers.find({}).create();

    this._inputHandler = new InputHandler(this._elementRef.nativeElement, {
      ...this._optionsTemplate,
      ...this._options,
    });
  }

  ngAfterViewInit() {
    this._elementRef.nativeElement.style.textAlign =
      this._options?.align ?? this._optionsTemplate.align;
  }

  ngDoCheck() {
    if (this._keyValueDiffer.diff(this._options)) {
      this._elementRef.nativeElement.style.textAlign =
        this._options?.align ?? this._optionsTemplate.align;

      this._inputHandler.updateOptions({
        ...this._optionsTemplate,
        ...this._options,
      });
    }
  }

  @HostListener('blur', ['$event'])
  handleBlur(event: FocusEvent) {
    this._inputHandler.getOnModelTouched().apply(event);
  }

  @HostListener('cut')
  handleCut() {
    if (!this.isChromeAndroid()) {
      if (!this.isReadOnly()) this._inputHandler.handleCut();
    }
  }

  @HostListener('input')
  handleInput() {
    if (this.isChromeAndroid()) {
      if (!this.isReadOnly()) this._inputHandler.handleInput();
    }
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (!this.isChromeAndroid()) {
      if (!this.isReadOnly()) this._inputHandler.handleKeydown(event);
    }
  }

  @HostListener('keypress', ['$event'])
  handleKeypress(event: KeyboardEvent) {
    if (!this.isChromeAndroid()) {
      if (!this.isReadOnly()) this._inputHandler.handleKeypress(event);
    }
  }

  @HostListener('paste')
  handlePaste() {
    if (!this.isChromeAndroid()) {
      if (!this.isReadOnly()) this._inputHandler.handlePaste();
    }
  }

  @HostListener('drop', ['$event'])
  handleDrop(event: DragEvent) {
    if (!this.isChromeAndroid()) {
      event.preventDefault();
    }
  }

  isChromeAndroid(): boolean {
    return (
      /chrome/i.test(navigator.userAgent) &&
      /android/i.test(navigator.userAgent)
    );
  }

  isReadOnly(): boolean {
    return this._elementRef.nativeElement.hasAttribute('readonly');
  }

  registerOnChange(callbackFunction: (value: number | null) => void): void {
    this._inputHandler.setOnModelChange(callbackFunction);
  }

  registerOnTouched(callbackFunction: () => void): void {
    this._inputHandler.setOnModelTouched(callbackFunction);
  }

  setDisabledState(isDisabled: boolean): void {
    this._elementRef.nativeElement.disabled = isDisabled;
  }

  writeValue(value: number): void {
    this._inputHandler.setValue(value);
  }
}
