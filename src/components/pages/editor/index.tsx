import {h} from 'preact';
import style from './style.css';
import Canvas from '../../molecules/canvas';
import LayerTree from "../../organisms/layertree";
import {useCallback, useState} from "preact/compat";
import Tools from "../../organisms/tools";
import {Tool, Variant} from "../../../model/tool";
import {tools} from '../../../model/tools/all';
import {useEffect} from "react";
import {Command, History, pasteCommand} from "../../../model/history";
import {Canvas as Model, Layer, PositionedShape} from "../../../model/canvas";
import {Bounds} from "../../../model/space";
import {Shortcuts, shortcutsSingleton} from "../../../model/input";
import {keys} from '../../../config/editor';
import {themes, useTheme} from '../../theme';
import HorizontalRule from '../../atoms/horizontalRule';
import CanvasControls from "../../molecules/canvasControls";
import Preview from "../../molecules/preview";

const history = new History();

export type Props = {
    shortcuts?: Shortcuts
}

const Editor = ({shortcuts = shortcutsSingleton}: Props) => {
    const canvas = history.canvas;

    const [, setRenderCounter] = useState<number>(0);
    const rerender = useCallback(() => setRenderCounter(prev => 1 + prev), []);

    const sendCommand = useCallback((cmd: Command) => history.handleNow(cmd).then(rerender), [rerender]);

    const [highlight, setHighlight] = useState<LayerHighlight>({});

    const [activeTool, setActiveTool] = useState<{ tool: Tool, variant: Variant }>({
        tool: tools.pencil,
        variant: tools.pencil.variant,
    });

    const [activeLayer, setActiveLayer] = useState<string | undefined>(undefined);
    if (activeLayer === undefined && canvas.topLayer() !== null) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setActiveLayer(canvas.topLayer()!.name);
    }

    const connectors = { document, commandSink: sendCommand };
    if (!shortcuts.connected) {
        shortcuts.connect(connectors);
    }
    useEffect(() => {
        const pasteRegistration = shortcuts.register(keys.paste.keystrokes, () => {
            rerender();
            return [pasteCommand()];
        });
        return () => {
            pasteRegistration.cancel();
            shortcuts.disconnect(connectors);
        }
    }, []);

    useTheme(themes[history.editorConfig.theme]);

    return (
        <div class={style.editor}>
            <div className={style.main}>
                <div className={style.tools}>
                    <Tools
                        shortcuts={shortcuts}
                        current={activeTool.tool}
                        onSelect={(tool, variant) => {
                            if (activeTool?.tool) activeTool.tool.active = false;
                            tool.variant = variant;
                            tool.active = true;
                            setActiveTool({ tool, variant });
                        }}
                    />
                </div>
                <div className={style.middle}>
                    <CanvasControls
                        shortcuts={shortcuts}
                        historyInfo={{
                            canUndo: history.canUndo,
                            canRedo: history.canRedo,
                        }}
                        canvasSettings={canvas.settings}
                        editorConfig={history.editorConfig}
                        sendCommand={sendCommand}
                    />
                    <div className={style.canvas}>
                        <Canvas
                            activeLayer={(activeLayer && canvas.namedLayer(activeLayer)) || undefined}
                            activeTool={activeTool}
                            editorConfig={history.editorConfig}
                            canvas={canvas}
                            highlights={handleLayerHighlight(canvas, highlight)}
                            sendCommand={sendCommand}
                        />
                    </div>
                </div>
                <div className={style.layers}>
                    <Preview canvas={canvas} />
                    <HorizontalRule />
                    <LayerTree
                        sendCommand={sendCommand}
                        layers={canvas.layers}
                        onHover={(layer, shape) => setHighlight({layer, shape})}
                        activeLayer={activeLayer}
                        onSelect={layer => setActiveLayer(layer?.name)}
                    />
                </div>
            </div>
        </div>
    );
};
export default Editor;

type LayerHighlight = { layer?: Layer, shape?: PositionedShape }
function handleLayerHighlight(canvas: Model, {layer, shape}: LayerHighlight): Bounds[] {
    if (layer && shape) {
        const [from, to] = shape.shape.bounds.map(b => b.add(shape.origin).add(layer.origin));
        return [[ from, to ]];
    } else if (layer) {
        const bounds = layer.bounds;
        if (bounds !== null) {
            const [from, to] = bounds.map(b => b.add(layer.origin));
            return [[from, to]];
        }
    }
    return [];
}
