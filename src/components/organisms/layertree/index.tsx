import {h} from 'preact';
import {
    addLayerCommand,
    deleteLayerCommand,
    deleteShapeCommand,
    duplicateLayerCommand,
    duplicateShapeCommand,
    flattenLayerCommand,
    hideLayerCommand,
    Layer,
    mergeLayerDownCommand,
    mergeShapeDownCommand,
    PositionedShape,
    renameLayerCommand,
    reorderLayerCommand,
    reorderShapeCommand,
    replaceShapeCommand,
    showLayerCommand
} from "../../../model/canvas";
import {useState} from "preact/compat";
import {Fragment} from "react";
import {Command} from "../../../model/history";
import style from './style.css';
import {
    ChevronDown,
    ChevronsDown,
    ChevronUp,
    Copy,
    Eye,
    EyeOff,
    Layers,
    Maximize,
    Minimize,
    Trash2,
    Plus,
} from "preact-feather";
import IconButton from "../../atoms/iconButton";
import {ShapeOptions} from "../../../model/shape";
import {isRect, Rect, RectOptions} from "../../../model/shapes/rect";
import {isLine, Line, LineOptions} from "../../../model/shapes/line";
import {
    CheckboxConfigItem,
    OptionalFillConfigItem,
    OptionalStrokeConfigItem, StrokeConfigItem,
    VectorConfigItem
} from "../../molecules/configItem";
import {Freeform, FreeformOptions, isFreeform} from '../../../model/shapes/freeform';
import {v} from "../../../model/space";
import ButtonGroup, { InvertButtonGroup } from "../../atoms/buttonGroup";
import SimpleGrid from "../../atoms/simpleGrid";

