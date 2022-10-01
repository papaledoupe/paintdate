import {Bounds, Grid, inBounds, v, Vector2} from "../space";
import {Fill} from "../fill";
import {Stroke, strokeFromFill} from "../stroke";
import {BlendMode, Color, Pixel} from "../pixel";
import {Shape, ShapeOptions} from "../shape";
import {basicMerge} from "./freeform";
import {jsonOmit, jsonRead} from "../../util/json";

export type RectOptions = ShapeOptions & {
    size: Vector2
    fill?: Fill | null
    fillOrigin?: Vector2 // pattern fills are patterned from this origin, default (0, 0)
    stroke?: Stroke | null
}

export function rect(options: RectOptions): Shape {
    return new Rect(options);
}

@jsonRead(data => new Rect(data))
export class Rect implements Shape<RectOptions> {
    @jsonOmit
    readonly type = 'Rect'
    readonly mode: BlendMode
    size: Vector2
    fill: Fill | null
    // note - when adding stroke width, need to consider filled() function
    stroke: Stroke | null
    fillOrigin: Vector2

    constructor({size, fill, stroke, fillOrigin, mode}: RectOptions) {
        this.size = size;
        this.fill = fill ?? null;
        this.stroke = stroke ?? null;
        this.fillOrigin = fillOrigin ?? v(0, 0);
        this.mode = mode ?? 'normal';
    }

    filled(origin: Vector2, fill: Fill): Shape | null {
        // TODO determine if filling the stroke, and change that instead if so.
        // will need to consider stroke width
        const [from, to] = this.bounds;
        if (!inBounds([from, to], origin)) {
            return null;
        }

        let newStroke = this.stroke;
        let newFill = this.fill;

        if (origin.x === from.x || origin.x === to.x
            || origin.y === from.y || origin.y === to.y) {
            newStroke = strokeFromFill(fill);
        } else {
            newFill = fill;
        }
        return new Rect({
            size: this.size,
            fill: newFill || undefined,
            stroke: newStroke || undefined,
            fillOrigin: this.fillOrigin,
        })
    }

    get bounds(): Bounds {
        return [v(0, 0), this.size.sub(v(1, 1))]
    }

    get pixels(): Pixel[] {
        const grid = new Grid<Color>({ size: this.size });

        // add fill
        if (this.fill !== null) {
            const fill = this.fill;
            grid.cells.forEach(({pos}) => grid.put(pos, fill.pixelColor(pos.sub(this.fillOrigin))));
        }

        // add stroke
        if (this.stroke !== null) {
            const stroke = this.stroke;
            // needs a defined order for linear pattern stroke:
            // S--->
            // ^   |
            // |   |
            // <---v
            let _linePos = -1;
            const strokeColor = (pos: Vector2): Color | null => {
                _linePos += 1;
                return stroke.pixelColor(pos, _linePos);
            };
            grid.row(0).forEach(({pos}) => grid.put(pos, strokeColor(pos)));
            grid.column(grid.width - 1).forEach(({pos}, i) => {
                if (i !== 0) grid.put(pos, strokeColor(pos))
            });
            grid.row(grid.height - 1).reverse().forEach(({pos}, i) => {
                if (i !== 0) grid.put(pos, strokeColor(pos))
            });
            grid.column(0).reverse().forEach(({pos}, i) => {
                if (i !== 0 && i !== grid.height - 1) grid.put(pos, strokeColor(pos))
            });
        }

        return grid.cells
            .filter(({value}) => value !== null)
            .map(({pos, value}) => ({
                pos,
                color: value!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            }));
    }

    merge(other: Shape): Shape {
        return basicMerge(this, other);
    }

    copy(options: Partial<RectOptions>): Shape {
        return new Rect({
           size: this.size,
           fill: this.fill || undefined,
           stroke: this.stroke || undefined,
           fillOrigin: this.fillOrigin,
           mode: this.mode,
           ...options,
        });
    }
}

export function isRect(shape: Shape): shape is Rect {
    return shape.type === 'Rect';
}
