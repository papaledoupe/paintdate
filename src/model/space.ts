import {modulo} from "../util/math";
import {cached} from "../util/cache";
import {jsonOmit, jsonRead, jsonWrite} from "../util/json";

@jsonWrite((({x, y}: Vector2) => [x, y]))
@jsonRead(([x, y]) => v(x, y))
export class Vector2 {

    static readonly zero = new Vector2(0, 0);

    readonly x: number
    readonly y: number

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    sub(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    eq(v: Vector2): boolean {
        return this.x === v.x && this.y === v.y;
    }

    round(): Vector2 {
        return v(Math.round(this.x), Math.round(this.y));
    }

    toString(): string {
        return `(${this.x}, ${this.y})`;
    }

    // Bresenham raster line algorithm
    // Based on https://stackoverflow.com/a/4672319
    rasterLine(to: Vector2): Vector2[] {
        const from = this.round();
        to = to.round();

        const line: Vector2[] = [];

        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        const sx = (from.x < to.x) ? 1 : -1;
        const sy = (from.y < to.y) ? 1 : -1;

        let err = dx - dy;
        let fromX = from.x;
        let fromY = from.y;
        const escapeHatch = 10_000;
        for (let i = 0; i < escapeHatch; i++) {
            line.push(new Vector2(fromX, fromY));
            if ((fromX === to.x) && (fromY === to.y)) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; fromX += sx; }
            if (e2 < dx)  { err += dx; fromY += sy; }
        }

        return line;
    }

    magnitude(): number {
        return Math.sqrt(this.x**2 + this.y**2);
    }

    normalized(): Vector2 {
        const m = this.magnitude();
        return v(this.x / m, this.y / m)
    }

    dot(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }

    scale(s: number): Vector2 {
        return v(this.x * s, this.y * s);
    }

    apply(f: (n: number) => number): Vector2 {
        return v(f(this.x), f(this.y));
    }

    copy(): Vector2 {
        return v(this.x, this.y);
    }

    // Takes this vector to be a line (intersecting 0,0) and returns the perpendicular distance from this line to the
    // given point.
    // D = |p - (p.n)n|  where p is point and n is this vector normalized
    perpendicularDistance(p: Vector2): number {
        const n = this.normalized();
        return p.sub(n.scale(p.dot(n))).magnitude();
    }

    // Returns a point on the closest of the given lines, assuming the lines pass through (0, 0)
    // The point returned is the same distance from the origin as the original point.
    // Note: only lines in the +x quadrants need defining (since they project the same line into -x space)
    // Note: snaps to integer values
    snapTo(lines: Vector2[]): Vector2 {
        if (lines.length === 0) {
            throw new Error('at least one line required');
        }
        let closestLine = lines[0];
        let shortestDistance = Infinity;
        for (const line of lines) {
            const distanceToLine = line.perpendicularDistance(this);
            if (distanceToLine < shortestDistance) {
                closestLine = line;
                shortestDistance = distanceToLine;
            }
        }
        // get a point on the line of same magnitude as this vector
        let point = closestLine.normalized().scale(this.magnitude()).apply(Math.round);

        // preserve ratio of x/y for closest line (better appearance in raster; "spare" pixels appear at the end rather
        // than the start)
        if (!(closestLine.x === 0 || closestLine.y === 0)) {
            if (Math.abs(closestLine.y) > Math.abs(closestLine.x)) {
                const ratio = closestLine.y / closestLine.x;
                point = v(point.x, point.x * ratio);
            } else {
                const ratio = closestLine.x / closestLine.y;
                point = v(point.y * ratio, point.y);
            }
        }

        // correct signs for negative quadrants
        return v(
            this.x >= 0 ? Math.abs(point.x) : -Math.abs(point.x),
            this.y >= 0 ? Math.abs(point.y) : -Math.abs(point.y),
        )
    }
}

export function v(x: number, y: number): Vector2 {
    return new Vector2(x, y);
}

export type GridOptions<T> = {
    size: Vector2
    loop?: boolean
    fill?: T
}

export type GridCell<T> = { pos: Vector2, value: T | null }

@jsonRead(<T>({loop, grid}: {loop: boolean, grid: T[][]}) => {
    const size = v(grid.length, grid[0].length);
    const g = new Grid<T>({size, loop})
    grid.forEach((row, x) => row.map((cell, y) => g.put(v(x, y), cell)))
    return g;
})

