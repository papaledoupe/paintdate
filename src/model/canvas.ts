import {Shape} from "./shape";
import {Bounds, boundsSize, combineBounds, Grid, inBounds, v, Vector2} from "./space";
import {blend, Color} from "./pixel";
import {atomic, Command} from "./history";
import {cached} from "../util/cache";
import {basicMerge, Freeform, mask} from "./shapes/freeform";
import {assertIsNever} from "../util/types";

// note: this is persisted in SourceFileDataV0_1, need to consider compatibility of changes
export type CanvasSettings = {
    size: Vector2
    mergeFreeform: boolean
    loop: boolean
}

type CanvasCommandType = Command & { target: 'canvas' }

type CanvasCommandVars<T extends CanvasCommandType> = Omit<T, 'target' | 'type'>

export type ReorderDirection = 'up' | 'down';

export function isCanvasCommand(cmd: Command): cmd is CanvasCommand {
    return cmd.target === 'canvas';
}

// used to deliberately simulate an error for test purposes
export type ErrorCommand = CanvasCommandType & {
    type: 'error'
}

export type AddLayerCommand = CanvasCommandType & {
    type: 'addLayer'
    name?: string
}
export function addLayerCommand(cmd: CanvasCommandVars<AddLayerCommand>): AddLayerCommand {
    return { ...cmd, target: 'canvas', type: 'addLayer' }
}

export type AddShapeCommand = CanvasCommandType & {
    type: 'addShape'
    layerName?: string
    shape: Shape
    beforeIndex?: VerticalPosition
    origin?: Vector2
    mergeFreeform?: boolean
    mask?: boolean
}
export function addShapeCommand(cmd: CanvasCommandVars<AddShapeCommand>): AddShapeCommand {
    return { ...cmd, target: 'canvas', type: 'addShape' }
}

export type HideLayerCommand = CanvasCommandType & {
    type: 'hideLayer'
    name: string
}
export function hideLayerCommand(cmd: CanvasCommandVars<HideLayerCommand>): HideLayerCommand {
    return { ...cmd, target: 'canvas', type: 'hideLayer' }
}

export type ShowLayerCommand = CanvasCommandType & {
    type: 'showLayer'
    name: string
}
export function showLayerCommand(cmd: CanvasCommandVars<ShowLayerCommand>): ShowLayerCommand {
    return { ...cmd, target: 'canvas', type: 'showLayer' }
}

export type MergeLayerDownCommand = CanvasCommandType & {
    type: 'mergeLayerDown'
    name: string
}
export function mergeLayerDownCommand(cmd: CanvasCommandVars<MergeLayerDownCommand>): MergeLayerDownCommand {
    return { ...cmd, target: 'canvas', type: 'mergeLayerDown' }
}

export type MergeShapeDownCommand = CanvasCommandType & {
    type: 'mergeShapeDown'
    layerName: string
    index: number
}
export function mergeShapeDownCommand(cmd: CanvasCommandVars<MergeShapeDownCommand>): MergeShapeDownCommand {
    return { ...cmd, target: 'canvas', type: 'mergeShapeDown' }
}

export type FlattenLayerCommand = CanvasCommandType & {
    type: 'flattenLayer'
    name: string
}
export function flattenLayerCommand(cmd: CanvasCommandVars<FlattenLayerCommand>): FlattenLayerCommand {
    return { ...cmd, target: 'canvas', type: 'flattenLayer' }
}

export type DeleteLayerCommand = CanvasCommandType & {
    type: 'deleteLayer'
    name: string
}
export function deleteLayerCommand(cmd: CanvasCommandVars<DeleteLayerCommand>): DeleteLayerCommand {
    return { ...cmd, target: 'canvas', type: 'deleteLayer' }
}

export type DeleteShapeCommand = CanvasCommandType & {
    type: 'deleteShape'
    layerName: string
    index: VerticalPosition
}
export function deleteShapeCommand(cmd: CanvasCommandVars<DeleteShapeCommand>): DeleteShapeCommand {
    return { ...cmd, target: 'canvas', type: 'deleteShape' }
}

export type DuplicateShapeCommand = CanvasCommandType & {
    type: 'duplicateShape'
    layerName: string
    index: number
}
export function duplicateShapeCommand(cmd: CanvasCommandVars<DuplicateShapeCommand>): DuplicateShapeCommand {
    return { ...cmd, target: 'canvas', type: 'duplicateShape' }
}

