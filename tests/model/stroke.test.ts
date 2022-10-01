import {dashedStroke, dottedStroke, solidStroke} from "../../src/model/stroke";
import {v} from "../../src/model/space";

describe('stroke', () => {

    describe('solid', () => {
        it('produces solid line', () => {
            const stroke = solidStroke("black");
            expect(stroke.pixelColor(v(0, 0), 0)).toEqual("black");
            expect(stroke.pixelColor(v(1, 0), 1)).toEqual("black");
            expect(stroke.pixelColor(v(2, 0), 2)).toEqual("black");
            expect(stroke.pixelColor(v(3, 0), 3)).toEqual("black");
        });
    });

    describe('line pattern', () => {

        describe('dotted', () => {
            it('produces dotted line', () => {
                const stroke = dottedStroke("test", "black");
                expect(stroke.pixelColor(v(0, 0), 0)).toEqual("black");
                expect(stroke.pixelColor(v(1, 0), 1)).toEqual(null);
                expect(stroke.pixelColor(v(2, 0), 2)).toEqual("black");
                expect(stroke.pixelColor(v(3, 0), 3)).toEqual(null);
            });

            it('produces a dotted line with extra spacing', () => {
                const stroke = dottedStroke("test", "black", 2);
                expect(stroke.pixelColor(v(0, 0), 0)).toEqual("black");
                expect(stroke.pixelColor(v(1, 0), 1)).toEqual(null);
                expect(stroke.pixelColor(v(2, 0), 2)).toEqual(null);
                expect(stroke.pixelColor(v(3, 0), 3)).toEqual("black");
                expect(stroke.pixelColor(v(4, 0), 1)).toEqual(null);
                expect(stroke.pixelColor(v(5, 0), 2)).toEqual(null);
                expect(stroke.pixelColor(v(6, 0), 3)).toEqual("black");
            })
        });

        describe('dashed', () => {
            it('produces dashed line of given length', () => {
                const stroke = dashedStroke("test", "black", 2);
                expect(stroke.pixelColor(v(0, 0), 0)).toEqual("black");
                expect(stroke.pixelColor(v(1, 0), 1)).toEqual("black");
                expect(stroke.pixelColor(v(2, 0), 2)).toEqual(null);
                expect(stroke.pixelColor(v(3, 0), 3)).toEqual("black");
                expect(stroke.pixelColor(v(4, 0), 4)).toEqual("black");
                expect(stroke.pixelColor(v(5, 0), 5)).toEqual(null);
            });
        });

    });

});
