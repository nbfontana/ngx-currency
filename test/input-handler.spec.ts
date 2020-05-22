import { expect } from "chai";
import { stub } from 'sinon';
import { CurrencyMaskConfig } from "../src/currency-mask.config";
import { InputHandler } from "../src/input.handler";
import { InputService } from './../src/input.service';
import { MockHtmlInputElement } from "./mock-html-input-element";

describe('Testing InputHandler', () => {

    let options: CurrencyMaskConfig;
    let inputElement: HTMLInputElement;
    let inputHandler: InputHandler;
    let inputService: InputService;

    beforeEach(function () {
        inputElement = new MockHtmlInputElement(0, 0) as unknown as HTMLInputElement;
        options = {
            prefix: '',
            suffix: '',
            thousands: '.',
            decimal: ',',
            allowNegative: false,
            showNegativeOperator: false,
            nullable: false,
            align: 'right',
            allowZero: true,
            precision: undefined,
        };

        inputHandler = new InputHandler(inputElement, options);
        inputService = inputHandler['inputService'];
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
            inputHandler.setOnModelChange(stub());

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
            inputHandler.setOnModelChange(stub());

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
