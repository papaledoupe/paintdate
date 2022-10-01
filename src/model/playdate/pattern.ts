import {Grid, v} from "../space";
import {Color} from "../pixel";

export type PatternData = [number, number, number, number, number, number, number, number];

const nopMask: PatternData = [1, 1, 1, 1, 1, 1, 1, 1];

function dataFromHexString(str: string): PatternData | null {
    if (str.length != 16) {
        return null;
    }
    const pattern: number[] = [];
    for (let i = 0; i < 16; i += 2) {
        const num = parseInt(str.slice(i, i + 2), 16);
        if (isNaN(num)) {
            return null;
        }
        pattern.push(num);
    }
    return pattern as PatternData;
}

export class Pattern {
    readonly data: PatternData
    readonly mask: PatternData
    readonly grid: Grid<Color>

    private constructor(data: PatternData, mask?: PatternData) {
        this.data = data;
        this.mask = mask ?? nopMask;
        this.grid = Pattern.toGrid(data, mask);
    }

    private static toGrid(data: PatternData, mask?: PatternData): Grid<Color> {
        const grid = new Grid<Color>({
            size: v(8, 8),
            loop: true,
        });
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (mask && ((mask[y] >> x) & 1) === 0) {
                    continue;
                }
                grid.put(v(7-x, y), ((data[y] >> x) & 1) === 1 ? 'white' : 'black');
            }
        }
        return grid;
    }

    toHexString(): string {
        return [
            ...this.data,
            ...(this.mask === nopMask ? [] : this.mask),
        ].map(i => Number(i).toString(16)).join('');
    }

    static fromData(data: PatternData): Pattern {
        return new Pattern(data);
    }

    // from lua table in format {0x5F, 0xEE, 0x77, 0xBB, 0xDD, 0xEE, 0xF5, 0xBB}
    // as provided by gfxp: https://dev.playdate.store/tools/gfxp/
    static fromTable(str: string): Pattern | null {
        const hexString = str.slice(1, str.length - 1).split(',')
            .map(s => {
                // eslint-disable-next-line radix
                return Number(parseInt(s.trim())).toString(16);
            })
            .map(s => s.length === 1 ? `0${s}` : s)
            .join('');
        return this.fromHexString(hexString);
    }

    static fromHexString(str: string): Pattern | null {
        if (str.length === 16) {
            const data = dataFromHexString(str)
            return data === null ? null : new Pattern(data);
        } else if (str.length === 32) {
            const data = dataFromHexString(str.slice(0, 16));
            const mask = dataFromHexString(str.slice(16));
            return data === null || mask === null ? null : new Pattern(data, mask);
        }
        return null;
    }
}