export type DuplicateLayerCommand = CanvasCommandType & {
    type: 'duplicateLayer'
    name: string
}
export function duplicateLayerCommand(cmd: CanvasCommandVars<DuplicateLayerCommand>): DuplicateLayerCommand {
    return { ...cmd, target: 'canvas', type: 'duplicateLayer' }
}

export type ReorderLayerCommand = CanvasCommandType & {
    type: 'reorderLayer'
    name: string
    direction: ReorderDirection
}
export function reorderLayerCommand(cmd: CanvasCommandVars<ReorderLayerCommand>): ReorderLayerCommand {
    return { ...cmd, target: 'canvas', type: 'reorderLayer' }
}

export type ReorderShapeCommand = CanvasCommandType & {
    type: 'reorderShape'
    layerName: string
    index: number
    direction: ReorderDirection
}
export function reorderShapeCommand(cmd: CanvasCommandVars<ReorderShapeCommand>): ReorderShapeCommand {
    return { ...cmd, target: 'canvas', type: 'reorderShape' }
}

export type MoveLayerCommand = CanvasCommandType & {
    type: 'moveLayer'
    name: string
    offset: Vector2
}
export function moveLayerCommand(cmd: CanvasCommandVars<MoveLayerCommand>): MoveLayerCommand {
    return { ...cmd, target: 'canvas', type: 'moveLayer' }
}

export type MoveShapeCommand = CanvasCommandType & {
    type: 'moveShape'
    layerName: string
    index: number
    offset: Vector2
}
export function moveShapeCommand(cmd: CanvasCommandVars<MoveShapeCommand>): MoveShapeCommand {
    return { ...cmd, target: 'canvas', type: 'moveShape' }
}

export type RenameLayerCommand = CanvasCommandType & {
    type: 'renameLayer'
    layerName: string
    newName: string
}
export function renameLayerCommand(cmd: CanvasCommandVars<RenameLayerCommand>): RenameLayerCommand {
    return { ...cmd, target: 'canvas', type: 'renameLayer' }
}

export type ReplaceShapeOptions = {
    layerName: string
    index: number
    shape: PositionedShape
}
export function replaceShapeCommand({layerName, index, shape}: ReplaceShapeOptions): Command {
    return atomic([
        addShapeCommand({
            layerName,
            beforeIndex: index,
            ...shape,
            mergeFreeform: false,
        }),
        deleteShapeCommand({
            layerName,
            index: index + 1,
        }),
    ]);
}

export type ConfigureCommand = CanvasCommandType & {
    type: 'configure'
    settings: Partial<CanvasSettings>
}
export function configureCommand(settings: Partial<CanvasSettings>): ConfigureCommand {
    return { settings, type: 'configure', target: 'canvas' }
}

export type CanvasCommand =
    | ErrorCommand
    | AddShapeCommand
    | AddLayerCommand
    | DeleteLayerCommand
    | DeleteShapeCommand
    | HideLayerCommand
    | ShowLayerCommand
    | MergeLayerDownCommand
    | MergeShapeDownCommand
    | ReorderLayerCommand
    | ReorderShapeCommand
    | MoveLayerCommand
    | MoveShapeCommand
    | RenameLayerCommand
    | DuplicateLayerCommand
    | DuplicateShapeCommand
    | FlattenLayerCommand
    | ConfigureCommand
    ;

export class Canvas {
    private size: Vector2 = v(100, 100);
    private loop = false;
    private mergeFreeform = true;
    // label given to new layer with generated name
    private layerCounter = 0;
    // incremented on any change as a way to detect that anything might have changed
    private _version = 0;

    layers: Layer[] = [];

    get settings(): CanvasSettings {
        return {
            size: this.size,
            loop: this.loop,
            mergeFreeform: this.mergeFreeform,
        };
    }

    get version(): number {
        return this._version;
    }

