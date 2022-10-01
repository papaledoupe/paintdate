import {Pattern} from "../../../src/model/playdate/pattern";
import {v} from "../../../src/model/space";

describe('Pattern', () => {

    describe('to/fromHexString', () => {

        it('can be read as hex string', () => {
            const p = Pattern.fromHexString('5fee77bbddeef5bb');
            expect(p?.data).toEqual([0x5F, 0xEE, 0x77, 0xBB, 0xDD, 0xEE, 0xF5, 0xBB]);
        });

        it('can be written as hex string', () => {
            const s = Pattern.fromData([0x5F, 0xEE, 0x77, 0xBB, 0xDD, 0xEE, 0xF5, 0xBB]).toHexString();
            expect(s).toEqual('5fee77bbddeef5bb');
        });

        it('cannot read invalid hex string', () => {
            expect(Pattern.fromHexString('')).toBeNull();
            expect(Pattern.fromHexString('5fee77bbddeef5b')).toBeNull();
            expect(Pattern.fromHexString('5fee77bbddeef5bba')).toBeNull();
        });
    });

    describe('fromTable', () => {

        it('handles lua / GFXP table', () => {
            const p = Pattern.fromTable('{0x5F, 0xEE, 0x77, 0xBB, 0xDD, 0xEE, 0xF5, 0xBB}');
            expect(p?.data).toEqual([0x5F, 0xEE, 0x77, 0xBB, 0xDD, 0xEE, 0xF5, 0xBB]);
        });

        it('does not handle invalid tables', () => {
            expect(Pattern.fromTable('')).toBeNull();
            expect(Pattern.fromTable('rubbish')).toBeNull();
            expect(Pattern.fromTable('[1, 2, 3, 4, 5, 6, 7, a]')).toBeNull();
            expect(Pattern.fromTable('{0x5F, 0xEE, 0x77, 0xBB, 0xDD, 0xEE, 0xF5, 0xBB, 0xBB}')).toBeNull();
            expect(Pattern.fromTable('{0x5F, 0xEE, 0x77, 0xBB, 0xDD, 0xEE, 0xF5}')).toBeNull();
        });

    });

    describe('grid', () => {

        it('it returns pattern as a grid', () => {
            const p = Pattern.fromTable('{0xFF, 0xDD, 0xFF, 0x77, 0xFF, 0xDD, 0xFF, 0x77}');
            expect(p).not.toBeNull();
            const grid = p!.grid;

            expect(grid.get(v(0, 0))).toEqual('white');
            expect(grid.get(v(1, 0))).toEqual('white');
            expect(grid.get(v(2, 0))).toEqual('white');
            expect(grid.get(v(3, 0))).toEqual('white');
            expect(grid.get(v(4, 0))).toEqual('white');
            expect(grid.get(v(5, 0))).toEqual('white');
            expect(grid.get(v(6, 0))).toEqual('white');
            expect(grid.get(v(7, 0))).toEqual('white');

            expect(grid.get(v(0, 1))).toEqual('white');
            expect(grid.get(v(1, 1))).toEqual('white');
            expect(grid.get(v(2, 1))).toEqual('black');
            expect(grid.get(v(3, 1))).toEqual('white');
            expect(grid.get(v(4, 1))).toEqual('white');
            expect(grid.get(v(5, 1))).toEqual('white');
            expect(grid.get(v(6, 1))).toEqual('black');
            expect(grid.get(v(7, 1))).toEqual('white');

            expect(grid.get(v(0, 2))).toEqual('white');
            expect(grid.get(v(1, 2))).toEqual('white');
            expect(grid.get(v(2, 2))).toEqual('white');
            expect(grid.get(v(3, 2))).toEqual('white');
            expect(grid.get(v(4, 2))).toEqual('white');
            expect(grid.get(v(5, 2))).toEqual('white');
            expect(grid.get(v(6, 2))).toEqual('white');
            expect(grid.get(v(7, 2))).toEqual('white');

            expect(grid.get(v(0, 3))).toEqual('black');
            expect(grid.get(v(1, 3))).toEqual('white');
            expect(grid.get(v(2, 3))).toEqual('white');
            expect(grid.get(v(3, 3))).toEqual('white');
            expect(grid.get(v(4, 3))).toEqual('black');
            expect(grid.get(v(5, 3))).toEqual('white');
            expect(grid.get(v(6, 3))).toEqual('white');
            expect(grid.get(v(7, 3))).toEqual('white');

            expect(grid.get(v(0, 4))).toEqual('white');
            expect(grid.get(v(1, 4))).toEqual('white');
            expect(grid.get(v(2, 4))).toEqual('white');
            expect(grid.get(v(3, 4))).toEqual('white');
            expect(grid.get(v(4, 4))).toEqual('white');
            expect(grid.get(v(5, 4))).toEqual('white');
            expect(grid.get(v(6, 4))).toEqual('white');
            expect(grid.get(v(7, 4))).toEqual('white');

            expect(grid.get(v(0, 5))).toEqual('white');
            expect(grid.get(v(1, 5))).toEqual('white');
            expect(grid.get(v(2, 5))).toEqual('black');
            expect(grid.get(v(3, 5))).toEqual('white');
            expect(grid.get(v(4, 5))).toEqual('white');
            expect(grid.get(v(5, 5))).toEqual('white');
            expect(grid.get(v(6, 5))).toEqual('black');
            expect(grid.get(v(7, 5))).toEqual('white');

            expect(grid.get(v(0, 6))).toEqual('white');
            expect(grid.get(v(1, 6))).toEqual('white');
            expect(grid.get(v(2, 6))).toEqual('white');
            expect(grid.get(v(3, 6))).toEqual('white');
            expect(grid.get(v(4, 6))).toEqual('white');
            expect(grid.get(v(5, 6))).toEqual('white');
            expect(grid.get(v(6, 6))).toEqual('white');
            expect(grid.get(v(7, 6))).toEqual('white');

            expect(grid.get(v(0, 7))).toEqual('black');
            expect(grid.get(v(1, 7))).toEqual('white');
            expect(grid.get(v(2, 7))).toEqual('white');
            expect(grid.get(v(3, 7))).toEqual('white');
            expect(grid.get(v(4, 7))).toEqual('black');
            expect(grid.get(v(5, 7))).toEqual('white');
            expect(grid.get(v(6, 7))).toEqual('white');
            expect(grid.get(v(7, 7))).toEqual('white');
        });

        it('it returns pattern as a grid with decimals', () => {
            const p = Pattern.fromTable('{255, 221, 255, 119, 255, 221, 255, 119}');
            expect(p).not.toBeNull();
            const grid = p!.grid;

            expect(grid.get(v(0, 0))).toEqual('white');
            expect(grid.get(v(1, 0))).toEqual('white');
            expect(grid.get(v(2, 0))).toEqual('white');
            expect(grid.get(v(3, 0))).toEqual('white');
            expect(grid.get(v(4, 0))).toEqual('white');
            expect(grid.get(v(5, 0))).toEqual('white');
            expect(grid.get(v(6, 0))).toEqual('white');
            expect(grid.get(v(7, 0))).toEqual('white');

            expect(grid.get(v(0, 1))).toEqual('white');
            expect(grid.get(v(1, 1))).toEqual('white');
            expect(grid.get(v(2, 1))).toEqual('black');
            expect(grid.get(v(3, 1))).toEqual('white');
            expect(grid.get(v(4, 1))).toEqual('white');
            expect(grid.get(v(5, 1))).toEqual('white');
            expect(grid.get(v(6, 1))).toEqual('black');
            expect(grid.get(v(7, 1))).toEqual('white');

            expect(grid.get(v(0, 2))).toEqual('white');
            expect(grid.get(v(1, 2))).toEqual('white');
            expect(grid.get(v(2, 2))).toEqual('white');
            expect(grid.get(v(3, 2))).toEqual('white');
            expect(grid.get(v(4, 2))).toEqual('white');
            expect(grid.get(v(5, 2))).toEqual('white');
            expect(grid.get(v(6, 2))).toEqual('white');
            expect(grid.get(v(7, 2))).toEqual('white');

            expect(grid.get(v(0, 3))).toEqual('black');
            expect(grid.get(v(1, 3))).toEqual('white');
            expect(grid.get(v(2, 3))).toEqual('white');
            expect(grid.get(v(3, 3))).toEqual('white');
            expect(grid.get(v(4, 3))).toEqual('black');
            expect(grid.get(v(5, 3))).toEqual('white');
            expect(grid.get(v(6, 3))).toEqual('white');
            expect(grid.get(v(7, 3))).toEqual('white');

            expect(grid.get(v(0, 4))).toEqual('white');
            expect(grid.get(v(1, 4))).toEqual('white');
            expect(grid.get(v(2, 4))).toEqual('white');
            expect(grid.get(v(3, 4))).toEqual('white');
            expect(grid.get(v(4, 4))).toEqual('white');
            expect(grid.get(v(5, 4))).toEqual('white');
            expect(grid.get(v(6, 4))).toEqual('white');
            expect(grid.get(v(7, 4))).toEqual('white');

            expect(grid.get(v(0, 5))).toEqual('white');
            expect(grid.get(v(1, 5))).toEqual('white');
            expect(grid.get(v(2, 5))).toEqual('black');
            expect(grid.get(v(3, 5))).toEqual('white');
            expect(grid.get(v(4, 5))).toEqual('white');
            expect(grid.get(v(5, 5))).toEqual('white');
            expect(grid.get(v(6, 5))).toEqual('black');
            expect(grid.get(v(7, 5))).toEqual('white');

            expect(grid.get(v(0, 6))).toEqual('white');
            expect(grid.get(v(1, 6))).toEqual('white');
            expect(grid.get(v(2, 6))).toEqual('white');
            expect(grid.get(v(3, 6))).toEqual('white');
            expect(grid.get(v(4, 6))).toEqual('white');
            expect(grid.get(v(5, 6))).toEqual('white');
            expect(grid.get(v(6, 6))).toEqual('white');
            expect(grid.get(v(7, 6))).toEqual('white');

            expect(grid.get(v(0, 7))).toEqual('black');
            expect(grid.get(v(1, 7))).toEqual('white');
            expect(grid.get(v(2, 7))).toEqual('white');
            expect(grid.get(v(3, 7))).toEqual('white');
            expect(grid.get(v(4, 7))).toEqual('black');
            expect(grid.get(v(5, 7))).toEqual('white');
            expect(grid.get(v(6, 7))).toEqual('white');
            expect(grid.get(v(7, 7))).toEqual('white');
        });


        it('it returns pattern as a grid with mask', () => {
            const p = Pattern.fromTable('{0xFF, 0xDD, 0xFF, 0x77, 0xFF, 0xDD, 0xFF, 0x77, 0, 34, 0, 136, 0, 34, 0, 136}');
            expect(p).not.toBeNull();
            const grid = p!.grid;

            expect(grid.get(v(0, 0))).toEqual(null);
            expect(grid.get(v(1, 0))).toEqual(null);
            expect(grid.get(v(2, 0))).toEqual(null);
            expect(grid.get(v(3, 0))).toEqual(null);
            expect(grid.get(v(4, 0))).toEqual(null);
            expect(grid.get(v(5, 0))).toEqual(null);
            expect(grid.get(v(6, 0))).toEqual(null);
            expect(grid.get(v(7, 0))).toEqual(null);

            expect(grid.get(v(0, 1))).toEqual(null);
            expect(grid.get(v(1, 1))).toEqual(null);
            expect(grid.get(v(2, 1))).toEqual('black');
            expect(grid.get(v(3, 1))).toEqual(null);
            expect(grid.get(v(4, 1))).toEqual(null);
            expect(grid.get(v(5, 1))).toEqual(null);
            expect(grid.get(v(6, 1))).toEqual('black');
            expect(grid.get(v(7, 1))).toEqual(null);

            expect(grid.get(v(0, 2))).toEqual(null);
            expect(grid.get(v(1, 2))).toEqual(null);
            expect(grid.get(v(2, 2))).toEqual(null);
            expect(grid.get(v(3, 2))).toEqual(null);
            expect(grid.get(v(4, 2))).toEqual(null);
            expect(grid.get(v(5, 2))).toEqual(null);
            expect(grid.get(v(6, 2))).toEqual(null);
            expect(grid.get(v(7, 2))).toEqual(null);

            expect(grid.get(v(0, 3))).toEqual('black');
            expect(grid.get(v(1, 3))).toEqual(null);
            expect(grid.get(v(2, 3))).toEqual(null);
            expect(grid.get(v(3, 3))).toEqual(null);
            expect(grid.get(v(4, 3))).toEqual('black');
            expect(grid.get(v(5, 3))).toEqual(null);
            expect(grid.get(v(6, 3))).toEqual(null);
            expect(grid.get(v(7, 3))).toEqual(null);

            expect(grid.get(v(0, 4))).toEqual(null);
            expect(grid.get(v(1, 4))).toEqual(null);
            expect(grid.get(v(2, 4))).toEqual(null);
            expect(grid.get(v(3, 4))).toEqual(null);
            expect(grid.get(v(4, 4))).toEqual(null);
            expect(grid.get(v(5, 4))).toEqual(null);
            expect(grid.get(v(6, 4))).toEqual(null);
            expect(grid.get(v(7, 4))).toEqual(null);

            expect(grid.get(v(0, 5))).toEqual(null);
            expect(grid.get(v(1, 5))).toEqual(null);
            expect(grid.get(v(2, 5))).toEqual('black');
            expect(grid.get(v(3, 5))).toEqual(null);
            expect(grid.get(v(4, 5))).toEqual(null);
            expect(grid.get(v(5, 5))).toEqual(null);
            expect(grid.get(v(6, 5))).toEqual('black');
            expect(grid.get(v(7, 5))).toEqual(null);

            expect(grid.get(v(0, 6))).toEqual(null);
            expect(grid.get(v(1, 6))).toEqual(null);
            expect(grid.get(v(2, 6))).toEqual(null);
            expect(grid.get(v(3, 6))).toEqual(null);
            expect(grid.get(v(4, 6))).toEqual(null);
            expect(grid.get(v(5, 6))).toEqual(null);
            expect(grid.get(v(6, 6))).toEqual(null);
            expect(grid.get(v(7, 6))).toEqual(null);

            expect(grid.get(v(0, 7))).toEqual('black');
            expect(grid.get(v(1, 7))).toEqual(null);
            expect(grid.get(v(2, 7))).toEqual(null);
            expect(grid.get(v(3, 7))).toEqual(null);
            expect(grid.get(v(4, 7))).toEqual('black');
            expect(grid.get(v(5, 7))).toEqual(null);
            expect(grid.get(v(6, 7))).toEqual(null);
            expect(grid.get(v(7, 7))).toEqual(null);
        });

    });

});
