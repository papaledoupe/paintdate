import {Color} from "./pixel";
import {Grid, Vector2} from "./space";
import {modulo} from "../util/math";
import {jsonRead} from "../util/json";
import {Fill} from "./fill";
import {capitalize} from "../util/string";

export interface Stroke {
    get name(): string
    // pos = position in space
    // linearPos = position along the stroke line (starting at 0 for a given Shape)
    pixelColor(pos: Vector2, linearPos: number): Color | null
}

export function solidStroke(color: Color): Stroke {
    return new Solid(capitalize(color), color);
}

export function linePatternStroke(name: string, pattern: (Color | null)[]): Stroke {
    return new LinePattern(name, pattern);
}

export function gridPatternStroke(name: string, grid: Grid<Color>): Stroke {
    return new GridPattern(name, grid);
}

export function dottedStroke(name: string, color: Color, spacing = 1): Stroke {
    return dashedStroke(name, color, 1, spacing);
}

export function dashedStroke(name: string, color: Color, length: number, spacing = 1): Stroke {
    let pattern: (Color | null)[] = [...new Array(length)].map(() => color);
    pattern = pattern.concat([...new Array(spacing)].map(() => null))
    return linePatternStroke(name, pattern);
}

export function strokeFromFill(fill: Fill): Stroke {
    return new FromFill(fill);
}

@jsonRead(({name, color}) => new Solid(name, color))
class Solid implements Stroke {
    readonly name: string
    readonly color: Color

    constructor(name: string, color: Color) {
        this.name = name;
        this.color = color;
    }

    pixelColor(): Color {
        return this.color;
    }
}

// produces a patterned line by varying the color by linearPos
// i.e., the pattern follows the line and does not depend on the pixel's point in space
@jsonRead(({name, pattern}) => new LinePattern(name, pattern))
class LinePattern implements Stroke {
    readonly name: string
    readonly pattern: (Color | null)[] // repeating unit of the stroke pattern

    constructor(name: string, pattern: (Color | null)[]) {
        this.name = name;
        this.pattern = pattern;
    }

    pixelColor(_: Vector2, linearPos: number): (Color | null) {
        return this.pattern[modulo(linearPos, this.pattern.length)];
    }
}

// produces a patterned line in the same manner as grid-fill
// i.e., the pattern depends on the pixel's point in space
@jsonRead(({name, grid}) => new GridPattern(name, grid))
class GridPattern implements Stroke {
    readonly name: string
    private readonly grid: Grid<Color>

    constructor(name: string, grid: Grid<Color>) {
        this.name = name;
        grid.loop = true;
        this.grid = grid;
    }

    pixelColor(pos: Vector2): Color | null {
        return this.grid.get(pos);
    }
}

@jsonRead(({fill}) => new FromFill(fill))
class FromFill implements Stroke {
    private readonly fill: Fill

    get name(): string {
        return this.fill.name;
    }

    constructor(fill: Fill) {
        this.fill = fill;
    }

    pixelColor(pos: Vector2): Color | null {
        return this.fill.pixelColor(pos);
    }
}

export const builtIn: Stroke[] = [
    solidStroke('black'),
    solidStroke('white'),
    dottedStroke('Black dotted 1', 'black', 1),
    dottedStroke('White dotted 1', 'white', 1),
    dashedStroke('Black dashed 2/2', 'black', 2, 2),
    dashedStroke('White dashed 2/2', 'white', 2, 2),
];
