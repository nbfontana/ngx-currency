class MockHtmlInputElement {
  focused = false;
  value = '';

  constructor(
    public selectionStart: number,
    public selectionEnd: number,
  ) {}

  focus(): void {
    this.focused = true;
  }

  setSelectionRange(selectionStart: number, selectionEnd: number): void {
    this.selectionStart = selectionStart;
    this.selectionEnd = selectionEnd;
  }
}

export const createMockHtmlInputElement = (
  selectionStart: number,
  selectionEnd: number,
) =>
  new MockHtmlInputElement(
    selectionStart,
    selectionEnd,
  ) as unknown as HTMLInputElement;
