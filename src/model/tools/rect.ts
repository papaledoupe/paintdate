import {
    blendModeConfigItem,
    ConfigItem,
    CursorMode,
    maskConfigItem,
    optionalFillConfigItem,
    optionalStrokeConfigItem,
    Tool,
    Variant
} from "../tool";
import {Fill, solidFill} from "../fill";
import {Stroke} from "../stroke";
import {v, Vector2} from "../space";
import {rect} from "../shapes/rect";
import {Command} from "../history";
import {addShapeCommand, Layer, positionedShape, PositionedShape, VirtualShapes} from "../canvas";
import {BlendMode} from "../pixel";
import {RegistrationHandle, Shortcuts, shortcutsSingleton} from "../input";
import {keys} from '../../config/editor';

class RectVariant implements Variant {
    readonly name = 'Rectangle'

    mode: BlendMode = 'normal'
    mask = false
    fill: Fill | null = solidFill('black')
    stroke: Stroke | null = null

    readonly configs: ConfigItem[] = [
        blendModeConfigItem({
            read: () => this.mode,
            write: mode => { this.mode = mode },
        }),
        maskConfigItem({
            read: () => this.mask,
            write: mask => { this.mask = mask },
        }),
        optionalFillConfigItem({
            read: () => this.fill,
            write: fill => { this.fill = fill },
        }),
        optionalStrokeConfigItem({
            read: () => this.stroke,
            write: stroke => { this.stroke = stroke },
        }),
    ]
}

export class Rect implements Tool<RectVariant> {
    readonly name = 'Rect';
    readonly icon = 'square';
    readonly variants: RectVariant[] = [
        new RectVariant()
    ];
    variant = this.variants[0];
    readonly selectionShortcuts = keys.rectTool.keystrokes;


    private lockAspectRatio = false;
    private from: Vector2 | null = null;
    private to: Vector2 | null = null;
    private layer: Layer | null = null;
    private shortcuts: Shortcuts;

    constructor({shortcuts = shortcutsSingleton} : {shortcuts?: Shortcuts} = {}) {
        this.shortcuts = shortcuts;
    }

    get cursorMode(): CursorMode {
        return {
            highlight: 'pixel',
            icon: 'square',
            iconColor: this.variant.stroke?.pixelColor(Vector2.zero, 0) || undefined,
        };
    }

    get virtualShapes(): VirtualShapes {
        const shape = this.currentShape;
        if (shape === null) {
            return [];
        }
        return [{
            layer: this.layer?.name,
            shapes: {0: [shape]},
        }];
    }

    get currentShape(): PositionedShape | null {
        if (this.from === null || this.to === null) {
            return null;
        }

        let origin = this.from;
        const vector = this.to.sub(this.from);
        let size = vector.copy();

        if (this.lockAspectRatio) {
            const largestComponent = Math.max(Math.abs(vector.x), Math.abs(vector.y));
            size = v(
                vector.x > 0 ? largestComponent : -1*largestComponent,
                vector.y > 0 ? largestComponent : -1*largestComponent,
            )
        }

        // relative to layer origin
        origin = origin.sub(this.layer?.origin ?? v(0, 0));

        // size can't be negative so transform the coordinates so top-left is the origin
        if (size.x < 0) {
            origin = origin.add(v(size.x, 0));
            size = v(Math.abs(size.x), size.y);
        }
        if (size.y < 0) {
            origin = origin.add(v(0, size.y));
            size = v(size.x, Math.abs(size.y));
        }

        // add 1 so that size is inclusive of start and end (makes more sense on the UI)
        size = size.add(v(1, 1));

        const {fill, stroke, mode = 'normal'} = this.variant;
        return positionedShape({
            origin,
            shape: rect({ size, fill, fillOrigin: origin, stroke, mode }),
            mask: this.variant.mask ?? false,
        });
    }

    onStart(pos: Vector2, activeLayer: Layer | null) {
        this.from = pos;
        this.layer = activeLayer;
    }

    onMove(pos: Vector2) {
        this.to = pos;
    }

    onFinish(): Command[] {
        const cmd: Command[] = []
        if (this.currentShape !== null) {
            cmd.push(addShapeCommand({ ...this.currentShape, layerName: this.layer?.name }));
        }
        this.from = null;
        this.to = null;
        this.layer = null;
        return cmd;
    }

    private shiftUp: RegistrationHandle | null = null;
    private shiftDown: RegistrationHandle | null = null;
    set active(active: boolean) {
        if (active) {
            this.shiftUp = this.shortcuts.register(keys.toolModify1.keystrokes, () => {
                this.lockAspectRatio = false;
                return [];
            }, 'keyup');
            this.shiftDown = this.shortcuts.register(keys.toolModify1.keystrokes, () => {
                this.lockAspectRatio = true;
                return [];
            });
        } else {
            this.shiftUp?.cancel();
            this.shiftUp = null;
            this.shiftDown?.cancel();
            this.shiftDown = null;
        }
    }
}
