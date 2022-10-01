import {Grid, v, Vector2} from "./space";
import {Color} from "./pixel";
import {jsonRead} from "../util/json";
import {capitalize} from "../util/string";

export interface Fill {
    get name(): string
    pixelColor(pos: Vector2): Color | null
    get grid(): Grid<Color>
}

export function solidFill(color: Color): Fill {
    return new Solid(color);
}

export function simpleDither(a: Color | null, b: Color | null): Grid<Color> {
    const pattern = new Grid<Color>({size: v(2, 2), loop: true});
    pattern.put(v(0, 0), a);
    pattern.put(v(1, 0), b);
    pattern.put(v(1, 1), a);
    pattern.put(v(0, 1), b);
    return pattern;
}

export function patternFill(name: string, pattern: Grid<Color>): Fill {
    return new PatternFill(name, pattern);
}

@jsonRead(({color}) => new Solid(color))
class Solid implements Fill {
    readonly color: Color

    constructor(color: Color) {
        this.color = color;
    }

    pixelColor(): Color {
        return this.color;
    }

    get name(): string {
        return capitalize(this.color);
    }

    get grid(): Grid<Color> {
        return new Grid<Color>({
            size: v(1, 1),
            fill: this.color,
            loop: true,
        });
    }
}

@jsonRead(({name, grid}) => new PatternFill(name, grid))
class PatternFill implements Fill {
    readonly name: string
    readonly grid: Grid<Color>

    constructor(name: string, grid: Grid<Color>) {
        this.name = name;
        grid.loop = true;
        this.grid = grid;
    }

    pixelColor(pos: Vector2): Color | null {
        return this.grid.get(pos);
    }
}

export const builtIn: Fill[] = [
    solidFill('black'),
    solidFill('white'),
    patternFill('Black dither 1', simpleDither('black', null)),
    patternFill('White dither 1', simpleDither('white', null)),
];
