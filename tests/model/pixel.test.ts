import {blend} from "../../src/model/pixel";

describe('pixel', () => {

    describe('blend', () => {

        it('blends in normal mode', () => {
            expect(blend('normal', null, null)).toBeNull();
            expect(blend('normal', 'black', null)).toBe('black');
            expect(blend('normal', 'white', null)).toBe('white');
            expect(blend('normal', 'white', 'black')).toBe('black');
            expect(blend('normal', null, 'black')).toBe('black');
            expect(blend('normal', null, 'white')).toBe('white');
        });

        it('blends in invert mode', () => {
            expect(blend('invert', null, null)).toBeNull();
            expect(blend('invert', 'black', null)).toBe('black');
            expect(blend('invert', 'white', null)).toBe('white');
            expect(blend('invert', 'white', 'black')).toBe('black');
            expect(blend('invert', 'black', 'black')).toBe('white');
            expect(blend('invert', null, 'black')).toBe('black');
            expect(blend('invert', null, 'white')).toBe('white');
        });

    });

});
