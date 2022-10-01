import {Drag} from "./drag";
import {Pencil} from "./pencil";
import {Eraser} from "./eraser";
import {Select} from "./select";
import {Rect} from "./rect";
import {Line} from "./line";
import {Fill} from "./fill";
import {Tool} from "../tool";

export const tools: {[name: string]: Tool} = {
    drag: new Drag(),
    pencil: new Pencil(),
    eraser: new Eraser(),
    select: new Select(),
    rect: new Rect(),
    line: new Line(),
    fill: new Fill(),
}