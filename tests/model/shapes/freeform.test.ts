import {basicMerge, copyArea, cutArea, Freeform, mask} from "../../../src/model/shapes/freeform";
import {v} from "../../../src/model/space";
import {rect} from "../../../src/model/shapes/rect";
import {solidFill} from "../../../src/model/fill";
import {linePatternStroke, solidStroke} from "../../../src/model/stroke";

describe('Freeform', () => {

    const ff = new Freeform({
        color: 'black',
        points: [
            v(0, 0),
            v(1, 1),
            v(1, 0),
            v(1, -1),
            v(0, -1),
            v(-1, -1),
        ],
    });

    describe('bounds', () => {

        it('has bounds relative to origin', () => {
            expect(ff.bounds).toEqual([v(-1, -1), v(1, 1)]);
        });
    })

    describe('fill', () => {

        it('completely fills solid shape', () => {
            const target = Freeform.from(rect({
                size: v(5, 5),
                fill: solidFill('white'),
            }));
            const fillShape = target.filled(
                v(1, 1),
                solidFill('black'),
            );
            expect(fillShape).not.toBeNull();
            expect(fillShape?.pixels).toHaveLength(25);
            expect(fillShape?.pixels.filter(p => p.color === 'black')).toHaveLength(25);
            expect(fillShape?.pixels.filter(p => p.color === 'white')).toHaveLength(0);
            expect(fillShape?.bounds).toEqual(target.bounds);
        });

        it('completely fills enclosed area', () => {
            const target = Freeform.from(rect({
                size: v(5, 5),
                stroke: solidStroke('white'),
            }));
            const filledShape = target.filled(
                v(1, 1),
                solidFill('black'),
            );
            expect(filledShape).not.toBeNull();
            expect(filledShape?.pixels).toHaveLength(25);
            expect(filledShape?.pixels.filter(p => p.color === 'black')).toHaveLength(9);
            expect(filledShape?.pixels.filter(p => p.color === 'white')).toHaveLength(16);
            expect(filledShape?.bounds).toEqual([v(0, 0), v(4, 4)]);
        });

        it('completely fills a contiguous line', () => {
            const target = Freeform.from(rect({
                size: v(5, 5),
                stroke: solidStroke('white'),
            }));
            const fillShape = target.filled(
                v(0, 0),
                solidFill('black'),
            );
            expect(fillShape).not.toBeNull();
            expect(fillShape?.pixels).toHaveLength(16);
            expect(fillShape?.pixels.map(p => p.color)).toContainEqual('black');
            expect(fillShape?.pixels.map(p => p.color)).not.toContainEqual('white');
            expect(fillShape?.bounds).toEqual([v(0, 0), v(4, 4)]);
        });

        it('fails to fill unenclosed area', () => {
            const target = Freeform.from(rect({
                size: v(5, 5),
                stroke: linePatternStroke("white dot", ['white', null])
            }));
            const fillShape = target.filled(
                v(1, 1),
                solidFill('black'),
            );
            expect(fillShape).toBeNull();
        });
    });

    describe('basicMerge', () => {

        it('blends merged pixels (normal)', () => {
            const merged = basicMerge(
                Freeform.from(rect({ size: v(5, 5), stroke: solidStroke('black') })),
                Freeform.from(rect({ size: v(3, 3), fill: solidFill('white') })),
                v(1, 1),
            );
            expect(merged.pixels).toHaveLength(25);
            expect(merged.pixels.filter(px => px.color === 'black')).toHaveLength(16);
            expect(merged.pixels.filter(px => px.color === 'white')).toHaveLength(9);
            expect(merged.pixels).toContainEqual({ pos: v(0, 0), color: 'black' });
            expect(merged.pixels).toContainEqual({ pos: v(1, 1), color: 'white' });
        });

        it('blends merged pixels (invert)', () => {
            const merged = basicMerge(
                Freeform.from(rect({ size: v(5, 5), fill: solidFill('black') })),
                Freeform.from(rect({ size: v(3, 3), fill: solidFill('black'), mode: 'invert' })),
                v(1, 1),
            );
            expect(merged.pixels).toHaveLength(25);
            expect(merged.pixels.filter(px => px.color === 'black')).toHaveLength(16);
            expect(merged.pixels.filter(px => px.color === 'white')).toHaveLength(9);
            expect(merged.pixels).toContainEqual({ pos: v(0, 0), color: 'black' });
            expect(merged.pixels).toContainEqual({ pos: v(1, 1), color: 'white' });
        });

    });

    describe('mask', () => {

        it('masks pixels in shape', () => {
            const masked = mask(
                Freeform.from(rect({ size: v(5, 5), fill: solidFill('black') })),
                Freeform.from(rect({ size: v(3, 3), fill: solidFill('white') })),
                v(1, 1),
            );
            expect(masked.pixels).toHaveLength(16);
            expect(new Set(masked.pixels.map(px => px.color))).toEqual(new Set().add('black'));
            expect(masked.pixels.map(px => px.pos)).toContainEqual(v(0, 0));
            expect(masked.pixels.map(px => px.pos)).not.toContainEqual(v(1, 1));
        });

    });

    describe('cutArea', () => {

        it('splits shape in two about bounds', () => {
            const shape = rect({ size: v(5, 5), fill: solidFill('black') });
            const {source, target} = cutArea(shape, [v(3, 3), v(4, 4)]);

            expect(source.pixels).toHaveLength(21);
            expect(source.pixels.filter(px => px.color === 'black')).toHaveLength(21);
            expect(target.pixels).toHaveLength(4);
            expect(target.pixels.filter(px => px.color === 'black')).toHaveLength(4);
            expect(target.pixels.map(px => px.pos)).toContainEqual(v(3, 3));
            expect(target.pixels.map(px => px.pos)).toContainEqual(v(3, 4));
            expect(target.pixels.map(px => px.pos)).toContainEqual(v(4, 3));
            expect(target.pixels.map(px => px.pos)).toContainEqual(v(4, 4));
        });

    });

    describe('copyArea', () => {

        it('returns in-bounds subset of copied shape', () => {
            const shape = rect({ size: v(5, 5), fill: solidFill('black') });
            const copied = copyArea(shape, [v(3, 3), v(4, 4)]);

            expect(copied.pixels).toHaveLength(4);
            expect(copied.pixels.filter(px => px.color === 'black')).toHaveLength(4);
            expect(copied.pixels.map(px => px.pos)).toContainEqual(v(3, 3));
            expect(copied.pixels.map(px => px.pos)).toContainEqual(v(3, 4));
            expect(copied.pixels.map(px => px.pos)).toContainEqual(v(4, 3));
            expect(copied.pixels.map(px => px.pos)).toContainEqual(v(4, 4));
        });

    });
});
