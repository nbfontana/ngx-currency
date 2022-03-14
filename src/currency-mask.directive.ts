import {
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  forwardRef,
  HostListener,
  Inject,
  KeyValueDiffer,
  KeyValueDiffers,
  Input,
  OnInit,
  Optional,
  OnDestroy,
  NgZone
} from "@angular/core";

import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {CurrencyMaskConfig, CURRENCY_MASK_CONFIG, CurrencyMaskInputMode} from "./currency-mask.config";
import {InputHandler} from "./input.handler";

export const CURRENCYMASKDIRECTIVE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CurrencyMaskDirective),
  multi: true,
};

// Do not store the condition on the class since it'll be executed every time the instance is created.
const IS_CHROME_ANDROID =
  typeof navigator !== 'undefined' &&
  !!navigator.userAgent &&
  /chrome/i.test(navigator.userAgent) &&
  /android/i.test(navigator.userAgent);

@Directive({
    selector: "[currencyMask]",
    providers: [CURRENCYMASKDIRECTIVE_VALUE_ACCESSOR]
})
export class CurrencyMaskDirective
  implements AfterViewInit, ControlValueAccessor, DoCheck, OnInit, OnDestroy
{
  @Input() options: Partial<CurrencyMaskConfig> = {};

  public inputHandler: InputHandler;
  public keyValueDiffer: KeyValueDiffer<any, any>;

  public optionsTemplate: CurrencyMaskConfig = {
      align: "right",
      allowNegative: true,
      allowZero: true,
      decimal: ".",
      precision: 2,
      prefix: "$ ",
      suffix: "",
      thousands: ",",
      nullable: false,
      inputMode: CurrencyMaskInputMode.FINANCIAL
  };

  constructor(
    private ngZone: NgZone,
    @Optional()
    @Inject(CURRENCY_MASK_CONFIG)
    currencyMaskConfig: CurrencyMaskConfig,
    private elementRef: ElementRef<HTMLInputElement>,
    keyValueDiffers: KeyValueDiffers
  ) {
    if (currencyMaskConfig) {
      this.optionsTemplate = currencyMaskConfig;
    }

    this.keyValueDiffer = keyValueDiffers.find({}).create();
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.style.textAlign = this.options && this.options.align ? this.options.align : this.optionsTemplate.align;
  }

  ngDoCheck() {
    if (this.keyValueDiffer.diff(this.options)) {
      this.elementRef.nativeElement.style.textAlign = this.options.align ? this.options.align : this.optionsTemplate.align;
      this.inputHandler.updateOptions((<any>Object).assign({}, this.optionsTemplate, this.options));
    }
  }

  ngOnInit() {
    this.inputHandler = new InputHandler(this.elementRef.nativeElement, (<any>Object).assign({}, this.optionsTemplate, this.options));
    this.ngZone.runOutsideAngular(() => this.elementRef.nativeElement.addEventListener('drop', preventDefault));
  }

  ngOnDestroy(): void {
    this.elementRef.nativeElement.removeEventListener('drop', preventDefault);
  }

  @HostListener("blur", ["$event"])
  handleBlur(event: any) {
    this.inputHandler.getOnModelTouched().apply(event);
  }

  @HostListener("cut", ["$event"])
  handleCut(event: any) {
    if (!IS_CHROME_ANDROID) {
      !this.isReadOnly() && this.inputHandler.handleCut(event);
    }
  }

  @HostListener("input", ["$event"])
  handleInput(event: any) {
    if (IS_CHROME_ANDROID) {
      !this.isReadOnly() && this.inputHandler.handleInput(event);
    }
  }

  @HostListener("keydown", ["$event"])
  handleKeydown(event: any) {
    if (!IS_CHROME_ANDROID) {
      !this.isReadOnly() && this.inputHandler.handleKeydown(event);
    }
  }

  @HostListener("keypress", ["$event"])
  handleKeypress(event: any) {
    if (!IS_CHROME_ANDROID) {
      !this.isReadOnly() && this.inputHandler.handleKeypress(event);
    }
  }

  @HostListener("paste", ["$event"])
  handlePaste(event: any) {
    if (!IS_CHROME_ANDROID) {
      !this.isReadOnly() && this.inputHandler.handlePaste(event);
    }
  }

  isReadOnly(): boolean {
    return this.elementRef.nativeElement.hasAttribute('readonly')
  }

  registerOnChange(callbackFunction: Function): void {
    this.inputHandler.setOnModelChange(callbackFunction);
  }

  registerOnTouched(callbackFunction: Function): void {
    this.inputHandler.setOnModelTouched(callbackFunction);
  }

  setDisabledState(value: boolean): void {
    this.elementRef.nativeElement.disabled = value;
  }

  writeValue(value: number): void {
    this.inputHandler.setValue(value);
  }
}

function preventDefault(event: Event): void {
  if (!IS_CHROME_ANDROID) {
    event.preventDefault();
  }
}
