import {h, VNode} from 'preact';
import {Canvas as Model, Layer} from '../../../model/canvas';
import Raster from "../../atoms/raster";
import {Bounds, v, Vector2} from "../../../model/space";
import {useMemo, useRef, useState} from "preact/compat";
import {Fragment, useEffect} from "react";
import style from './style.css';
import {CursorMode, Tool, Variant} from "../../../model/tool";
import {Command} from "../../../model/history";
import {
    Box as BoxIcon,
    Edit2 as PencilIcon,
    Move as MoveIcon,
    Square as SquareIcon,
    XSquare as XSquareIcon
} from 'preact-feather';
import {EditorConfig} from "../../../config/editor";

type ActiveTool = {
    tool: Tool
    variant: Variant
}

type CursorPos = {
    real: Vector2   // screen pixels relative to canvas element
    image: Vector2  // image pixels
}

const Canvas = ({activeTool, activeLayer, canvas, editorConfig, highlights, sendCommand}: {
    activeLayer?: Layer
    activeTool: ActiveTool
    canvas: Model
    editorConfig: EditorConfig
    highlights: Bounds[]
    sendCommand(cmd: Command): void
}) => {
    const scale = editorConfig.scale;
    const actualWidthPx = scale * canvas.settings.size.x;
    const actualHeightPx = scale * canvas.settings.size.y;

    // cursor position in image coordinates
    const [cursorPos, setCursorPos] = useState<CursorPos | null>(null);
    const finishDrawing = () => {
        if (cursorPos) {
            const commands = activeTool.tool.onFinish?.(cursorPos.image, activeLayer || null) || [];
            commands.forEach(sendCommand);
        }
    }

    return (
        <div
            className={style.canvas}
            onMouseDown={() => cursorPos &&  activeTool.tool.onStart?.(cursorPos.image, activeLayer || null)}
            onMouseUp={finishDrawing}
            onMouseLeave={finishDrawing}
            onMouseMove={() => cursorPos && activeTool.tool.onMove?.(cursorPos.image, activeLayer || null)}
        >
            <Background
                width={actualWidthPx}
                height={actualHeightPx}
                scale={scale}
                gridSize={editorConfig.grid}
            />
            <Image
                canvas={canvas}
                activeTool={activeTool}
                width={actualWidthPx}
                height={actualHeightPx}
            />
            <Overlay
                width={actualWidthPx}
                height={actualHeightPx}
                scale={scale}
                cursorPos={cursorPos}
                cursorMode={activeTool.tool.cursorMode}
                onMoveCursor={setCursorPos}
                showCoordinates={editorConfig.showCoordinates}
                highlights={[
                    ...highlights,
                    ...getCursorHighlights(cursorPos, activeTool, activeLayer),
                ]}
            />
        </div>
    )
}
export default Canvas;

const Background = ({ width, height, scale, gridSize }: {
    width: number
    height: number
    scale: number
    gridSize: Vector2
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d');
        if (!context) {
            return;
        }
        const gridSizeActual = gridSize.scale(scale);
        const gridBoxesX = Math.ceil(width / gridSizeActual.x);
        const gridBoxesY = Math.ceil(height / gridSizeActual.y);
        for (let i = 0; i < gridBoxesX; i++) {
            for (let j = 0; j < gridBoxesY; j++) {
                context.withStateScope(() => {
                    context.fillStyle = ((i + j) % 2 === 1) ? 'silver' : 'lightgrey';
                    context.fillRect(gridSizeActual.x * i, gridSizeActual.y * j, gridSizeActual.x, gridSizeActual.y)
                });
            }
        }
    }, [width, height, scale, gridSize]);

    return (
        <canvas
            width={width}
            height={height}
            ref={canvasRef}
        />
    );
}

const Image = ({width, height, canvas, activeTool}: {
    width: number
    height: number
    canvas: Model
    activeTool: ActiveTool
}) => {
    const grid = useMemo(
        () => canvas.flatGrid(activeTool.tool.virtualShapes),
        [canvas.version, JSON.stringify(activeTool.tool.virtualShapes)]
    );
    return (
        <Raster
            grid={grid}
            width={`${width}px`}
            height={`${height}px`}
        />
    );
};