    handle(command: CanvasCommand) {
        try {
            if (command.type === 'addLayer') {
                return this.addLayer({name: command.name});
            }
            if (command.type === 'addShape') {
                return this.addShape(positionedShape({
                    shape: command.shape,
                    origin: command.origin ?? v(0, 0),
                    mask: command.mask ?? false,
                }), command.layerName, command.mergeFreeform, command.beforeIndex);
            }
            if (command.type === 'hideLayer') {
                return this.hideLayer(command.name);
            }
            if (command.type === 'showLayer') {
                return this.showLayer(command.name);
            }
            if (command.type === 'mergeLayerDown') {
                return this.mergeDownLayer(command.name);
            }
            if (command.type === 'mergeShapeDown') {
                return this.mergeDownShape(command.layerName, command.index);
            }
            if (command.type === 'deleteShape') {
                return this.deleteShape(command.layerName, command.index);
            }
            if (command.type === 'deleteLayer') {
                return this.deleteLayer(command.name);
            }
            if (command.type === 'reorderLayer') {
                return this.reorderLayer(command.name, command.direction);
            }
            if (command.type === 'reorderShape') {
                return this.reorderShape(command.layerName, command.index, command.direction);
            }
            if (command.type === 'moveLayer') {
                return this.moveLayer(command.name, command.offset);
            }
            if (command.type === 'moveShape') {
                return this.moveShape(command.layerName, command.index, command.offset);
            }
            if (command.type === 'duplicateLayer') {
                return this.duplicateLayer(command.name);
            }
            if (command.type === 'duplicateShape') {
                return this.duplicateShape(command.layerName, command.index);
            }
            if (command.type === 'renameLayer') {
                return this.renameLayer(command.layerName, command.newName);
            }
            if (command.type === 'flattenLayer') {
                return this.flattenLayer(command.name);
            }
            if (command.type === 'error') {
                throw new Error('simulated command processing error');
            }
            if (command.type === 'configure') {
                return this.configure(command.settings);
            }
            assertIsNever(command);
        } finally {
            this._version++;
        }
    }

    topLayer(): Layer | null {
        return this.layers[0] || null;
    }

    bottomLayer(): Layer | null {
        return this.layers[this.layers.length - 1] || null;
    }

    namedLayer(name: string): Layer | null {
        const layer = this.layers.find(l => l.name === name);
        return layer === undefined ? null : layer;
    }

    layerIndex(name: string): number | null {
        const index = this.layers.findIndex(l => l.name === name);
        return index > -1 ? index : null;
    }

    private addLayer(options: Partial<LayerOptions>, {to = 'top'}: {to?: VerticalPosition} = {}): Layer {
        const name = options.name ?? `Layer ${this.layerCounter += 1}`;
        if (this.namedLayer(name) !== null) {
            throw new Error(`error already exists with name ${name}`)
        }
        const layer = new Layer({ ...options, name });
        if (to === 'top') {
            this.layers.unshift(layer);
        } else if (to === 'bottom') {
            this.layers.push(layer);
        } else {
            this.layers = [
                ...this.layers.slice(0, to),
                layer,
                ...this.layers.slice(to),
            ];
        }

        return layer;
    }

    private hideLayer(name: string) {
        const layer = this.namedLayer(name);
        if (layer !== null) {
            layer.hidden = true;
        }
    }

    private showLayer(name: string) {
        const layer = this.namedLayer(name);
        if (layer !== null) {
            layer.hidden = false;
        }
    }

    private addShape(shape: PositionedShape, layerName?: string, mergeFreeForm?: boolean, to?: VerticalPosition): void {
        let layer: Layer
        if (layerName === undefined) {
            layer = this.addLayer({});
        } else {
            layer = this.namedLayer(layerName) || this.addLayer({ name: layerName });
        }
        layer.addShape(shape, {to: to ?? 'top', mergeFreeForm: mergeFreeForm ?? this.mergeFreeform});
    }

    private mergeDownLayer(name: string): void {
        const layerIndex = this.layerIndex(name);
        if (layerIndex === null || layerIndex == this.layers.length - 1) {
            return;
        }
        const sourceLayer = this.layers[layerIndex];
        const targetLayer = this.layers[layerIndex + 1];
        sourceLayer.flatten();
        this.reorderShape(sourceLayer.name, 0, 'down');
        this.deleteLayer(sourceLayer.name);
        targetLayer.flatten();
        this.renameLayer(targetLayer.name, sourceLayer.name);
    }

    private flattenLayer(name: string): void {
        this.namedLayer(name)?.flatten();
    }

    private renameLayer(oldName: string, newName: string): void {
        if (this.namedLayer(newName) !== null) {
            throw new Error(`layer already exists with name ${newName}`);
        }
        const layer = this.namedLayer(oldName);
        if (layer !== null) {
            layer.name = newName;
        }
    }

