import {Bounds, boundsSize, Grid, Vector2} from "./space";
import {BlendMode, Color, Pixel} from "./pixel";
import {Fill} from "./fill";

export interface Shape<O extends ShapeOptions = ShapeOptions> {
    readonly type: string
    readonly mode: BlendMode
    // relative to this shape's origin
    get bounds(): Bounds
    // relative to this shape's to origin
    get pixels(): Pixel[]
    merge(other: Shape): Shape
    // origin relative to shape origin
    // return Shape which represents this shape with fill applied
    filled(origin: Vector2, fill: Fill): Shape | null
    copy(options: Partial<O>): Shape
}

export type ShapeOptions = { mode?: BlendMode }

export function toGrid(shape: Shape): Grid<Color> {
    const grid = new Grid<Color>({ size: boundsSize(shape.bounds), loop: true })
    shape.pixels.forEach(({pos, color}) => grid.put(pos, color));
    return grid;
}
