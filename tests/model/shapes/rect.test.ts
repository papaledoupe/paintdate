import {rect} from "../../../src/model/shapes/rect";
import {v} from "../../../src/model/space";
import {solidFill} from "../../../src/model/fill";
import {dottedStroke, linePatternStroke, solidStroke} from "../../../src/model/stroke";
import {fromJSON, toJSON} from "../../../src/util/json";
import {Shape} from "../../../src/model/shape";

describe('rect', () => {

    const r = rect({
        size: v(2, 4),
        fill: solidFill('white'),
        stroke: linePatternStroke('white dot', ['white', null]),
    });

    describe('serialization', () => {

        const rJson = `{
    "#type": "Rect",
    "#data": {
        "mode": "normal",
        "size": {
            "#type": "Vector2",
            "#data": [
                2,
                4
            ]
        },
        "fill": {
            "#type": "Solid",
            "#data": {
                "color": "white"
            }
        },
        "stroke": {
            "#type": "LinePattern",
            "#data": {
                "name": "white dot",
                "pattern": [
                    "white",
                    null
                ]
            }
        },
        "fillOrigin": {
            "#type": "Vector2",
            "#data": [
                0,
                0
            ]
        }
    }
}`;

        it('is reversibly serializable', () => {
            const revived = fromJSON<Shape>(toJSON(r));
            expect(revived.pixels).toEqual(r.pixels);
        });

        it('serializes to JSON', () => {
            // this test will fail if a new unignored property is added.
            // this is a good thing as we are forced to consider if we have broken backward compatibility of files.
            expect(toJSON(r, {pretty: true})).toEqual(rJson)
        });
    });

    describe('bounds', () => {

        it('returns bounding box', () => {
            const r = rect({ size: v(10, 10) });
            expect(r.bounds).toEqual([v(0, 0), v(9, 9)])
        });

    });

    describe('fill', () => {

        it('changes fill of rect', () => {
            const target = rect({
                size: v(5, 5),
                fill: solidFill('white'),
                stroke: dottedStroke('black dot', 'black'),
            });
            const fillShape = target.filled(
                v(1, 1),
                solidFill('black'),
            );
            expect(fillShape).not.toBeNull();
            expect(fillShape?.pixels).toEqual(rect({
                size: v(5, 5),
                fill: solidFill('black'),
                stroke: dottedStroke('black dot', 'black'),
            }).pixels);
        });

        it('changes stroke of rect when positioned on stroke', () => {
            const target = rect({
                size: v(5, 5),
                stroke: solidStroke('black'),
            });
            const fillShape = target.filled(
                v(0, 3),
                solidFill('white'),
            );
            expect(fillShape).not.toBeNull();
            expect(fillShape?.pixels).toEqual(rect({
                size: v(5, 5),
                stroke: solidStroke('white'),
            }).pixels);
        });

        it('does nothing when fill outside rect', () => {
            const target = rect({
                size: v(5, 5),
                stroke: linePatternStroke('white dot', ['white', null])
            });
            const fillShape = target.filled(
                v(10, 10),
                solidFill('black'),
            );
            expect(fillShape).toBeNull();
        });
    });
});
