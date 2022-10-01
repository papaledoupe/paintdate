import {Bounds, Vector2} from "./space";
import {Command} from "./history";
import {Layer, VirtualShapes} from "./canvas";
import {BlendMode, Color} from "./pixel";
import {Fill as FillModel} from "./fill";
import {Stroke} from "./stroke";

export type Variant = {
    readonly name: string
    configs?: ConfigItem[]
}

export type ToolIcon = 'move' | 'pencil' | 'square' | 'x-square' | 'box';

export type CursorMode = {
    icon?: ToolIcon
    iconColor?: Color
    highlight?: 'pixel' | 'shape' | 'layer' | Bounds
}

export interface Tool<V extends Variant = Variant> {
    readonly name: string
    readonly icon: ToolIcon
    readonly variants: V[]

    get selectionShortcuts(): string[]

    get variant(): V
    set variant(v: V)
    // relative to the origin of the active Layer
    get virtualShapes(): VirtualShapes
    get cursorMode(): CursorMode

    set active(active: boolean)

    onStart?(pos: Vector2, activeLayer: Layer | null): void
    onMove?(pos: Vector2, activeLayer: Layer | null): void
    onFinish?(pos: Vector2, activeLayer: Layer | null): Command[]
}

export function nextVariant<V extends Variant>(tool: Tool<V>): V {
    const currentIndex = tool.variants.indexOf(tool.variant);
    return tool.variants[(currentIndex + 1) % tool.variants.length];
}

type ConfigItemType<V> = {
    kind: string
    read(): V
    write(value: V): void
}
type ConfigItemVars<T extends ConfigItemType<unknown>> = Omit<T, 'kind'>;

export type ColorConfigItem = ConfigItemType<Color> & { kind: 'color' }
export function colorConfigItem(config: ConfigItemVars<ColorConfigItem>): ColorConfigItem {
    return { ...config, kind: 'color' };
}

export type BlendModeConfigItem = ConfigItemType<BlendMode> & { kind: 'blendMode' }
export function blendModeConfigItem(config: ConfigItemVars<BlendModeConfigItem>): BlendModeConfigItem {
    return { ...config, kind: 'blendMode' };
}

export type MaskConfigItem = ConfigItemType<boolean> & { kind: 'mask' }
export function maskConfigItem(config: ConfigItemVars<MaskConfigItem>): MaskConfigItem {
    return { ...config, kind: 'mask' };
}

export type WidthConfigItem = ConfigItemType<number> & { kind: 'width' }
export function widthConfigItem(config: ConfigItemVars<WidthConfigItem>): WidthConfigItem {
    return { ...config, kind: 'width' };
}

export type FillConfigItem = ConfigItemType<FillModel> & { kind: 'fill' }
export function fillConfigItem(config: ConfigItemVars<FillConfigItem>): FillConfigItem {
    return { ...config, kind: 'fill' }
}

export type OptionalFillConfigItem = ConfigItemType<FillModel | null> & { kind: 'optionalFill' }
export function optionalFillConfigItem(config: ConfigItemVars<OptionalFillConfigItem>): OptionalFillConfigItem {
    return { ...config, kind: 'optionalFill' }
}

export type StrokeConfigItem = ConfigItemType<Stroke> & { kind: 'stroke' }
export function strokeConfigItem(config: ConfigItemVars<StrokeConfigItem>): StrokeConfigItem {
    return { ...config, kind: 'stroke' }
}

export type OptionalStrokeConfigItem = ConfigItemType<Stroke | null> & { kind: 'optionalStroke' }
export function optionalStrokeConfigItem(config: ConfigItemVars<OptionalStrokeConfigItem>): OptionalStrokeConfigItem {
    return { ...config, kind: 'optionalStroke' }
}

export type ConfigItem
    = ColorConfigItem
    | BlendModeConfigItem
    | MaskConfigItem
    | WidthConfigItem
    | FillConfigItem
    | OptionalFillConfigItem
    | StrokeConfigItem
    | OptionalStrokeConfigItem
