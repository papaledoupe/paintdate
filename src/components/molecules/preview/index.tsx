import {h} from 'preact';
import style from './style.css';
import {Canvas} from "../../../model/canvas";
import Raster from "../../atoms/raster";
import {useRef} from "react";
import {themeColorScheme} from "../../../util/dom/canvas";
import {v} from "../../../model/space";

const Preview = ({canvas}: {canvas: Canvas}) => {
    const previewRef = useRef<HTMLDivElement>(null);
    const rasterSize = canvas.settings.size;
    const offset = v(
        previewRef.current?.clientWidth ?? 0,
        previewRef.current?.clientHeight ?? 0
    ).sub(rasterSize).scale(0.5);

    return (
        <div ref={previewRef} className={style.preview}>
            <div
                className={style.raster}
                style={{
                    left: offset.x,
                    top: offset.y,
                }}
            >
                <Raster
                    grid={canvas.flatGrid()}
                    width={`${rasterSize.x}px`}
                    height={`${rasterSize.y}px`}
                    scheme={themeColorScheme}
                />
            </div>
        </div>
    );
};
export default Preview;