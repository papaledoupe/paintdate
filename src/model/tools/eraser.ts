import {Pixel} from "../pixel";
import {Vector2} from "../space";
import {CursorMode, Tool, Variant} from "../tool";
import {Freeform} from "../shapes/freeform";
import {
    addShapeCommand,
    Layer,
    mergeShapeDownCommand,
    positionedShape,
    PositionedShape,
    VirtualShapes
} from "../canvas";
import {atomic, Command} from "../history";
import {keys} from '../../config/editor';
import {ComputedValueSet} from "../../util/set";

export class Eraser implements Tool {
    readonly name = 'Eraser';
    readonly icon = 'x-square';
    readonly variants: Variant[] = [{name: 'Eraser'}];

    variant = this.variants[0];
    currentShape: PositionedShape | null = null;
    readonly selectionShortcuts = keys.eraserTool.keystrokes;

    private currentPixels: ComputedValueSet<Pixel> | null = null; // enforces uniqueness of pixels in single erasing action
    private prevPos: Vector2 | null = null;
    private layer: Layer | null = null;

    get cursorMode(): CursorMode {
        return {
            highlight: 'pixel',
            icon: 'x-square',
            iconColor: 'black',
        };
    }

    get virtualShapes(): VirtualShapes {
        if (this.currentShape === null) {
            return []
        }
        return [{
            layer: this.layer?.name,
            shapes: {0: [this.currentShape]},
        }];
    }

    onStart(pos: Vector2, activeLayer: Layer | null) {
        this.layer = activeLayer;
        this.currentShape = positionedShape({
            origin: pos.sub(activeLayer?.origin ?? Vector2.zero),
            shape: new Freeform({
                pixels: [],
            }),
        });
        this.currentPixels = new ComputedValueSet<Pixel>({
            keyFunc(px: Pixel) {
                return px.pos.toString();
            },
        });
        this.onMove(pos);
    }

    onMove(pos: Vector2) {
        const {currentShape, currentPixels} = this;
        if (currentShape === null || currentPixels === null) {
            // only track position, don't draw anything.
            this.prevPos = pos;
            return;
        }

        const addPixel = (pos: Vector2) => currentPixels.add({
            color: 'black',
            pos: pos.sub(currentShape.origin).sub(this.layer?.origin ?? Vector2.zero)
        });

        if (this.prevPos !== null) {
            this.prevPos.rasterLine(pos).forEach(pos => addPixel(pos));
        } else {
            addPixel(pos);
        }

        this.currentShape = positionedShape({
            origin: currentShape.origin,
            shape: new Freeform({
                pixels: currentPixels.values(),
            }),
            mask: true,
        })
        this.prevPos = pos;
    }

    onFinish(): Command[] {
        const cmd: Command[] = []
        if (this.currentShape !== null && this.layer !== null) {
            cmd.push(atomic([
                addShapeCommand({
                    layerName: this.layer.name,
                    ...this.currentShape,
                    beforeIndex: 0,
                    mask: true,
                }),
                mergeShapeDownCommand({
                    layerName: this.layer.name,
                    index: 0,
                })
            ]));
        }
        this.currentShape = null;
        this.prevPos = null;
        this.layer = null;
        return cmd;
    }

    set active(active: boolean) {
        // nothing to clear
    }
}
