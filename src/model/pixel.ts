import {Vector2} from "./space";
import {assertIsNever} from "../util/types";

export type Pixel = {pos: Vector2, color: Color}

export type Color = 'black' | 'white';

export type BlendMode = 'normal' | 'invert';

export function blend(mode: BlendMode, bottom: Color | null, top: Color | null): Color | null {
    if (mode === 'normal') {
        return top === null ? bottom : top;
    }
    if (mode === 'invert') {
        if (top === null) {
            return bottom;
        }
        if (bottom === null) {
            return top;
        }
        return bottom === 'black' ? 'white' : 'black';
    }
    return assertIsNever(mode);
}
