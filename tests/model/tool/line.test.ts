import {Line} from "../../../src/model/tools/line";
import {Line as LineShape} from "../../../src/model/shapes/line";
import {v} from "../../../src/model/space";
import {History} from "../../../src/model/history";
import {MemoryShortcuts} from "../../../src/model/input";
import {keys} from "../../../src/config/editor";

describe('Line tool', () => {
    let tool: Line
    let shortcuts: MemoryShortcuts
    let history: History
    beforeEach(() => {
        shortcuts = new MemoryShortcuts();
        tool = new Line({shortcuts});
        history = new History();
    });

    it('creates a line shape by dragging', async () => {
        tool.onStart(v(0, 0), null);
        tool.onMove(v(4, 4)); // should be inclusive, creating 5x5 shape
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.layers.length).toBe(1);
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(shape.type).toBe('Line');
        expect(origin).toEqual(v(0, 0));
        expect((shape as LineShape).vector).toEqual(v(4, 4));
        expect(shape.pixels).toHaveLength(5);
    });

    it('creates a line shape by dragging (negative x)', async () => {
        tool.onStart(v(0, 0), null);
        tool.onMove(v(-4, 4)); // should be inclusive, creating 5x5 shape
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.layers.length).toBe(1);
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(shape.type).toBe('Line');
        expect(origin).toEqual(v(0, 0));
        expect((shape as LineShape).vector).toEqual(v(-4, 4));
        expect(shape.pixels).toHaveLength(5);
    });

    it('creates a line shape by dragging (negative y)', async () => {
        tool.onStart(v(0, 0), null);
        tool.onMove(v(4, -4)); // should be inclusive, creating 5x5 shape
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.layers.length).toBe(1);
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(shape.type).toBe('Line');
        expect(origin).toEqual(v(0, 0));
        expect((shape as LineShape).vector).toEqual(v(4, -4));
        expect(shape.pixels).toHaveLength(5);
    });

    it('creates a line shape by dragging (negative x and y)', async () => {
        tool.onStart(v(0, 0), null);
        tool.onMove(v(-4, -4)); // should be inclusive, creating 5x5 shape
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.layers.length).toBe(1);
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(shape.type).toBe('Line');
        expect(origin).toEqual(v(0, 0));
        expect((shape as LineShape).vector).toEqual(v(-4, -4));
        expect(shape.pixels).toHaveLength(5);
    });

    it('produces line snapped to specified axes when modified', async () => {
        tool.active = true;

        shortcuts.trigger(keys.toolModify1.keystrokes[0], 'keydown');
        tool.onStart(v(0, 0), null);
        tool.onMove(v(10, 2));
        await history.handleNow(...tool.onFinish());
        shortcuts.trigger(keys.toolModify1.keystrokes[0], 'keyup');

        expect(history.canvas.layers.length).toBe(1);
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(shape.type).toBe('Line');
        expect(origin).toEqual(v(0, 0));
        expect((shape as LineShape).vector).toEqual(v(10, 0));
        expect(shape.pixels).toHaveLength(11);
    });

});