    private mergeDownShape(layerName: string, shapeIndex: number): void {
        const layer = this.namedLayer(layerName);
        if (layer === null) {
            return;
        }
        layer.mergeDown(shapeIndex);
    }

    private reorderLayer(name: string, dir: ReorderDirection): void {
        const index = this.layers.findIndex(l => l.name === name);
        if (index < 0) {
            return;
        }
        if (dir === 'up' && index > 0) {
            this.layers = [
                ...this.layers.slice(0, index - 1),
                this.layers[index],
                this.layers[index - 1],
                ...this.layers.slice(index + 1),
            ];
        } else if (dir === 'down' && index < this.layers.length - 1) {
            this.layers = [
                ...this.layers.slice(0, index),
                this.layers[index + 1],
                this.layers[index],
                ...this.layers.slice(index + 2),
            ];
        }
    }

    private reorderShape(layerName: string, shapeIndex: number, direction: ReorderDirection): void {
        const layerIndex = this.layerIndex(layerName);
        if (layerIndex === null) {
            return;
        }
        const layer = this.layers[layerIndex];
        const lastShape = shapeIndex === layer.shapes.length - 1;
        const lastLayer = layerIndex === this.layers.length - 1;
        if (direction === 'up') {
            if (shapeIndex > 0) {
                // move up inside layer
                layer.reorderShape(shapeIndex, 'up');
            } else if (shapeIndex === 0 && layerIndex > 0) {
                // move up to upper layer
                const targetLayer = this.layers[layerIndex - 1];
                const removedShape = layer.removeShape({from: 'top'})!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                const layerOriginDiff = layer.origin.sub(targetLayer.origin);
                targetLayer.addShape({
                    ...removedShape,
                    origin: removedShape.origin.add(layerOriginDiff),
                }, {to: 'bottom'});
            } // else nowhere to go
        } else if (direction === 'down') {
            if (!lastShape) {
                // move down inside layer
                layer.reorderShape(shapeIndex, 'down');
            } else if (lastShape && !lastLayer) {
                // move down to lower layer
                const targetLayer = this.layers[layerIndex + 1];
                const removedShape = layer.removeShape({from: 'bottom'})!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                const layerOriginDiff = layer.origin.sub(targetLayer.origin);
                targetLayer.addShape({
                    ...removedShape,
                    origin: removedShape.origin.add(layerOriginDiff),
                }, {to: 'top'});
            } // else nowhere to go
        }
    }

    private moveLayer(name: string, offset: Vector2): void {
        const layer = this.namedLayer(name);
        if (layer === null) {
            return;
        }
        layer.origin = layer.origin.add(offset);
    }

    private moveShape(layerName: string, index: number, offset: Vector2): void {
        const layer = this.namedLayer(layerName);
        if (layer === null) {
            return;
        }
        layer.moveShape(index, offset);
    }

    private duplicateLayer(name: string): void {
        const layer = this.namedLayer(name);
        if (layer === null) {
            return;
        }
        this.addLayer({
            name: `Copy of ${name}`,
            hidden: layer.hidden,
            origin: layer.origin,
            shapes: layer.shapes.map(s => ({
                ...s,
                shape: s.shape.copy({}),
            }))
        }, {to: this.layerIndex(name) ?? 'top'});
    }

    private duplicateShape(layerName: string, index: number): void {
        const layer = this.namedLayer(layerName);
        if (layer === null) {
            return;
        }
        const shape = layer.shapes[index];
        if (shape === undefined) {
            return;
        }
        this.addShape(
            { ...shape, shape: shape.shape.copy({}) } ,
            layerName,
            false,
            index + 1,
        )
    }

    private deleteLayer(name: string): void {
        this.layers = this.layers.filter(l => l.name !== name);
    }

    private deleteShape(layerName: string, position: VerticalPosition): void {
        this.namedLayer(layerName)?.removeShape({from: position});
    }

    private configure(changes: Partial<CanvasSettings>): void {
        if (changes.size !== undefined) {
            this.size = changes.size;
        }
        if (changes.loop !== undefined) {
            this.loop = changes.loop;
        }
        if (changes.mergeFreeform !== undefined) {
            this.mergeFreeform = changes.mergeFreeform;
        }
    }

