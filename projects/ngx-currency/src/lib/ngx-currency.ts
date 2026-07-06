import {
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  forwardRef,
  inject,
  input,
  KeyValueDiffer,
  KeyValueDiffers,
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
  host: {
    '(blur)': 'handleBlur($event)',
    '(cut)': 'handleCut()',
    '(input)': 'handleInput()',
    '(keydown)': 'handleKeydown($event)',
    '(paste)': 'handlePaste()',
    '(drop)': 'handleDrop($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxCurrency),
      multi: true,
    },
  ],
})
export class NgxCurrency
  implements AfterViewInit, ControlValueAccessor, DoCheck
{
  private readonly elementRef =
    inject<ElementRef<HTMLInputElement>>(ElementRef);

  readonly currencyMask = input<
    Partial<NgxCurrencyConfig>,
    string | Partial<NgxCurrencyConfig> | undefined
  >(
    {},
    {
      transform: (value: string | Partial<NgxCurrencyConfig> | undefined) =>
        !value || typeof value === 'string' ? {} : value,
    },
  );

  private readonly inputHandler: InputHandler;
  private readonly keyValueDiffer: KeyValueDiffer<
    keyof NgxCurrencyConfig,
    unknown
  >;

  private readonly optionsTemplate: NgxCurrencyConfig;

  constructor() {
    const globalOptions = inject<Partial<NgxCurrencyConfig>>(
      NGX_CURRENCY_CONFIG,
      { optional: true },
    );
    const keyValueDiffers = inject(KeyValueDiffers);

    this.optionsTemplate = {
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

    this.keyValueDiffer = keyValueDiffers.find({}).create();

    this.inputHandler = new InputHandler(this.elementRef.nativeElement, {
      ...this.optionsTemplate,
      ...this.currencyMask(),
    });
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.style.textAlign =
      this.currencyMask().align ?? this.optionsTemplate.align;
  }

  ngDoCheck() {
    if (this.keyValueDiffer.diff(this.currencyMask())) {
      this.elementRef.nativeElement.style.textAlign =
        this.currencyMask().align ?? this.optionsTemplate.align;

      this.inputHandler.updateOptions({
        ...this.optionsTemplate,
        ...this.currencyMask(),
      });
    }
  }

  protected handleBlur(event: FocusEvent) {
    this.inputHandler.getOnModelTouched().apply(event);
  }

  protected handleCut() {
    if (!this.isReadOnly()) this.inputHandler.handleCut();
  }

  protected handleInput() {
    if (!this.isReadOnly()) this.inputHandler.handleInput();
  }

  protected handleKeydown(event: KeyboardEvent) {
    if (!this.isReadOnly()) this.inputHandler.handleKeydown(event);
  }

  protected handlePaste() {
    if (!this.isReadOnly()) this.inputHandler.handlePaste();
  }

  protected handleDrop(event: DragEvent) {
    event.preventDefault();
  }

  isReadOnly(): boolean {
    return this.elementRef.nativeElement.hasAttribute('readonly');
  }

  registerOnChange(callbackFunction: (value: number | null) => void): void {
    this.inputHandler.setOnModelChange(callbackFunction);
  }

  registerOnTouched(callbackFunction: () => void): void {
    this.inputHandler.setOnModelTouched(callbackFunction);
  }

  setDisabledState(isDisabled: boolean): void {
    this.elementRef.nativeElement.disabled = isDisabled;
  }

  writeValue(value: number): void {
    this.inputHandler.setValue(value);
  }
}