// no idea why this is triggered.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Grid<T> {
    readonly size: Vector2
    loop: boolean

    private readonly grid: (T | null)[][];

    constructor({size, loop, fill}: GridOptions<T>) {
        this.size = size;
        this.loop = loop || false;
        this.grid = [...new Array(size.x)].map(() => [...new Array(size.y)].map(() => null));
        if (fill !== undefined) {
            this.fill(fill);
        }
    }

    static repeated<T>(fill?: T): Grid<T> {
        return new Grid<T>({ size: v(1, 1), fill, loop: true })
    }

    get width(): number {
        return this.size.x;
    }

    get height(): number {
        return this.size.y;
    }

    get(v: Vector2): T | null {
        const idx = this.validIndex(v);
        if (idx === null) {
            return null;
        }
        return this.grid[idx.x][idx.y];
    }

    getOrDefault(v: Vector2, def: T): T {
        const element = this.get(v);
        return element === null ? def : element;
    }

    remove(v: Vector2): {previous: T | null} {
        return this.put(v, null);
    }

    put(v: Vector2, value: T | null, compute?: (value: T | null, prev: T | null) => T | null): {previous: T | null} {
        const idx = this.validIndex(v);
        if (idx === null) {
            return {previous: null};
        }
        const previous = (this.grid[idx.x] || [])[idx.y];
        (this.grid[idx.x] || [])[idx.y] = compute ? compute(value, previous) : value;
        this.cellsCacheValidity += 1;
        return {previous};
    }

    fill(value: T | null) {
        this.cells.forEach(({pos}) => this.put(pos, value));
    }

    clear() {
        this.fill(null);
    }

    @jsonOmit
    private cellsCacheValidity = 1; // increment to invalidate
    @jsonOmit
    private cellsCache = cached(
        () => this.cellsCacheValidity,
        () => {
            return this.grid.flatMap((row, i) =>
                row.map((cell, j) =>
                    ({ pos: v(i, j), value: this.get(v(i, j)) })));
        }
    )

    get cells(): GridCell<T>[] {
        return this.cellsCache.get();
    }

    column(x: number): GridCell<T>[] {
        let idxX = x;
        if (this.loop) {
            idxX = modulo(idxX, this.width);
        }
        return (this.grid[idxX] || []).map((value, y) => ({pos: v(x, y), value}));
    }

    row(y: number): GridCell<T>[] {
        let idxY = y;
        if (this.loop) {
            idxY = modulo(idxY, this.height);
        } else if (y >= this.height || y < 0) {
            return [];
        }
        return this.grid.map((row, x) => ({pos: v(x, y), value: row[idxY]}));
    }

    private validIndex(v: Vector2): Vector2 | null {
        let x = v.x;
        let y = v.y;
        if (this.loop) {
            x = modulo(x, this.width);
            y = modulo(y, this.height);
        } else if (x >= this.width || y >= this.height || x < 0 || y < 0) {
            return null;
        }
        return new Vector2(x, y);
    }

    scaleRepeating(size: Vector2): Grid<T> {
        const copy = new Grid<T>({ size, loop: true });
        for (let i = 0; i < size.x; i++) {
            for (let j = 0; j < size.x; j++) {
                const pos = v(i, j);
                copy.put(pos, this.get(pos));
            }
        }
        return copy;
    }

    cropped(): Grid<T> {
        let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
        this.cells.filter(c => c.value !== null).forEach(({pos}) => {
            minX = Math.min(pos.x, minX);
            minY = Math.min(pos.y, minY);
            maxX = Math.max(pos.x, maxX);
            maxY = Math.max(pos.y, maxY);
        });
        if (!isFinite(minX) || !isFinite(minY)) {
            return new Grid<T>({ size: v(0, 0), loop: this.loop });
        }
        const min = v(minX, minY);
        const max = v(maxX, maxY);
        const size = max.sub(min).add(v(1, 1));
        const cropped = new Grid<T>({ size, loop: this.loop });
        this.cells.filter(c => c.value !== null).forEach(({pos, value}) => {
            cropped.put(pos.sub(min), value);
        });
        return cropped;
    }
}

export type Bounds = [fromInclusive: Vector2, toInclusive: Vector2]

export function boundsSize([fromInclusive, toInclusive]: Bounds): Vector2 {
    return v(
        Math.abs(toInclusive.x - fromInclusive.x) + 1,
        Math.abs(toInclusive.y - fromInclusive.y) + 1,
    )
}

export function inBounds([fromInclusive, toInclusive]: Bounds, v: Vector2): boolean {
    return v.x >= fromInclusive.x && v.x <= toInclusive.x
        && v.y >= fromInclusive.y && v.y <= toInclusive.y;
}

export function shrinkBounds([fromInclusive, toInclusive]: Bounds): Bounds {
    return [
        fromInclusive.add(v(1 , 1)),
        toInclusive.sub(v(1, 1)),
    ];
}

export function combineBounds(a: Bounds, b?: Bounds): Bounds {
    if (b === undefined) {
        return [...a];
    }
    return [
        v(Math.min(a[0].x, b[0].x), Math.min(a[0].y, b[0].y)),
        v(Math.max(a[1].x, b[1].x), Math.max(a[1].y, b[1].y)),
    ]
}