    flatGrid(virtualShapes: VirtualShapes = []): Grid<Color> {
        const grid = new Grid<Color>({size: this.size, loop: this.loop});

        let virtualLayerShapes: PositionedShape[] = [];
        const virtualsByLayer = virtualShapes.reduce((acc: {[layer: string]: {[beforeIndex: number]: PositionedShape[]}}, v) => {
            if (v.layer === undefined) {
                virtualLayerShapes = Object.values(v.shapes).flatMap(s => s);
            } else {
                acc[v.layer] = v.shapes;
            }
            return acc;
        }, {});
        const virtualLayers = [];
        if (virtualLayerShapes.length > 0) {
            virtualLayers.push(new Layer({
                name: '__virtual__',
                shapes: virtualLayerShapes,
            }));
        }

        [...virtualLayers, ...this.layers].reverse().filter(l => !l.hidden).forEach(layer => {
            const virtuals = virtualsByLayer[layer.name] || [];
            const {grid: layerGrid, offset: layerGridOffset} = layer.flatGrid(virtuals);
            layerGrid.cells.forEach(({pos, value}) => {
                if (value !== null) grid.put(pos.add(layerGridOffset).add(layer.origin), value);
            });
        });
        return grid;
    }
}

export type VirtualShapes = {
    layer?: string
    shapes: {[beforeIndex: number]: PositionedShape[]}
}[];

export type LayerOptions = {
    name: string
    hidden?: boolean
    shapes?: PositionedShape[]
    origin?: Vector2
}

export type VerticalPosition = 'top' | 'bottom' | number;

// A shape positioned on a 2d plane
export type PositionedShape = {
    shape: Shape
    origin: Vector2
    hidden: boolean
    mask: boolean
}

export function positionedShape(opts: Partial<PositionedShape> & {shape: Shape, origin: Vector2}): PositionedShape {
    return {...opts, hidden: opts.hidden ?? false, mask: opts.mask ?? false}
}

export class Layer {
    name: string
    hidden: boolean
    origin: Vector2
    shapes: PositionedShape[]

    constructor({name, hidden, origin, shapes}: LayerOptions) {
        this.name = name;
        this.hidden = typeof hidden === 'boolean' ? hidden : false;
        this.origin = origin || v(0, 0);
        this.shapes = shapes || [];
    }

    topShape(): PositionedShape | null {
        return this.shapes[0] || null;
    }

    hideShape(index: number) {
        const shape = this.shapes[index];
        if (shape) {
            shape.hidden = true;
        }
    }

    showShape(index: number) {
        const shape = this.shapes[index];
        if (shape) {
            shape.hidden = false;
        }
    }

    topShapeAt(pos: Vector2): {shape: PositionedShape, index: number} | null {
        if (!pos) {
            return this.shapes[0] ? { shape: this.shapes[0], index: 0 } : null;
        }

        for (let i = 0; i < this.shapes.length; i++){
            const {shape, origin: shapeOrigin} = this.shapes[i];
            const [from, to] = shape.bounds.map(b => b.add(shapeOrigin))
            if (inBounds([from, to], pos)) {
                return { shape: {...this.shapes[i], origin: shapeOrigin}, index: i };
            }
        }
        return null;
    }

    bottomShape(): PositionedShape | null {
        return this.shapes[this.shapes.length - 1] || null;
    }

    addShape(shape: PositionedShape, {to, mergeFreeForm = false}: {to: VerticalPosition, mergeFreeForm?: boolean}) {
        let beforeIndex: number;
        if (to === 'top') {
            beforeIndex = 0;
        } else if (to === 'bottom') {
            beforeIndex = this.shapes.length;
        } else {
            beforeIndex = to;
        }
        if (beforeIndex > this.shapes.length) {
            return;
        }

        this.shapes = [
            ...this.shapes.slice(0, beforeIndex),
            shape,
            ...this.shapes.slice(beforeIndex),
        ];
        if (mergeFreeForm
            && this.shapes[beforeIndex]?.shape instanceof Freeform
            && this.shapes[beforeIndex + 1]?.shape instanceof Freeform) {
            this.mergeDown(beforeIndex);
        }
    }

    removeShape({from}: {from: VerticalPosition}): PositionedShape | null {
        if (from === 'top') {
            return this.shapes.shift() || null;
        } else if (from === 'bottom') {
            return this.shapes.pop() || null;
        } else if (from >= 0 && from < this.shapes.length) {
            const shape = this.shapes[from]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
            this.shapes = [
                ...this.shapes.slice(0, from),
                ...this.shapes.slice(from + 1),
            ];
            return shape;
        }
        return null;
    }

