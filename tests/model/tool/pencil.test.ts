import {v} from "../../../src/model/space";
import {History} from "../../../src/model/history";
import {Pencil} from "../../../src/model/tools/pencil";

describe('Pencil tool', () => {
    let tool: Pencil
    let history: History
    beforeEach(() => {
        tool = new Pencil();
        history = new History();
    });

    it('creates point on when started and not moved', async () => {
        tool.onStart(v(1, 1), null);
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.topLayer()).not.toBeNull();
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(origin).toEqual(v(1, 1));
        expect(shape.type).toEqual('Freeform');
        expect(shape.pixels).toHaveLength(1);
        expect(shape.pixels).toContainEqual({ color: 'black', pos: v(0, 0) });
    });

    it('creates freeform shape of single stroke', async () => {
        tool.onStart(v(1, 1), null);
        tool.onMove(v(3, 3));
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.topLayer()).not.toBeNull();
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(origin).toEqual(v(1, 1));
        expect(shape.type).toEqual('Freeform');
        expect(shape.pixels).toHaveLength(3);
        expect(shape.pixels).toContainEqual({ color: 'black', pos: v(0, 0) });
        expect(shape.pixels).toContainEqual({ color: 'black', pos: v(1, 1) });
        expect(shape.pixels).toContainEqual({ color: 'black', pos: v(2, 2) });
    });

    it('creates freeform shape of multiple strokes', async () => {
        tool.onStart(v(1, 1), null);
        tool.onMove(v(3, 3));
        tool.onMove(v(3, 2));
        tool.onMove(v(2, 0));
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.topLayer()).not.toBeNull();
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(origin).toEqual(v(1, 1));
        expect(shape.type).toEqual('Freeform');
        expect(shape.pixels).toHaveLength(6);
        expect(shape.pixels).toContainEqual({ color: 'black', pos: v(0, 0) });
        expect(shape.pixels).toContainEqual({ color: 'black', pos: v(1, 1) });
        expect(shape.pixels).toContainEqual({ color: 'black', pos: v(2, 2) });
        expect(shape.pixels).toContainEqual({ color: 'black', pos: v(2, 1) });
        expect(shape.pixels).toContainEqual({ color: 'black', pos: v(2, 0) });
        expect(shape.pixels).toContainEqual({ color: 'black', pos: v(1, -1) });
    });


    it('deduplicates crossed-over pixels', async () => {
        tool.onStart(v(1, 1), null);
        tool.onMove(v(3, 3));
        tool.onMove(v(1, 1));
        await history.handleNow(...tool.onFinish());

        expect(history.canvas.topLayer()).not.toBeNull();
        expect(history.canvas.topLayer()?.topShape()).not.toBeFalsy();
        const {shape, origin} = history.canvas.topLayer()!.topShape()!;
        expect(origin).toEqual(v(1, 1));
        expect(shape.type).toEqual('Freeform');
        expect(shape.pixels).toHaveLength(3);
    });

});