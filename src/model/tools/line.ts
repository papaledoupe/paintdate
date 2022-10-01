import {ConfigItem, CursorMode, strokeConfigItem, Tool, Variant, widthConfigItem} from "../tool";
import {solidStroke, Stroke} from "../stroke";
import {v, Vector2} from "../space";
import {line} from "../shapes/line";
import {addShapeCommand, Layer, positionedShape, PositionedShape, VirtualShapes} from "../canvas";
import {Command} from "../history";
import {RegistrationHandle, Shortcuts, shortcutsSingleton} from "../input";
import {keys} from '../../config/editor';

class LineVariant implements Variant {
    readonly name = 'Line';
    width = 1;
    stroke: Stroke = solidStroke('black');

    readonly configs: ConfigItem[] = [
        strokeConfigItem({
            read: () => this.stroke,
            write: stroke => { this.stroke = stroke },
        }),
        widthConfigItem({
            read: () => this.width,
            write: width => { this.width = width },
        }),
    ]
}

export class Line implements Tool<LineVariant> {
    readonly name = 'Line';
    readonly icon = 'pencil';
    readonly variants: LineVariant[] = [
        new LineVariant()
    ];
    variant = this.variants[0];
    readonly selectionShortcuts = keys.lineTool.keystrokes;

    private from: Vector2 | null = null;
    private to: Vector2 | null = null;
    private layer: Layer | null = null;

    private readonly shortcuts: Shortcuts;
    private snapAngle = false;
    private static snapAngles = [
        v(0, 1),  // 0 deg
        v(1, 2),  // 30 deg (ish)
        v(1, 1),  // 45 deg
        v(2, 1),  // 60 deg (ish)
        v(1, 0),  // 90 deg
        v(2, -1), // 120 deg (ish)
        v(1, -1), // 135 deg
        v(1, -2), // 150 deg (ish)
    ];

    constructor({shortcuts = shortcutsSingleton} : {shortcuts?: Shortcuts} = {}) {
        this.shortcuts = shortcuts;
    }

    get cursorMode(): CursorMode {
        return {
            highlight: 'pixel',
            icon: 'pencil',
            iconColor: this.variant.stroke.pixelColor(Vector2.zero, 0) || undefined,
        };
    }

    get currentShape(): PositionedShape | null {
        if (this.from === null || this.to === null) {
            return null;
        }

        let vector = this.to.sub(this.from);
        if (this.snapAngle) {
            vector = vector.snapTo(Line.snapAngles);
        }

        return positionedShape({
            shape: line({vector, stroke: this.variant.stroke}),
            origin: this.from.sub(this.layer?.origin ?? v(0, 0)),
        });
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
            cmd.push(addShapeCommand({
                ...this.currentShape,
                layerName: this.layer?.name,
            }));
        }
        this.from = null;
        this.to = null;
        this.layer = null;
        this.snapAngle = false;
        return cmd;
    }

    private shiftUp: RegistrationHandle | null = null;
    private shiftDown: RegistrationHandle | null = null;
    set active(active: boolean) {
        if (active) {
            this.shiftUp = this.shortcuts.register(keys.toolModify1.keystrokes, () => {
                this.snapAngle = false;
                return [];
            }, 'keyup');
            this.shiftDown = this.shortcuts.register(keys.toolModify1.keystrokes, () => {
                this.snapAngle = true;
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
