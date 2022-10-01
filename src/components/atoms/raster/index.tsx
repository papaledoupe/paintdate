import {h, Ref} from 'preact';
import {Color, Pixel} from "../../../model/pixel";
import {Grid} from "../../../model/space";
import {useEffect, useRef} from "preact/compat";
import style from './style.css';
import {CanvasColorScheme, drawToCanvas} from "../../../util/dom/canvas";

export type RasterProps = {
    width: string
    height: string
    grid?: Grid<Color>
    additionalPixels?: Pixel[]
    scheme?: CanvasColorScheme
};

const EmptyRaster = ({width, height}: {width: string, height: string}) => {
    const canvasRef: Ref<HTMLCanvasElement> = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d');
        if (!context || !canvas) {
            return;
        }
        context.withStateScope(() => {
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.strokeStyle = 'red';
            context.lineWidth = 4;
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(canvas.width, canvas.height);
            context.stroke();
            context.closePath();
        });
    });

    return (
        <canvas
            className={style.raster}
            style={{
                width,
                height,
            }}
            ref={canvasRef}
            width={width === 'inherit' ? 100 : width}
            height={height === 'inherit' ? 100 : height}
        />
    )
}

const Raster = ({width, height, grid, additionalPixels, scheme}: RasterProps) => {
    const canvasRef: Ref<HTMLCanvasElement> = useRef(null);
    useEffect(() => {
        if (!grid) return;
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d');
        if (!context) {
            return;
        }
        drawToCanvas(context, grid, additionalPixels, scheme);
    }, [grid, additionalPixels, scheme]);

    if (!grid) {
        return <EmptyRaster width={width} height={height} />
    }

    return (
        <canvas
            className={style.raster}
            style={{
                width,
                height,
            }}
            ref={canvasRef}
            width={grid.width}
            height={grid.height}
        />
    )
}
export default Raster;
