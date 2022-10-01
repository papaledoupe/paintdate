import {Bounds, v, Vector2} from "../space";
import {Fill} from "../fill";
import {Stroke, strokeFromFill} from "../stroke";
import {BlendMode, Pixel} from "../pixel";
import {Shape, ShapeOptions} from "../shape";
import {basicMerge} from "./freeform";
import {jsonOmit, jsonRead} from "../../util/json";

export type LineOptions = ShapeOptions & {
    vector: Vector2
    stroke: Stroke
}

export function line(options: LineOptions): Shape {
    return new Line(options);
}

@jsonRead(data => new Line(data))
export class Line implements Shape {
    @jsonOmit
    readonly type = 'Line'
    readonly mode: BlendMode
    vector: Vector2
    stroke: Stroke

    constructor({vector, stroke, mode}: LineOptions) {
        this.vector = vector;
        this.stroke = stroke;
        this.mode = mode ?? 'normal';
    }

    filled(origin: Vector2, fill: Fill): Shape | null {
        if (!this.pixels.find(({pos}) => pos.eq(origin))) {
            // not on the line.
            return null;
        }
        return new Line({
            vector: this.vector,
            stroke: strokeFromFill(fill),
        })
    }

    get bounds(): Bounds {
        // definitely a faster way to do this, but as this.vector can have negative components, this is simplest
        if (this.pixels.length === 0) {
            return [v(0, 0), v(0, 0)];
        }
        let minX = this.pixels[0].pos.x, minY = this.pixels[0].pos.y;
        let maxX = this.pixels[0].pos.x, maxY = this.pixels[0].pos.y;
        this.pixels.forEach(({pos}) => {
            if (pos.x < minX) minX = pos.x;
            if (pos.y < minY) minY = pos.y;
            if (pos.x > maxX) maxX = pos.x;
            if (pos.y > maxY) maxY = pos.y;
        });
        return [v(minX, minY), v(maxX, maxY)];
    }

    get pixels(): Pixel[] {
        return v(0, 0).rasterLine(this.vector)
            .map((pos, i) => {
                const color = this.stroke.pixelColor(pos, i);
                if (color === null) {
                    return null;
                }
                return { color, pos };
            })
            .filter(px => px !== null) as Pixel[];
    }

    merge(other: Shape): Shape {
        return basicMerge(this, other);
    }

    copy(options: Partial<LineOptions>): Shape {
        return new Line({
            vector: this.vector,
            stroke: this.stroke,
            mode: this.mode,
            ...options,
        })
    }
}

export function isLine(shape: Shape): shape is Line {
    return shape.type === 'Line';
}
