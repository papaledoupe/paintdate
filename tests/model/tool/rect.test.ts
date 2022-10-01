import {Rect} from "../../../src/model/tools/rect";
import {v} from "../../../src/model/space";
import {History} from "../../../src/model/history";

describe('Rect tool', () => {
    let tool: Rect
    beforeEach(() => tool = new Rect());

    it('creates a rect shape by dragging', async () => {
        const history = new History();

        tool.onStart(v(0, 0), null);
        tool.onMove(v(4, 4)); // should be inclusive, creating 5x5 shape
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.layers.length).toBe(1);
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(shape.type).toBe('Rect');
        expect(origin).toEqual(v(0, 0));
        expect(shape.pixels).toHaveLength(25);
    });

    it('creates a rect shape by dragging (negative x)', async () => {
        const history = new History();

        tool.onStart(v(0, 0), null);
        tool.onMove(v(-4, 4)); // should be inclusive, creating 5x5 shape
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.layers.length).toBe(1);
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(shape.type).toBe('Rect');
        expect(origin).toEqual(v(-4, 0));
        expect(shape.pixels).toHaveLength(25);
    });

    it('creates a rect shape by dragging (negative y)', async () => {
        const history = new History();

        tool.onStart(v(0, 0), null);
        tool.onMove(v(4, -4)); // should be inclusive, creating 5x5 shape
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.layers.length).toBe(1);
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(shape.type).toBe('Rect');
        expect(origin).toEqual(v(0, -4));
        expect(shape.pixels).toHaveLength(25);
    });

    it('creates a rect shape by dragging (negative x and y)', async () => {
        const history = new History();

        tool.onStart(v(0, 0), null);
        tool.onMove(v(-4, -4)); // should be inclusive, creating 5x5 shape
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.layers.length).toBe(1);
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(shape.type).toBe('Rect');
        expect(origin).toEqual(v(-4, -4));
        expect(shape.pixels).toHaveLength(25);
    });

});