const Overlay = ({ width, height, scale, cursorPos, cursorMode, highlights, showCoordinates, onMoveCursor }: {
    width: number
    height: number
    scale: number
    cursorPos: CursorPos | null
    cursorMode: CursorMode
    showCoordinates: boolean
    highlights: Bounds[]
    onMoveCursor(pos: CursorPos | null): void
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d');
        if (!context || !canvas) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        // cursor + coordinates
        if (cursorPos !== null) {
            if (cursorMode.highlight === 'pixel') {
                context.withStateScope(() => {
                    context.fillStyle = 'rgba(66, 66, 255, 0.1)';
                    const rects: [number, number, number, number][] = [
                        // top to center
                        [cursorPos.image.x * scale, 0, scale, cursorPos.image.y * scale],
                        // center to bottom
                        [cursorPos.image.x * scale, (cursorPos.image.y + 1) * scale, scale, canvas.height],
                        // left to center
                        [0, cursorPos.image.y * scale, cursorPos.image.x * scale, scale],
                        // center to right
                        [(cursorPos.image.x + 1) * scale, cursorPos.image.y * scale, canvas.width, scale],
                    ];
                    rects.forEach(rect => context.fillRect(...rect));
                });
                context.withStateScope(() => {
                    context.lineWidth = 0.5;
                    context.strokeStyle = 'grey';
                    context.strokeRect(
                        cursorPos.image.x * scale,
                        cursorPos.image.y * scale,
                        scale,
                        scale
                    );
                    if (showCoordinates) {
                        context.fillText(cursorPos.image.toString(), 0, 10);
                    }
                });
            }
        }

        // highlights
        highlights.forEach(([from, to]) => {
            // fudge to add the extra pixel width to the bounds
            from = from.add(v(
                to.x > from.x ? 0 : 1,
                to.y > from.y ? 0 : 1,
            ));
            to = to.add(v(
                to.x > from.x ? 1 : 0,
                to.y > from.y ? 1 : 0,
            ));
            // scale to screen coords
            from = from.scale(scale);
            to = to.scale(scale);

            const lines: Bounds[] = [
                [v(0, from.y), v(canvas.width, from.y)],
                [v(0, to.y), v(canvas.width, to.y)],
                [v(from.x, 0), v(from.x, canvas.height)],
                [v(to.x, 0), v(to.x, canvas.height)],
            ];
            lines.forEach(([from, to]) => {
                context.withStateScope(() => {
                    context.strokeStyle = 'grey';
                    context.setLineDash([2, 2]);
                    context.beginPath();
                    context.moveTo(from.x, from.y);
                    context.lineTo(to.x, to.y);
                    context.stroke();
                    context.closePath();
                });
            });
            context.withStateScope(() => {
                context.fillStyle = 'rgba(66, 66, 255, 0.3)';
                context.fillRect(from.x, from.y, to.sub(from).x, to.sub(from).y);
            });
        });

    }, [
        cursorPos?.image,
        cursorMode.highlight,
        scale,
        showCoordinates,
        highlights,
    ]);

    return (
        <Fragment>
            {cursorPos !== null
                && canvasRef.current
                && getCursorIcon(cursorMode, cursorPos, scale, canvasRef.current)}
            <canvas
                onMouseMove={e => {
                    onMoveCursor({
                        real: v(e.offsetX, e.offsetY),
                        image: v(
                            Math.floor(e.offsetX / scale),
                            Math.floor(e.offsetY / scale),
                        )
                    });
                }}
                onMouseLeave={() => onMoveCursor(null)}
                width={width}
                height={height}
                ref={canvasRef}
            />
        </Fragment>
    )
}

function getCursorIcon(mode: CursorMode, pos: CursorPos, scale: number, canvas: HTMLCanvasElement): VNode | null {
    const sizePx = 16;
    const rect = canvas.getBoundingClientRect();

    if (mode.icon === 'move') {
        return <MoveIcon
            size={sizePx}
            color={mode.iconColor}
            style={{
                position: 'fixed',
                top: rect.top + pos.real.y - (sizePx / 2),
                left: rect.left + pos.real.x - (sizePx / 2),
            }}
        />
    }
    if (mode.icon === 'pencil') {
        return <PencilIcon
            size={sizePx}
            color={mode.iconColor}
            style={{
                position: 'fixed',
                top: rect.top + pos.image.y*scale - sizePx,
                left: rect.left + pos.image.x*scale + scale,
            }}
        />
    }
    if (mode.icon === 'square') {
        return <SquareIcon
            size={sizePx}
            color={mode.iconColor}
            style={{
                position: 'fixed',
                top: rect.top + pos.image.y*scale - sizePx,
                left: rect.left + pos.image.x*scale + scale,
            }}
        />
    }
    if (mode.icon === 'x-square') {
        return <XSquareIcon
            size={sizePx}
            color={mode.iconColor}
            style={{
                position: 'fixed',
                top: rect.top + pos.image.y*scale - sizePx,
                left: rect.left + pos.image.x*scale + scale,
            }}
        />
    }
    if (mode.icon === 'box') {
        return <BoxIcon
            size={sizePx}
            color={mode.iconColor}
            style={{
                position: 'fixed',
                top: rect.top + pos.image.y*scale - sizePx,
                left: rect.left + pos.image.x*scale + scale,
            }}
        />
    }
    return null;
}

function getCursorHighlights(cursorPos: CursorPos | null, activeTool: ActiveTool, activeLayer?: Layer): Bounds[] {
    const highlightType = activeTool.tool.cursorMode.highlight;

    if (highlightType === undefined || highlightType === 'pixel') {
        // empty so last case works with flow-typing
    } else if (highlightType === 'layer') {
        if (activeLayer && activeLayer.bounds) {
            const [from, to] = activeLayer.bounds.map(b => b.add(activeLayer.origin));
            return [[from, to]];
        }
    } else if (highlightType === 'shape') {
        if (activeLayer && cursorPos) {
            const shape = activeLayer.topShapeAt(cursorPos.image.sub(activeLayer.origin))?.shape;
            if (shape) {
                const [from, to] = shape.shape.bounds.map(b => b.add(activeLayer.origin).add(shape.origin));
                return [[from, to]];
            }
        }
    } else {
        const [from, to] = highlightType.map(b => b.add(activeLayer?.origin ?? Vector2.zero));
        return [[from, to]];
    }
    return [];
}
