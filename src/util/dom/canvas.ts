import {Color, Pixel} from "../../model/pixel";
import {Grid, Vector2} from "../../model/space";

export type CanvasColorScheme = (color: Color, canvasStyle: CSSStyleDeclaration) => string;
export const bwColorScheme: CanvasColorScheme = c => c;
export const themeColorScheme: CanvasColorScheme = (color, canvasStyle) =>
    canvasStyle.getPropertyValue(color === 'black' ? '--theme-screen-black' : '--theme-screen-white');

export function drawToCanvas(context: CanvasRenderingContext2D, grid: Grid<Color>, pixels?: Pixel[], scheme: CanvasColorScheme = bwColorScheme) {
    context.withStateScope(() => {
        context.clearRect(0, 0, grid.width, grid.height);
        const canvasStyle = getComputedStyle(context.canvas);
        const drawPixel = ({x, y}: Vector2, color: Color | null) => {
            if (color === null) {
                return;
            }
            context.fillStyle = scheme(color, canvasStyle);
            context.fillRect(x, y, 1, 1);
        }
        grid.cells.forEach(({pos, value: color}) => drawPixel(pos, color));
        pixels?.forEach(({pos, color}) => drawPixel(pos, color));
    });
}

export function gridToImageData(type: string, grid: Grid<Color>, pixels?: Pixel[]): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')
    if (ctx === null) {
        throw new Error('failed to get canvas 2d context');
    }
    drawToCanvas(ctx, grid, pixels);
    return canvas.toDataURL(type);
}

declare global {
    interface CanvasState {
        // enclose drawing that changes the drawing state (e.g. styles) in this block to have them rolled back after
        withStateScope<T>(f: () => T): T
    }
}
CanvasRenderingContext2D.prototype.withStateScope = function <T>(f: () => T): T {
    try {
        this.save();
        return f();
    } finally {
        this.restore();
    }
}
