import {linePatternStroke} from "../../src/model/stroke";
import {rect} from "../../src/model/shapes/rect";
import {Grid, v} from "../../src/model/space";
import {patternFill} from "../../src/model/fill";
import {Color} from "../../src/model/pixel";

describe('shape', () => {

    describe('rect', () => {

        describe('pixels', () => {

            it('produces stroked rectangle', () => {
                const shape = rect({
                    size: v(4, 4),
                    stroke: linePatternStroke("bw dot", ["black", "white"]),
                });

                /*
                | B | W | B | W |
                | W |   |   | B |
                | B |   |   | W |
                | W | B | W | B |
                 */
                expect(shape.pixels).toHaveLength(12);
                expect(shape.pixels).toContainEqual({ pos: v(0, 0), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(1, 0), color: "white" });
                expect(shape.pixels).toContainEqual({ pos: v(2, 0), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(3, 0), color: "white" });
                expect(shape.pixels).toContainEqual({ pos: v(3, 1), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(3, 2), color: "white" });
                expect(shape.pixels).toContainEqual({ pos: v(3, 3), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(2, 3), color: "white" });
                expect(shape.pixels).toContainEqual({ pos: v(1, 3), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(0, 3), color: "white" });
                expect(shape.pixels).toContainEqual({ pos: v(0, 2), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(0, 1), color: "white" });
            });

            it('produces filled rectangle', () => {
                /*
                | B |   | B |   |
                |   | B |   | B |
                | B |   | B |   |
                |   | B |   | B |
                 */
                const pattern = new Grid<Color>({size: v(2, 2), loop: true})
                pattern.put(v(0, 0), "black");
                pattern.put(v(1, 1), "black");
                const shape = rect({
                    size: v(4, 4),
                    fill: patternFill("p", pattern),
                });

                expect(shape.pixels).toHaveLength(8);
                expect(shape.pixels).toContainEqual({ pos: v(0, 0), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(2, 0), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(1, 1), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(3, 1), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(0, 2), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(2, 2), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(1, 3), color: "black" });
                expect(shape.pixels).toContainEqual({ pos: v(3, 3), color: "black" });
            });

        });

    });

});
