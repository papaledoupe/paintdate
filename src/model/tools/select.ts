import {CursorMode, Tool, Variant} from "../tool";
import {Bounds, boundsSize, v, Vector2} from "../space";
import {atomic, Command, copyCommand} from "../history";
import {
    addShapeCommand,
    deleteShapeCommand,
    Layer,
    PositionedShape,
    replaceShapeCommand,
    VirtualShapes
} from "../canvas";
import {RegistrationHandle, Shortcuts, shortcutsSingleton} from "../input";
import {copyArea, cutArea, deleteArea} from "../shapes/freeform";
import {keys} from '../../config/editor';


export class Select implements Tool {
    readonly name = 'Select';
    readonly icon = 'square';
    readonly variants: Variant[] = [{ name: 'Area' }];

    variant = this.variants[0];
    readonly virtualShapes: VirtualShapes = [];
    readonly selectionShortcuts = keys.selectTool.keystrokes;

    private selecting = false;
    private lockAspectRatio = false;
    // from and to are cursor position; bounds include layer origin and possible effect of lockAspectRatio
    private from: Vector2 | null = null;
    private to: Vector2 | null = null;
    private bounds: Bounds | null = null;
    private layer: Layer | null = null;
    private shortcuts: Shortcuts;
    
    constructor({shortcuts = shortcutsSingleton} : {shortcuts?: Shortcuts} = {}) {
        this.shortcuts = shortcuts;
    }
    
    get cursorMode(): CursorMode {
        return {
            highlight: this.bounds === null ? 'pixel' : this.bounds,
            icon: 'square',
            iconColor: 'black',
        };
    }

    onStart(pos: Vector2, activeLayer: Layer | null) {
        this.reset();
        this.selecting = true;
        this.to = pos;
        this.layer = activeLayer;
    }

    onMove(pos: Vector2) {
        if (!this.selecting) {
            return;
        }
        this.to = pos;
        if (this.from === null) {
            this.from = this.to;
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

        this.bounds = [origin, origin.add(size)];
    }

    private reset() {
        this.to = null;
        this.from = null;
        this.bounds = null;
        this.selecting = false;
    }

    onFinish(): Command[] {
        this.selecting = false;
        if (this.bounds && boundsSize(this.bounds).eq(v(0, 0))) {
            this.reset();
        }
        return [];
    }

    private shortcutRegistrations: RegistrationHandle[] = [];

    set active(active: boolean) {
        if (active) {
            this.shortcutRegistrations.push(this.shortcuts.register(
                keys.toolModify1.keystrokes,
                () => {
                    this.lockAspectRatio = true;
                    return [];
                }
            ));
            this.shortcutRegistrations.push(this.shortcuts.register(
                keys.toolModify1.keystrokes,
                () => {
                    this.lockAspectRatio = false;
                    return [];
                },
                'keyup'
            ));
            this.shortcutRegistrations.push(this.shortcuts.register(
                keys.copy.keystrokes,
                () => this.copy(),
            ));
            this.shortcutRegistrations.push(this.shortcuts.register(
                keys.cut.keystrokes,
                () => this.cut(),
            ));
            this.shortcutRegistrations.push(this.shortcuts.register(
                keys.delete.keystrokes,
                () => this.delete(),
            ));
        } else {
            this.reset();
            while (this.shortcutRegistrations.length > 0) {
                this.shortcutRegistrations.pop()?.cancel();
            }
        }
    }

    private operate(operation: (layer: Layer, shape: PositionedShape, bounds: Bounds) => Command[]): Command[] {
        if (this.layer === null || this.bounds === null) {
            return [];
        }
        const layer = this.layer;
        const shape = layer.topShape();
        if (shape === null) {
            return [];
        }
        const [from, to] = this.bounds.map(b => b.sub(shape.origin))
        const cmds = operation(layer, shape, [from, to]);
        this.reset();
        return cmds;
    }

    copy(): Command[] {
        return this.operate((layer, shape, bounds) => {
            const copied = copyArea(shape.shape, bounds);
            return [copyCommand({
                description: 'copied area',
                paste(): Command[] {
                    return [addShapeCommand({
                        shape: copied,
                        layerName: layer.name,
                        origin: shape.origin,
                        mergeFreeform: false,
                    })];
                },
            })];
        });
    }

    cut(): Command[] {
        return this.operate((layer, shape, bounds) => {
            const {source, target} = cutArea(shape.shape, bounds);
            // replace old shape with remainder, and add cut part to clipboard.
            return [
                replaceShapeCommand({
                    layerName: layer.name,
                    index: 0,
                    shape: {
                        ...shape,
                        shape: source,
                    }
                }),
                copyCommand({
                    description: 'cut area',
                    paste(): Command[] {
                        return [addShapeCommand({
                            shape: target,
                            layerName: layer.name,
                            origin: shape.origin,
                            mergeFreeform: false,
                        })];
                    },
                }),
            ];
        });
    }

    delete(): Command[] {
        return this.operate((layer, shape, bounds) => {
            return [
                // atomically delete existing shape and add back remaining part
                atomic([
                    deleteShapeCommand({
                        layerName: layer.name,
                        index: 0,
                    }),
                    addShapeCommand({
                        layerName: layer.name,
                        beforeIndex: 0,
                        shape: deleteArea(shape.shape, bounds),
                        origin: shape.origin,
                        mergeFreeform: false,
                    }),
                ]),
            ];
        });
    }
}
