import {line} from "../../../src/model/shapes/line";
import {solidStroke} from "../../../src/model/stroke";
import {v} from "../../../src/model/space";
import {Pixel} from "../../../src/model/pixel";
import {solidFill} from "../../../src/model/fill";

describe('Line', () => {

    const posXposYLine = line({
        vector: v(5, 15),
        stroke: solidStroke('black'),
    });

    const negXnegYLine = line({
        vector: v(-5, -15),
        stroke: solidStroke('black'),
    });

    describe('pixels', () => {

        it('returns pixels exclusive of origin and end of vector - positive x and y', () => {
            const start: Pixel = {color: 'black', pos: v(0, 0)}
            const end: Pixel = {color: 'black', pos: v(5, 15)}
            expect(posXposYLine.pixels).toContainEqual(start);
            expect(posXposYLine.pixels).toContainEqual(end);
        });

        it('returns pixels exclusive of origin and end of vector - negative x and y', () => {
            const start: Pixel = {color: 'black', pos: v(0, 0)}
            const end: Pixel = {color: 'black', pos: v(-5, -15)}
            expect(negXnegYLine.pixels).toContainEqual(start);
            expect(negXnegYLine.pixels).toContainEqual(end);
        });

    });

    describe('bounds', () => {

        it('accurately returns bounding box relative to origin', () => {
            expect(posXposYLine.bounds).toEqual([v(0, 0), v(5, 15)]);
            expect(negXnegYLine.bounds).toEqual([v(-5, -15), v(0, 0)]);
        });

    });

    describe('filled', () => {

        it('changes stroke of line when positioned on line', () => {
            const target = line({ vector: v(3, 3), stroke: solidStroke('black') });
            const result = target.filled(v(2, 2), solidFill('white'));
            expect(result?.pixels).toEqual(line({ vector: v(3, 3), stroke: solidStroke('white') }).pixels);
        });

        it('does nothing when positioned off line', () => {
            const target = line({ vector: v(3, 3), stroke: solidStroke('black') });
            const result = target.filled(v(2, 1), solidFill('white'));
            expect(result).toBeNull();
        });

    });

});
