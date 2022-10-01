import {Select} from "../../../src/model/tools/select";
import {addShapeCommand} from "../../../src/model/canvas";
import {History, pasteCommand} from "../../../src/model/history";
import {rect} from "../../../src/model/shapes/rect";
import {v} from "../../../src/model/space";
import {solidStroke} from "../../../src/model/stroke";
import {Freeform} from "../../../src/model/shapes/freeform";

describe('Select tool', () => {

    let tool: Select
    beforeEach(() => tool = new Select());

    describe('copy', () => {

        it('adds new shape copied from selected area when pasted', async () => {
            const history = new History();
            await history.handleNow(addShapeCommand({
                shape: rect({
                    size: v(3, 3),
                    stroke: solidStroke('black'),
                }),
            }));

            tool.onStart(v(0, 0), history.canvas.topLayer());
            tool.onMove(v(0, 0));
            tool.onMove(v(1, 1));
            tool.onFinish();

            await history.handleNow(...tool.copy(), pasteCommand());

            expect(history.canvas.topLayer()?.shapes).toHaveLength(2);
            const pasted = history.canvas.topLayer()!.topShape()!.shape;
            expect(pasted.pixels).toHaveLength(3);
            expect(pasted.pixels.map(p => p.color)).not.toContain('white');
            expect(pasted.pixels.map(p => p.pos)).toContainEqual(v(0, 0));
            expect(pasted.pixels.map(p => p.pos)).toContainEqual(v(1, 0));
            expect(pasted.pixels.map(p => p.pos)).toContainEqual(v(0, 1));
        });

        it('does not merge freeform shapes when pasting', async () => {
            // this was a bug.

            const history = new History();
            await history.handleNow(addShapeCommand({
                shape: Freeform.from(rect({
                    size: v(3, 3),
                    stroke: solidStroke('black'),
                })),
            }));

            tool.onStart(v(0, 0), history.canvas.topLayer());
            tool.onMove(v(0, 0));
            tool.onMove(v(1, 1));
            tool.onFinish();

            await history.handleNow(...tool.copy(), pasteCommand());

            expect(history.canvas.topLayer()?.shapes).toHaveLength(2);
        });

    });

});
