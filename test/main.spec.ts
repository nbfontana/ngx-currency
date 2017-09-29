import {fakeAsync} from "@angular/core/testing";
import {expect} from "chai";

describe('***** Should be true *****', () => {
  it('Should be true', fakeAsync(() => {
    expect(true).to.equals(true);
  }));
});
