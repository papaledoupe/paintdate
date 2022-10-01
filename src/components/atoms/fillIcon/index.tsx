import {h} from 'preact';
import style from "./style.css";
import Raster from "../raster";
import {v} from "../../../model/space";
import {Fill} from "../../../model/fill";

export type Props = {
    fill: Fill | null
    width?: string
    height?: string
    wrapperStyle?: object
}

const FillIcon = ({fill, width = '24px', height = '24px', wrapperStyle = {}}: Props) => {
    const grid = fill?.grid.scaleRepeating(v(8, 8));
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
export default FillIcon;
