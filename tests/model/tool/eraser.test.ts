import {v} from "../../../src/model/space";
import {AtomicCommand, History} from "../../../src/model/history";
import {Eraser} from "../../../src/model/tools/eraser";
import {addLayerCommand, AddShapeCommand, addShapeCommand} from "../../../src/model/canvas";
import {rect} from "../../../src/model/shapes/rect";
import {solidFill} from "../../../src/model/fill";

describe('Eraser tool', () => {
    let tool: Eraser
    let history: History
    beforeEach(() => {
        tool = new Eraser();
        history = new History();
    });

    it('erases top shape of target layer', async () => {
        await history.handleNow(
            addShapeCommand({
                layerName: 'bottom',
                shape: rect({
                    size: v(2, 3),
                    fill: solidFill('white'),
                }),
            }),
            addShapeCommand({
                layerName: 'top',
                shape: rect({
                    size: v(3, 3),
                    fill: solidFill('black'),
                }),
            }),
        );

        tool.onStart(v(0, 1), history.canvas.topLayer());
        tool.onMove(v(5, 1));
        await history.handleNow(...tool.onFinish());

        const flatGrid = history.canvas.flatGrid();
        expect(flatGrid.cells.filter(c => c.value !== null)).toHaveLength(8);
        expect(flatGrid.get(v(0, 0))).toEqual('black');
        expect(flatGrid.get(v(1, 0))).toEqual('black');
        expect(flatGrid.get(v(2, 0))).toEqual('black');
        expect(flatGrid.get(v(0, 1))).toEqual('white');
        expect(flatGrid.get(v(1, 1))).toEqual('white');
        expect(flatGrid.get(v(2, 1))).toBeNull();
        expect(flatGrid.get(v(0, 2))).toEqual('black');
        expect(flatGrid.get(v(1, 2))).toEqual('black');
        expect(flatGrid.get(v(2, 2))).toEqual('black');
    });

    it('de-duplicates erased pixels', async () => {
        await history.handleNow(addShapeCommand({ shape: rect({ size: v(2, 3) }) }));

        tool.onStart(v(0, 0), history.canvas.topLayer());
        tool.onMove(v(3, 0));
        tool.onMove(v(0, 0));
        const [cmd] = tool.onFinish();

        // not a very black block test, uses knowledge of the types of commands produced, since the number of pixels in
        // the eraser is not visible anywhere after the commands are applied, but is important in terms of not wasting
        // file space.
        const addCmd = (cmd as AtomicCommand).commands.find(cmd => cmd.target === 'canvas', 'addShape') as AddShapeCommand;
        expect(addCmd).not.toBeFalsy();
        expect(addCmd.shape.pixels).toHaveLength(4);
    });
});