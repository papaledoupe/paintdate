import {BlendMode, Color, Pixel} from "../pixel";
import {Grid, v, Vector2} from "../space";
import {
    blendModeConfigItem,
    colorConfigItem,
    ConfigItem,
    CursorMode,
    maskConfigItem,
    Tool,
    Variant,
    widthConfigItem
} from "../tool";
import {Freeform} from "../shapes/freeform";
import {addShapeCommand, Layer, positionedShape, PositionedShape, VirtualShapes} from "../canvas";
import {Command} from "../history";
import {keys} from '../../config/editor';
import {ComputedValueSet} from "../../util/set";

class PencilVariant implements Variant {
    readonly name: string = 'Pencil'

    mode: BlendMode = 'normal'
    color: Color = 'black'
    mask = false
    width = 1

    get pattern(): Grid<Color> {
        return Grid.repeated(this.color);
    }

    readonly configs: ConfigItem[] = [
        colorConfigItem({
            read: () => this.color,
            write: (color: Color) => { this.color = color },
        }),
        blendModeConfigItem({
            read: () => this.mode,
            write: (mode: BlendMode) => { this.mode = mode },
        }),
        maskConfigItem({
            read: () => this.mask,
            write: (mask: boolean) => { this.mask = mask },
        }),
        widthConfigItem({
            read: () => this.width,
            write: (width: number) => { this.width = width },
        })
    ]
}

export class Pencil implements Tool<PencilVariant> {
    readonly name = 'Pencil';
    readonly icon = 'pencil';
    readonly variants: PencilVariant[] = [
        new PencilVariant(),
    ];

    variant = this.variants[0];
    currentShape: PositionedShape | null = null;
    readonly selectionShortcuts = keys.pencilTool.keystrokes;

    private currentPixels: ComputedValueSet<Pixel> | null = null; // enforces uniqueness of pixels in single drawing action
    private prevPos: Vector2 | null = null;
    private layer: Layer | null = null;

    get cursorMode(): CursorMode {
        return {
            highlight: 'pixel',
            icon: 'pencil',
            iconColor: this.getColor(Vector2.zero) || undefined,
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
            origin: pos.sub(activeLayer?.origin ?? v(0, 0)),
            shape: new Freeform({
                pixels: [],
                mode: this.variant.mode,
            }),
            mask: this.variant.mask,
        });
        this.currentPixels = new ComputedValueSet<Pixel>({
            keyFunc(px: Pixel) {
                return px.pos.toString();
            },
        });
        this.onMove(pos);
    }

    private getColor(pos: Vector2): Color | null {
        return this.variant.pattern.get(pos.sub(this.currentShape?.origin ?? Vector2.zero));
    }

    onMove(pos: Vector2) {
        const {currentShape, currentPixels} = this;
        if (currentShape === null || currentPixels === null) {
            // only track position, don't draw anything.
            this.prevPos = pos;
            return;
        }

        const addPixel = (pos: Vector2) => {
            pos = pos.sub(currentShape.origin).sub(this.layer?.origin ?? v(0, 0));
            const color = this.getColor(pos);
            if (color != null) {
                currentPixels.add({color, pos});
            }
        }

        if (this.prevPos !== null) {
            this.prevPos.rasterLine(pos).forEach(pos => addPixel(pos));
        } else {
            addPixel(pos);
        }
        this.currentShape = positionedShape({
            origin: currentShape.origin,
            shape: new Freeform({
                mode: this.variant.mode,
                pixels: currentPixels.values(),
            }),
            mask: this.variant.mask,
        })
        this.prevPos = pos;
    }

    onFinish(): Command[] {
        const cmd: Command[] = []
        if (this.currentShape !== null) {
            cmd.push(addShapeCommand({
                layerName: this.layer?.name,
                ...this.currentShape,
            }));
        }
        this.currentShape = null;
        this.currentPixels = null;
        this.prevPos = null;
        this.layer = null;
        return cmd;
    }

    set active(active: boolean) {
        // nothing to clear
    }
}
