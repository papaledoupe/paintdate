import {h} from 'preact';
import style from "./style.css";
import Raster from "../raster";
import {Grid, v} from "../../../model/space";
import {Stroke} from "../../../model/stroke";
import {rect} from "../../../model/shapes/rect";
import {Color} from "../../../model/pixel";

export type Props = {
    stroke: Stroke | null
    width?: string
    height?: string
    wrapperStyle?: object
}

const StrokeIcon = ({stroke, width = '24px', height = '24px', wrapperStyle = {}}: Props) => {
    let grid: Grid<Color> | undefined;
    if (stroke) {
        grid = new Grid<Color>({ size: v(16, 16) });
        rect({ stroke, size: v(16, 16) })
            .pixels
            .forEach(({pos, color}) => grid?.put(pos, color));
    }
    return (
        <div
            className={style.raster}
            style={{width, height, ...wrapperStyle}}
        >
            <Raster
                width={'inherit'}
                height={'inherit'}
                grid={grid}
            />
        </div>
    );
};
export default StrokeIcon;