const LayerName = (props: {
    name: string
    change: (name: string) => void
}) => {
    const [name, setName] = useState<string>(props.name);
    return (
        <input
            className={style.nameInput}
            type='text'
            value={name}
            onChange={e => setName(e.currentTarget.value)}
            onKeyDown={e => {
                if (e.code !== 'Enter') {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.blur();
                const value = e.currentTarget.value ?? '';
                if (props.name !== value) {
                    props.change(value);
                }
            }}
            onBlur={e => {
                const value = (e.target as HTMLInputElement)?.value ?? '';
                if (props.name !== value) {
                    props.change(value);
                }
            }}
        />
    );
}

const LayerHead = (props: {
    layer: Layer
    active: boolean
    expanded: boolean
    click?: () => void
    rename?: (newName: string) => void
    show?: () => void
    hide?: () => void
    expand?: () => void
    collapse?: () => void
    hover?: () => void
    unhover?: () => void
    moveUp?: () => void
    moveDown?: () => void
    mergeDown?: () => void
    flatten?: () => void
    delete?: () => void
    duplicate?: () => void
}) => (
    <div
        className={`${style.layerHead} ${props.active ? style.active : ''}`}
        onClick={() => props.click?.()}
        onMouseEnter={() => props.hover?.()}
        onMouseLeave={() => props.unhover?.()}
    >
        <div className={style.layerName}>
            <LayerName
                name={props.layer.name}
                change={name => props.rename?.(name)}
            />
        </div>
        <div className={style.layerActions}>
            <ButtonGroup>
                {props.layer.hidden
                    ? <IconButton icon={EyeOff} onClick={() => props.show?.()} toolTip='Show' iconSize='large' />
                    : <IconButton icon={Eye} onClick={() => props.hide?.()} toolTip='Hide' iconSize='large' />}
                {props.expanded
                    ? <IconButton icon={Maximize} onClick={() => props.collapse?.()} toolTip='Collapse' iconSize='large' />
                    : <IconButton icon={Minimize} onClick={() => props.expand?.()} toolTip='Expand' iconSize='large' />}
                {props.mergeDown
                    && <IconButton icon={ChevronsDown} onClick={() => props.mergeDown?.()} toolTip='Merge down' iconSize='large' />}
                {props.flatten
                    && <IconButton icon={Layers} onClick={() => props.flatten?.()} toolTip='Flatten' iconSize='large' />}
                {props.moveUp
                    && <IconButton icon={ChevronUp} onClick={() => props.moveUp?.()} toolTip='Move up' iconSize='large' />}
                {props.moveDown
                    && <IconButton icon={ChevronDown} onClick={() => props.moveDown?.()} toolTip='Move down' iconSize='large' />}
                {props.duplicate
                    && <IconButton icon={Copy} onClick={() => props.duplicate?.()} toolTip='Duplicate' iconSize='large' />}
                {props.delete
                    && <IconButton icon={Trash2} onClick={() => props.delete?.()} toolTip='Delete' iconSize='large' />}
            </ButtonGroup>
        </div>
    </div>
)

const RectControls = ({rect, mask, alter}: {
    rect: Rect
    mask: boolean
    alter?: (options: ShapeAlterations<RectOptions>) => void
}) => (
    <SimpleGrid columns={2}>
        <OptionalFillConfigItem
            read={() => rect.fill}
            write={fill => alter?.({fill})}
        />
        <OptionalStrokeConfigItem
            read={() => rect.stroke}
            write={stroke => alter?.({stroke})}
        />
        <VectorConfigItem
            label='Size'
            xLabel='w'
            yLabel='h'
            read={() => rect.size}
            write={size => alter?.({size})}
        />
        <VectorConfigItem
            label='Fill origin'
            read={() => rect.fillOrigin}
            write={fillOrigin => alter?.({fillOrigin})}
        />
        <CheckboxConfigItem
            label='Invert'
            read={() => rect.mode === 'invert'}
            write={invert => alter?.({mode: invert ? 'invert' : 'normal'})}
        />
        <CheckboxConfigItem
            label='Mask'
            read={() => mask}
            write={mask => alter?.({mask})}
        />
    </SimpleGrid>
);

const LineControls = ({line, mask, alter}: {
    line: Line
    mask: boolean
    alter?: (options: ShapeAlterations<LineOptions>) => void
}) => (
    <SimpleGrid columns={2}>
        <StrokeConfigItem
            read={() => line.stroke}
            write={stroke => alter?.({stroke})}
        />
        <VectorConfigItem
            label='Vector'
            read={() => line.vector}
            max={v(999, 999)}
            min={v(-999, -999)}
            write={vector => alter?.({vector})}
        />
        <CheckboxConfigItem
            label='Invert'
            read={() => line.mode === 'invert'}
            write={invert => alter?.({mode: invert ? 'invert' : 'normal'})}
        />
        <CheckboxConfigItem
            label='Mask'
            read={() => mask}
            write={mask => alter?.({mask})}
        />
    </SimpleGrid>
);

const FreeformControls = ({freeform, mask, alter}: {
    freeform: Freeform
    mask: boolean
    alter?: (options: ShapeAlterations<FreeformOptions>) => void
}) => (
    <SimpleGrid columns={2}>
        <CheckboxConfigItem
            label='Invert'
            read={() => freeform.mode === 'invert'}
            write={invert => alter?.({mode: invert ? 'invert' : 'normal'})}
        />
        <CheckboxConfigItem
            label='Mask'
            read={() => mask}
            write={mask => alter?.({mask})}
        />
    </SimpleGrid>
);

export type ShapeAlterations<T extends ShapeOptions> = Partial<T & { mask: boolean }>

const ShapeRow = (props: {
    shape: PositionedShape
    activeLayer: boolean
    click?: () => void
    hover?: () => void
    unhover?: () => void
    mergeDown?: () => void
    moveUp?: () => void
    moveDown?: () => void
    delete?: () => void
    duplicate?: () => void
    alter?: <T extends ShapeOptions>(options: ShapeAlterations<T>) => void
}) => (
    <div
        className={`${style.shape} ${props.activeLayer ? style.active : ''}`}
        onClick={() => props.click?.()}
        onMouseEnter={() => props.hover?.()}
        onMouseLeave={() => props.unhover?.()}
    >
        <div className={style.shapeHead}>
            <div className={style.shapeType}>
                <span>{props.shape.shape.type}{props.shape.mask ? ' mask' : ''}</span>
            </div>
            <div className={style.shapeActions}>
                <InvertButtonGroup>
                    {props.moveUp
                        && <IconButton icon={ChevronUp} onClick={() => props.moveUp?.()} toolTip='Move up' iconSize='small' />}
                    {props.moveDown
                        && <IconButton icon={ChevronDown} onClick={() => props.moveDown?.()} toolTip='Move down' iconSize='small' />}
                    {props.mergeDown
                        && <IconButton icon={ChevronsDown} onClick={() => props.mergeDown?.()} toolTip='Merge down' iconSize='small' />}
                    {props.duplicate
                        && <IconButton icon={Copy} onClick={() => props.duplicate?.()} toolTip='Duplicate' iconSize='small' />}
                    {props.delete
                        && <IconButton icon={Trash2} onClick={() => props.delete?.()} toolTip='Delete' iconSize='small' />}
                </InvertButtonGroup>
            </div>
        </div>
        <div className={style.shapeControls}>
            {isRect(props.shape.shape) && <RectControls
                mask={props.shape.mask}
                rect={props.shape.shape}
                alter={opts => props.alter?.(opts)}
            />}
            {isLine(props.shape.shape) && <LineControls
                mask={props.shape.mask}
                line={props.shape.shape}
                alter={opts => props.alter?.(opts)}
            />}
            {isFreeform(props.shape.shape) && <FreeformControls
                mask={props.shape.mask}
                freeform={props.shape.shape}
                alter={opts => props.alter?.(opts)}
            />}
        </div>
    </div>
)

const GlobalActions = ({newLayer}: {newLayer?: () => void}) => {
    return (
        <div className={style.header}>
            <h4>Layers</h4>
            <div className={style.globalActions}>
                {newLayer && <IconButton
                    icon={Plus}
                    iconSize='large'
                    toolTip='Add new layer'
                    onClick={() => newLayer?.()}
                />}
            </div>
        </div>
    )
}

const LayerSection = ({layer, expanded, active, first, last, sendCommand, onHover, onSelect, setExpanded}: {
    layer: Layer
    expanded: boolean
    active: boolean
    first: boolean
    last: boolean
    setExpanded(expanded: boolean): void
    sendCommand(command: Command): void
    onHover(layer?: Layer, shape?: PositionedShape): void
    onSelect(layer?: Layer): void
}) => {
    return (
        <div className={`${style.layer} ${active ? style.active : ''}`}>
            <LayerHead
                key={layer.name}
                active={active}
                layer={layer}
                click={() => onSelect(layer)}
                rename={newName => sendCommand(renameLayerCommand({ layerName: layer.name, newName }))}
                expanded={expanded}
                expand={() => setExpanded(true)}
                collapse={() => setExpanded(false)}
                hover={() => onHover(layer)}
                unhover={() => onHover()}
                hide={() => sendCommand(hideLayerCommand({ name: layer.name }))}
                show={() => sendCommand(showLayerCommand({ name: layer.name }))}
                moveUp={first ? undefined : () => sendCommand(reorderLayerCommand({ name: layer.name, direction: 'up' }))}
                moveDown={last ? undefined : () => sendCommand(reorderLayerCommand({ name: layer.name, direction: 'down' }))}
                mergeDown={last ? undefined : () => sendCommand(mergeLayerDownCommand({ name: layer.name }))}
                duplicate={() => sendCommand(duplicateLayerCommand({ name: layer.name }))}
                flatten={layer.shapes.length > 1 ? () => sendCommand(flattenLayerCommand({ name: layer.name })) : undefined}
                delete={() => {
                    onHover();
                    sendCommand(deleteLayerCommand({ name: layer.name }));
                }}
            />
            <div className={`${style.shapeRows} ${active ? style.active : ''}`}>
                {expanded && layer.shapes.map((shape, i)  => {
                    const firstShape = i === 0;
                    const lastShape = i >= layer.shapes.length - 1;
                    return (
                        <ShapeRow
                            key={`${layer.name}.${i}`}
                            shape={shape}
                            activeLayer={active}
                            click={() => onSelect(layer)}
                            hover={() => onHover(layer, shape)}
                            unhover={() => onHover()}
                            moveUp={firstShape && first ? undefined : () => sendCommand(reorderShapeCommand({ layerName: layer.name, index: i, direction: 'up' }))}
                            moveDown={lastShape && last ? undefined : () => sendCommand(reorderShapeCommand({ layerName: layer.name, index: i, direction: 'down' }))}
                            mergeDown={lastShape ? undefined : () => sendCommand(mergeShapeDownCommand({layerName: layer.name, index: i}))}
                            duplicate={() => sendCommand(duplicateShapeCommand({ layerName: layer.name, index: i }))}
                            delete={() => {
                                onHover();
                                sendCommand(deleteShapeCommand({ layerName: layer.name, index: i }));
                            }}
                            alter={(opts) => {
                                sendCommand(replaceShapeCommand({
                                    layerName: layer.name,
                                    index: i,
                                    shape: {
                                        ...shape,
                                        mask: opts.mask ?? shape.mask,
                                        shape: shape.shape.copy(opts)
                                    }
                                }))
                            }}
                        />
                    );
                })}
            </div>
        </div>
    )
}

const LayerTree = ({layers, activeLayer, sendCommand, onHover, onSelect}: {
    layers: Layer[]
    activeLayer?: string
    sendCommand(command: Command): void
    onHover(layer?: Layer, shape?: PositionedShape): void
    onSelect(layer?: Layer): void
}) => {
    const [expandedLayers, setExpandedLayers] = useState<string[]>([]);
    const expandLayer = (name: string) => {
        setExpandedLayers(prev => prev.filter(l => l !== name).concat([name]));
    }
    const collapseLayer = (name: string) => {
        setExpandedLayers(prev => prev.filter(l => l !== name));
    }
    return (
        <Fragment>
            <GlobalActions
                newLayer={() => sendCommand(addLayerCommand({}))}
            />
            {layers.map((layer, i) => (
                <LayerSection
                    layer={layer}
                    key={i}
                    first={i === 0}
                    last={i >= layers.length - 1}
                    expanded={expandedLayers.includes(layer.name)}
                    setExpanded={expanded => expanded ? expandLayer(layer.name) : collapseLayer(layer.name)}
                    active={activeLayer !== undefined && layer.name === activeLayer}
                    onHover={onHover}
                    onSelect={onSelect}
                    sendCommand={sendCommand}
                />
            ))}
        </Fragment>
    );
}

export default LayerTree;