    reorderShape(index: number, direction: ReorderDirection): boolean {
        if (direction === 'up') {
            if (index <= 0) return false;
            this.shapes = [
                ...this.shapes.slice(0, index - 1),
                this.shapes[index],
                this.shapes[index - 1],
                ...this.shapes.slice(index + 1),
            ];
            return true;
        } else if (direction === 'down') {
            if (index >= this.shapes.length - 1) return false;
            this.shapes = [
                ...this.shapes.slice(0, index),
                this.shapes[index + 1],
                this.shapes[index],
                ...this.shapes.slice(index + 2),
            ];
            return true;
        }
        return false;
    }

    flatten() {
        while (this.shapes.length > 1) {
            this.mergeDown(0);
        }
    }

    mergeDown(shapeIndex: number) {
        if (shapeIndex >= this.shapes.length - 1) {
            return;
        }
        const keepBefore = this.shapes.slice(0, shapeIndex);
        const mergeSource = this.shapes[shapeIndex];
        const mergeTarget = this.shapes[shapeIndex + 1];
        const keepAfter = this.shapes.slice(shapeIndex + 2);
        this.shapes = [
            ...keepBefore,
            {
                ...mergeTarget,
                shape: mergeSource.mask
                    ? mask(mergeTarget.shape, mergeSource.shape, mergeSource.origin.sub(mergeTarget.origin))
                    : basicMerge(mergeTarget.shape, mergeSource.shape, mergeSource.origin.sub(mergeTarget.origin)),
            },
            ...keepAfter
        ];
    }

    moveShape(shapeIndex: number, offset: Vector2) {
        if (shapeIndex > this.shapes.length - 1) {
            return;
        }
        this.shapes[shapeIndex].origin = this.shapes[shapeIndex].origin.add(offset);
    }

    private gridShapes: PositionedShape[] = [];
    private gridOffset = v(0, 0);
    private gridCache = cached<{ grid: Grid<Color>, offset: Vector2 }, { shapes: PositionedShape[], offset: Vector2 }>(
        () => ({
            shapes: this.gridShapes,
            offset: this.gridOffset,
        }),
        () => {
            const bounds = this.boundsOf(this.gridShapes);
            const gridSize = bounds === null ? v(0, 0) : boundsSize(bounds);
            const offset = bounds?.[0] ?? v(0, 0);

            const maskedShapes: PositionedShape[] = [];
            let prevMask: PositionedShape | null = null;
            for (let i = 0; i < this.gridShapes.length; i++) {
                let shape = this.gridShapes[i];
                if (shape.mask) {
                    prevMask = shape;
                    continue;
                }
                if (prevMask !== null) {
                    shape = {...shape}; // copy so as not to mutate real shape
                    shape.shape = mask(shape.shape, prevMask.shape, prevMask.origin.sub(shape.origin));
                    prevMask = null;
                }
                maskedShapes.push(shape);
            }

            const grid = new Grid<Color>({size: gridSize});
            maskedShapes
                .reverse()
                .filter(s => !s.hidden)
                .forEach(shape => {
                    shape.shape.pixels
                        .forEach(({pos, color}) => grid.put(
                            pos.sub(offset).add(shape.origin),
                            color,
                            (value, prev) => blend(shape.shape.mode, prev, value))
                        );
                });
            return { grid, offset };
        }
    );
    flatGrid(virtualShapes: {[beforeIndex: number]: PositionedShape[]} = {}): {grid: Grid<Color>, offset: Vector2} {
        this.gridShapes = [];
        const maxIndex = Math.max(this.shapes.length - 1, ...Object.keys(virtualShapes).map(i => parseInt(i, 10)));
        for (let i = 0; i < maxIndex + 1; i++) {
            (virtualShapes[i] || []).forEach(shape => this.gridShapes.push(shape));
            if (this.shapes[i]) this.gridShapes.push(this.shapes[i]);
        }
        this.gridOffset = this.bounds?.[0] || v(0, 0);
        return this.gridCache.get();
    }

    // relative to layer origin
    get bounds(): Bounds | null {
        return this.boundsOf(this.shapes);
    }

    private boundsOf(shapes: PositionedShape[]): Bounds | null {
        return shapes.reduce<Bounds | undefined>((bounds, {shape, origin}) => {
            const [from, to] = shape.bounds;
            return combineBounds([
                from.add(origin),
                to.add(origin),
            ], bounds);
        }, undefined) || null;
    }
}