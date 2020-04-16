export class MockHtmlInputElement {

    public focused: boolean;
    public value = '';

    constructor(
        public selectionStart: number,
        public selectionEnd: number,
    ) { }

    public focus(): void {
        this.focused = true;
    }

    public setSelectionRange(selectionStart: number, selectionEnd: number): void {
        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;
    }
}
