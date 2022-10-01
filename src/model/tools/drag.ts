import {CursorMode, Tool} from "../tool";
import {v, Vector2} from "../space";
import {Layer, moveLayerCommand, moveShapeCommand, positionedShape, PositionedShape, VirtualShapes} from "../canvas";
import {Command} from "../history";
import {Freeform} from "../shapes/freeform";
import {RegistrationHandle, Shortcuts, shortcutsSingleton} from "../input";
import {keys} from '../../config/editor';

type DragTarget = 'layer' | 'shape';
type DragVariant = {
    name: string
    target: DragTarget
}

export class Drag implements Tool<DragVariant> {
    readonly name = 'Drag';
    readonly icon = 'move';
    readonly variants: DragVariant[] = [
        { name: 'Layer', target: 'layer' },
        { name: 'Shape', target: 'shape' },
    ];

    variant = this.variants[0];
    readonly selectionShortcuts = keys.dragTool.keystrokes;

    private shortcuts: Shortcuts;
    private start: Vector2 | null = null; // origin of the cursor when drag started
    private _dragVector: Vector2 = v(0, 0);
    private startOrigin: Vector2 | null = null; // origin of the dragged item when drag started
    private snapToAxis = false;
    private dragged: (PositionedShape & { layer: string, index?: number }) | null = null;
    private shapesWereHidden: boolean[] = [];

    constructor({shortcuts = shortcutsSingleton} : {shortcuts?: Shortcuts} = {}) {
        this.shortcuts = shortcuts;
    }

    get vector(): Vector2 {
        return v(
            this.snapToAxis
                ? Math.abs(this._dragVector.x) > Math.abs(this._dragVector.y)
                    ? this._dragVector.x
                    : 0
                : this._dragVector.x,
            this.snapToAxis
                ? Math.abs(this._dragVector.y) > Math.abs(this._dragVector.x)
                    ? this._dragVector.y
                    : 0
                : this._dragVector.y,
        );
    }

    get cursorMode(): CursorMode {
        return {
            icon: 'move',
            highlight: this.dragged === null
                ? this.variant.target
                : (() => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const [from, to] = this.dragged!.shape.bounds.map(b => b.add(this.dragged!.origin));
                    return [from, to]
                })(),
        }
    }

    get virtualShapes(): VirtualShapes {
        if (this.dragged === null) {
            return [];
        }
        let index = this.dragged.index ?? 0;
        if (this.dragged.mask) {
            // stop the mask from masking itself!
            index += 1;
        }
        return [{
            layer: this.dragged.layer,
            shapes: { [index]: [this.dragged] },
        }];
    }

    onFinish(pos: Vector2, activeLayer: Layer): Command[] {
        if (this.start === null || !activeLayer || activeLayer.shapes.length === 0) {
            return [];
        }

        const offset = this.vector;
        const cmd: Command[] = [];
        if (this.dragged !== null) {
            if (this.dragged.index === undefined) {
                cmd.push(moveLayerCommand({
                    name: activeLayer.name,
                    offset,
                }));
            } else {
                cmd.push(moveShapeCommand({
                    layerName: activeLayer.name,
                    index: this.dragged.index,
                    offset,
                }));
            }
        }

        // restore original hidden state of each shape (regardless of which we hid)
        for (let i = 0; i < this.shapesWereHidden.length; i++){
            const shapeWasHidden = this.shapesWereHidden[i];
            if (!shapeWasHidden) activeLayer.showShape(i);
        }

        this.dragged = null;
        this.start = null;
        this.startOrigin = null;
        this._dragVector = v(0, 0);
        this.snapToAxis = false;

        return cmd;
    }

    private shiftUp: RegistrationHandle | null = null;
    private shiftDown: RegistrationHandle | null = null;
    set active(active: boolean) {
        if (active) {
            this.shiftUp = this.shortcuts.register(keys.toolModify1.keystrokes, () => {
                this.snapToAxis = false;
                return [];
            }, 'keyup');
            this.shiftDown = this.shortcuts.register(keys.toolModify1.keystrokes, () => {
                this.snapToAxis = true;
                return [];
            });
        } else {
            this.shiftUp?.cancel();
            this.shiftUp = null;
            this.shiftDown?.cancel();
            this.shiftDown = null;
        }
    }

    onMove(pos: Vector2, activeLayer: Layer | null): void {
        if (this.start === null || !activeLayer || activeLayer.shapes.length === 0) {
            return;
        }

        if (this.dragged === null) {
            if (this.variant.target === 'layer') {
                const {grid, offset} = activeLayer.flatGrid();
                this.dragged = {
                    layer: activeLayer.name,
                    ...positionedShape({
                        origin: v(0, 0),
                        shape: new Freeform({
                            pixels: grid.cells
                                .filter(c => c.value !== null)
                                .map(({pos, value}) => ({
                                    pos: pos.add(offset),
                                    color: value! // eslint-disable-line @typescript-eslint/no-non-null-assertion
                                })),
                        }),
                    }),
                };
                this.shapesWereHidden = activeLayer.shapes.map(s => s.hidden);
                activeLayer.shapes.forEach((_, i) => activeLayer.hideShape(i));
            } else {
                const topShape = activeLayer.topShapeAt(pos.sub(activeLayer.origin)) || null;
                if (topShape === null) {
                    return;
                }
                this.dragged = {
                    ...topShape.shape,
                    index: topShape.index,
                    layer: activeLayer.name,
                }
                this.shapesWereHidden = activeLayer.shapes.map(s => s.hidden);
                // was just assigned, flow typing not working here
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                activeLayer.hideShape(this.dragged.index!);
            }
        }

        const prevDrag = this._dragVector.copy();
        this._dragVector = pos.sub(this.start);
        if (prevDrag.eq(this._dragVector)) {
            // no movement.
            return;
        }
        this.startOrigin ||= this.dragged.origin;
        this.dragged.origin = this.vector.add(this.startOrigin);
    }

    onStart(pos: Vector2, activeLayer: Layer | null): void {
        if (!activeLayer || activeLayer.shapes.length === 0) {
            return;
        }
        this.start = pos;
        this.onMove(pos, activeLayer);
    }
}
