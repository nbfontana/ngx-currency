# ngx-currency

[![Build Status](https://travis-ci.org/nbfontana/ngx-currency.svg?branch=master)](https://travis-ci.org/nbfontana/ngx-currency)
[![npm version](https://badge.fury.io/js/ngx-currency.png)](http://badge.fury.io/js/ngx-currency)
[![devDependency Status](https://david-dm.org/nbfontana/ngx-currency/dev-status.png)](https://david-dm.org/nbfontana/ngx-currency?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/nbfontana/ngx-currency.png)](https://github.com/nbfontana/ngx-currency/issues)
[![GitHub stars](https://img.shields.io/github/stars/nbfontana/ngx-currency.png)](https://github.com/nbfontana/ngx-currency/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.png)](https://raw.githubusercontent.com/nbfontana/ngx-currency/master/LICENSE)

## Demo

https://nbfontana.github.io/ngx-currency/

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Documentation](https://nbfontana.github.io/ngx-currency/docs/)
- [Development](#development)
- [License](#license)

## About

## Getting Started

### Installing and Importing

Install the package by command:

```sh
    npm install ngx-currency --save
```

Import the module

```ts
import { NgxCurrencyModule } from "ngx-currency";

@NgModule({
    imports: [
        ...
        NgxCurrencyModule
    ],
    declarations: [...],
    providers: [...]
})
export class AppModule {}
```

### Using 

```html
<input currencyMask formControlName="value" />
```

 * `ngModel` An attribute of type number. If is displayed `'$ 25.63'`, the attribute will be `'25.63'`.

### Options 

You can set options...

```html
<!-- example for pt-BR money -->
<input currencyMask formControlName="value" [options]="{ prefix: 'R$ ', thousands: '.', decimal: ',' }"/>
```  

Available options: 

 * `align` - Text alignment in input. (default: `right`)
 * `allowNegative` - If `true` can input negative values.  (default: `true`)
 * `decimal` -  Separator of decimals (default: `'.'`)
 * `precision` - Number of decimal places (default: `2`)
 * `prefix` - Money prefix (default: `'$ '`)
 * `suffix` - Money suffix (default: `''`)
 * `thousands` - Separator of thousands (default: `','`)
 * `nullable` - when true, the value of the clean field will be `null`, when false the value will be `0`
 * `min` - The minimum value (default: `undefined`)
 * `max` - The maximum value (default: `undefined`)
 * `inputMode` - Determines how to handle numbers as the user types them (default: `FINANCIAL`)

Input Modes:

 * `FINANCIAL` - Numbers start at the highest precision decimal. Typing a number shifts numbers left.
                 The decimal character is ignored. Most cash registers work this way. For example:
   * Typing `'12'` results in `'0.12'`
   * Typing `'1234'` results in `'12.34'`
   * Typing `'1.234'` results in `'12.34'`
 * `NATURAL` - Numbers start to the left of the decimal. Typing a number to the left of the decimal shifts
               numbers left; typing to the right of the decimal replaces the next number. Most text inputs
               and spreadsheets work this way. For example:
   * Typing `'1234'` results in `'1234'`
   * Typing `'1.234'` results in `'1.23'`
   * Typing `'12.34'` results in `'12.34'`
   * Typing `'123.4'` results in `'123.40'`

You can also set options globally...

```ts
import { CurrencyMaskInputMode, NgxCurrencyModule } from "ngx-currency";

export const customCurrencyMaskConfig = {
    align: "right",
    allowNegative: true,
    allowZero: true,
    decimal: ",",
    precision: 2,
    prefix: "R$ ",
    suffix: "",
    thousands: ".",
    nullable: true,
    min: null,
    max: null,
    inputMode: CurrencyMaskInputMode.FINANCIAL
};

@NgModule({
    imports: [
        ...
        NgxCurrencyModule.forRoot(customCurrencyMaskConfig)
    ],
    declarations: [...],
    providers: [...],
    bootstrap: [AppComponent]
})
export class AppModule {}
```

## Quick fixes

### Ionic 2-3

Input not working on mobile keyboard

```html
<!-- Change the type to 'tel' -->
    <input currencyMask type="tel" formControlName="value" />
```

Input focus get hide by the mobile keyboard

on HTML
```html
<!-- Change the type to 'tel' -->
    <input currencyMask type="tel" formControlName="value" [id]="'yourInputId' + index" (focus)="scrollTo(index)" />
```

on .ts
```ts
import { Content } from 'ionic-angular';

export class...

    @ViewChild(Content) content: Content;
  
    scrollTo(index) {
        let yOffset = document.getElementById('yourInputId' + index).offsetTop;
        this.content.scrollTo(0, yOffset + 20);
    }
```

## Development

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM
* Install local dev dependencies: `npm install` while current directory is this repo

### Development server
Run `npm start` or `npm run demo` to start a development server on port 8000 with auto reload + tests.

### Testing
* Run `npm test` to run tests once
* Run `npm run test:watch` to continually run tests in headless mode
* Run `npm run test:watch-browser` to continually run tests in the Chrome browser

When running in the Chrome browser, you can set code breakpoints to debug tests using these instructions:
* From the main Karma browser page, click the `Debug` button to open the debug window
* Press `ctrl + shift + i` to open Chrome developer tools
* Press `ctrl + p` to search for a file to debug
* Enter a file name like `input.handler.ts` and click the file
* Within the file, click on a row number to set a breakpoint
* Refresh the browser window to re-run tests and stop on the breakpoint

## License

MIT @ Neri Bez Fontana
