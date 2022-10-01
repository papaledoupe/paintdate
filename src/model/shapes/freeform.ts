import {blend, BlendMode, Color, Pixel} from "../pixel";
import {Bounds, inBounds, shrinkBounds, v, Vector2} from "../space";
import {Shape, ShapeOptions, toGrid} from "../shape";
import {jsonOmit, jsonRead} from "../../util/json";
import {Fill} from "../fill";
import {ComputedValueSet} from "../../util/set";

export type FreeformOptions = ShapeOptions & (
    {pixels: Pixel[]}
    | {points: Vector2[], color: Color}
)

const fillSpreadDirections: Vector2[] = [
    v(1, 0),
    v(0, 1),
    v(-1, 0),
    v(0, -1),
];

@jsonRead(({pixels, mode}) => new Freeform({pixels, mode}))
export class Freeform implements Shape<FreeformOptions> {
    @jsonOmit
    readonly type = 'Freeform'
    readonly mode: BlendMode
    pixels: Pixel[]

    constructor(options: FreeformOptions) {
        if ("pixels" in options) {
            this.pixels = options.pixels;
        } else {
            this.pixels = options.points.map(pos => ({pos, color: options.color}));
        }
        this.mode = options.mode ?? 'normal';
    }

    static from(shape: Shape): Freeform {
        return new Freeform({ pixels: shape.pixels, mode: shape.mode });
    }

    filled(origin: Vector2, fill: Fill): Shape | null {
        const bounds = this.bounds;
        const nonEdgeBounds = shrinkBounds(bounds);
        const grid = toGrid(this);
        const colorToFill = grid.get(origin);

        // points which will be filled.
        const points = new ComputedValueSet<Vector2>({keyFunc: v => v.toString()});
        // points which are to be considered for filling on next iteration.
        const nextPoints = new ComputedValueSet<Vector2>({keyFunc: v => v.toString()});
        // points which have already been considered for filling
        const consideredPoints = new ComputedValueSet<Vector2>({keyFunc: v => v.toString()});

        nextPoints.add(origin);
        for (let i = 0; i < 10_000; i++) {
            const currentPoints = nextPoints.values();
            nextPoints.clear();

            if (currentPoints.length === 0) {
                break; // no more ways to expand the fill.
            }

            for (const currentPoint of currentPoints) {
                consideredPoints.add(currentPoint);

                // consider whether to fill this point
                if (grid.get(currentPoint) !== colorToFill) {
                    continue; // stop exploring this direction.
                }
                points.add(currentPoint);
                // consider the area around this point for next iteration
                for (const spreadDirection of fillSpreadDirections) {
                    const newPoint = currentPoint.add(spreadDirection);
                    if (inBounds(bounds, newPoint) && !consideredPoints.has(newPoint)) {
                        nextPoints.add(newPoint);
                    }
                    if (!inBounds(nonEdgeBounds, newPoint) && grid.get(newPoint) === null) {
                        // reached the edge of the fillable space and there's no barrier - unenclosed space, cannot fill
                        return null;
                    }
                }
            }
        }
        if (points.size === 0) {
            return null;
        }

        const fillShape = new Freeform({
            pixels: points.values()
                .map<Pixel | null>(pos => {
                    const color = fill.pixelColor(pos);
                    if (color === null) {
                        return null;
                    }
                    return {pos, color};
                })
                .filter(p => p !== null)
                .map<Pixel>(p => p!) // eslint-disable-line @typescript-eslint/no-non-null-assertion
        });
        return basicMerge(this, fillShape);
    }

    get bounds(): Bounds {
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

    merge(other: Shape): Shape {
        return basicMerge(this, other);
    }

    copy(options: Partial<FreeformOptions>): Shape {
        return new Freeform({ pixels: this.pixels, mode: this.mode, ...options });
    }
}

export function basicMerge(a: Shape, b: Shape, offset: Vector2 = v(0, 0)): Freeform {
    const pixels = new ComputedValueSet<Pixel>({
        keyFunc: px => px.pos.toString(),
        valueFunc: (value, prev) => {
            const color = blend(b.mode, prev?.color ?? null, value.color);
            if (color === null) {
                return null;
            }
            return {pos: value.pos, color};
        },
    });
    [
        ...a.pixels,
        ...b.pixels.map(({pos, color}) => ({pos: pos.add(offset), color})),
    ].forEach(p => pixels.add(p))
    return new Freeform({ pixels: pixels.values() });
}

export function mask(shape: Shape, mask: Shape, maskOffset: Vector2 = v(0, 0)): Freeform {
    const pixels = new ComputedValueSet<Pixel>({keyFunc: px => px.pos.toString()});
    shape.pixels.forEach(p => pixels.add(p));
    mask.pixels
        .map(({pos, color}) => ({pos: pos.add(maskOffset), color}))
        .forEach(p => pixels.delete(p));
    return new Freeform({
        mode: shape.mode,
        pixels: pixels.values(),
    });
}

export function copyArea(shape: Shape, bounds: Bounds): Freeform {
    return cutArea(shape, bounds).target;
}

export function deleteArea(shape: Shape, bounds: Bounds): Freeform {
    return cutArea(shape, bounds).source;
}

export function cutArea(shape: Shape, bounds: Bounds): {source: Freeform, target: Freeform} {
    const sourcePixels: Pixel[] = [];
    const targetPixels: Pixel[] = [];
    shape.pixels.forEach(px => {
        if (inBounds(bounds, px.pos)) {
            targetPixels.push(px);
        } else {
            sourcePixels.push(px);
        }
    });
    return {
        source: new Freeform({
            mode: shape.mode,
            pixels: sourcePixels,
        }),
        target: new Freeform({
            mode: shape.mode,
            pixels: targetPixels,
        }),
    }
}

export function isFreeform(shape: Shape): shape is Freeform {
    return shape.type === 'Freeform';
}
