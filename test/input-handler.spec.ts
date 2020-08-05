import { expect } from "chai";
import { stub } from 'sinon';
import { CurrencyMaskConfig, CurrencyMaskInputMode } from "../src/currency-mask.config";
import { InputHandler } from "../src/input.handler";
import { InputService } from './../src/input.service';
import { MockHtmlInputElement } from "./mock-html-input-element";

describe('Testing InputHandler', () => {

    let options: CurrencyMaskConfig;
    let inputElement: HTMLInputElement;
    let inputHandler: InputHandler;
    let inputService: InputService;

    beforeEach(() => {
        inputElement = new MockHtmlInputElement(0, 0) as unknown as HTMLInputElement;
        options = {
            prefix: '',
            suffix: '',
            thousands: '.',
            decimal: ',',
            allowNegative: false,
            nullable: false,
            align: 'right',
            allowZero: true,
            precision: 0,
        };

        inputHandler = new InputHandler(inputElement, options);
        inputService = inputHandler['inputService'];

        inputHandler.setOnModelChange(stub());
    });

    describe('handleInput', () => {
        beforeEach(() => {
          options.prefix = '$';

          // Invoke async callbacks synchronously.
          inputHandler['timer'] = (callback: () => void, delayMillis: number) => {
            callback();
          }
        });

        it('handles more than 1 character changes', () => {
            inputService.rawValue = '$12.345';
            inputElement.selectionStart = 5;
            inputService.inputManager['_storedRawValue'] = '$123';

            inputHandler.handleInput(null);
            expect(inputService.rawValue).to.be.equal('$12.345');
            expect(inputHandler['onModelChange']).to.be.calledWith(12345);
        });

        it('handles 1 character removed', () => {
            inputService.rawValue = '$1.245';
            inputElement.selectionStart = 4;
            inputService.inputManager['_storedRawValue'] = '$12.345';

            inputHandler.handleInput(null);
            expect(inputService.rawValue).to.be.equal('$1.245');
            expect(inputHandler['onModelChange']).to.be.calledWith(1245);
        });

        it('handles last character removed in natural mode', () => {
            options.precision = 2;
            options.inputMode = CurrencyMaskInputMode.NATURAL;
            inputService.rawValue = '$123,4';
            inputElement.selectionStart = 6;
            inputService.inputManager['_storedRawValue'] = '$123,45';

            inputHandler.handleInput(null);
            expect(inputService.rawValue).to.be.equal('$123,40');
            expect(inputElement.selectionStart).to.be.equal(6);
            expect(inputHandler['onModelChange']).to.be.calledWith(123.40);
        });

        it('handles 1 character added', () => {
            inputService.rawValue = '$123.945';
            inputElement.selectionStart = 6;
            inputService.inputManager['_storedRawValue'] = '$12.345';

            inputHandler.handleInput(null);
            expect(inputService.rawValue).to.be.equal('$123.945');
            expect(inputHandler['onModelChange']).to.be.calledWith(123945);
        });

        it('handles 1 character added in natural mode after decimal', () => {
            options.precision = 2;
            options.inputMode = CurrencyMaskInputMode.NATURAL;
            inputService.rawValue = '$123,945';
            inputElement.selectionStart = 6;
            inputService.inputManager['_storedRawValue'] = '$123,45';

            inputHandler.handleInput(null);
            expect(inputService.rawValue).to.be.equal('$123,95');
            expect(inputElement.selectionStart).to.be.equal(6);
            expect(inputHandler['onModelChange']).to.be.calledWith(123.95);
        });

        it('handles 1 character added in natural mode before decimal', () => {
            options.precision = 2;
            options.inputMode = CurrencyMaskInputMode.NATURAL;
            inputService.rawValue = '$1293,45';
            inputElement.selectionStart = 4;
            inputService.inputManager['_storedRawValue'] = '$123,45';

            inputHandler.handleInput(null);
            expect(inputService.rawValue).to.be.equal('$1.293,45');
            expect(inputElement.selectionStart).to.be.equal(5);
            expect(inputHandler['onModelChange']).to.be.calledWith(1293.45);
        });
    });

    describe('handleKeydown', () => {
        it('should call clearValue if all text selected', () => {
            options.prefix = '$$$';
            options.suffix = 'SU';
            inputService.rawValue = '$$$1,23SU';
            inputElement.selectionStart = 0;
            inputElement.selectionEnd = 9;
            inputHandler.clearValue = stub();

            const event = {
                keyCode: 8,
                preventDefault: stub(),
            }
            inputHandler.handleKeydown(event);
            expect(event.preventDefault).to.be.calledOnce;
            expect(inputHandler.clearValue).to.be.calledOnce;
        });

        it('should call clearValue if partial prefix through partial suffix selected', () => {
            options.prefix = '$$$';
            options.suffix = 'SU';
            inputService.rawValue = '$$$1,23SU';
            inputElement.selectionStart = 1;
            inputElement.selectionEnd = 8;
            inputHandler.clearValue = stub();

            const event = {
                keyCode: 46,
                preventDefault: stub(),
            }
            inputHandler.handleKeydown(event);
            expect(event.preventDefault).to.be.calledOnce;
            expect(inputHandler.clearValue).to.be.calledOnce;
        });

        it('should call clearValue if all numbers selected', () => {
            options.prefix = '$$$';
            options.suffix = 'SU';
            inputService.rawValue = '$$$1,23SU';
            inputElement.selectionStart = 3;
            inputElement.selectionEnd = 7;
            inputHandler.clearValue = stub();

            const event = {
                keyCode: 63272,
                preventDefault: stub(),
            }
            inputHandler.handleKeydown(event);
            expect(event.preventDefault).to.be.calledOnce;
            expect(inputHandler.clearValue).to.be.calledOnce;
        });

        it('should call removeNumber if subset of numbers selected', () => {
            options.prefix = '$$$';
            options.suffix = 'SU';
            inputService.rawValue = '$$$1,23SU';
            inputElement.selectionStart = 3;
            inputElement.selectionEnd = 4;
            inputService.removeNumber = stub();

            const event = {
                keyCode: 46,
                preventDefault: stub(),
            }
            inputHandler.handleKeydown(event);
            expect(event.preventDefault).to.be.calledOnce;
            expect(inputService.removeNumber).to.be.calledWith(46);
            expect(inputHandler['onModelChange']).to.be.called;
        });

        it('should call removeNumber if cursor inside number area', () => {
            options.prefix = '$$$';
            options.suffix = 'SU';
            inputService.rawValue = '$$$1,23SU';
            inputElement.selectionStart = 5;
            inputElement.selectionEnd = 5;
            inputService.removeNumber = stub();

            const event = {
                keyCode: 8,
                preventDefault: stub(),
            }
            inputHandler.handleKeydown(event);
            expect(event.preventDefault).to.be.calledOnce;
            expect(inputService.removeNumber).to.be.calledWith(8);
            expect(inputHandler['onModelChange']).to.be.called;
        });
    });
});
