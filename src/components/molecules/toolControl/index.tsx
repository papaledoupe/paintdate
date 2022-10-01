import {FunctionalComponent, h} from 'preact';
import style from "./style.css";
import {Tool, ToolIcon, Variant} from "../../../model/tool";
import {useCallback} from "react";
import {
    CheckboxConfigItem,
    ColorConfigItem,
    FillConfigItem,
    NumberConfigItem,
    OptionalFillConfigItem,
    OptionalStrokeConfigItem,
    StrokeConfigItem
} from "../configItem";
import {Move as MoveIcon} from "preact-feather/dist/icons/move";
import {Edit2 as PencilIcon} from "preact-feather/dist/icons/edit-2";
import {Square as SquareIcon} from "preact-feather/dist/icons/square";
import {XSquare as XSquareIcon} from "preact-feather/dist/icons/x-square";
import {Box as BoxIcon} from "preact-feather/dist/icons/box";
import {FeatherProps} from "preact-feather/dist/types";
import {assertIsNever} from "../../../util/types";
import TextButton from "../../atoms/textButton";
import {withScheme} from "../../theme";

const ToolControl = ({tool, currentTool, onSelect}: {
    tool: Tool
    currentTool: Tool
    onSelect<V extends Variant>(tool: Tool<V>, variant: V): void
}) => {
    const toolActive = tool === currentTool;
    const Icon = getToolIconComponent(tool.icon);
    const selectTool = useCallback(() => onSelect(tool, tool.variant), [onSelect, tool]);
    const showVariants = toolActive && (tool.variants.length > 1 || tool.variants.filter(hasConfig).length > 0);
    return (
        <div
            onClick={selectTool}
            className={`${style.tool} ${toolActive ? style.active : ''}`}
        >
            <div className={style.toolHead}>
                <Icon size={18} />
                <span>{tool.name}</span>
            </div>
            {showVariants && <Variants
                tool={tool}
                currentTool={currentTool}
                onSelect={onSelect}
            />}
        </div>
    );
}
export default ToolControl;

const VariantButton = withScheme('secondary-on-primary', TextButton);

export function Variants<V extends Variant>({tool, currentTool, onSelect}: {
    tool: Tool<V>
    currentTool: Tool<V>
    onSelect<V extends Variant>(tool: Tool<V>, variant: V): void
}) {
    const showButton = tool.variants.length > 1;
    return (
        <div className={style.variants}>
            {tool.variants.map((variant: Variant, i: number) => {
                const variantActive = variant === currentTool.variant;
                return (
                    <div key={i} className={style.variant}>
                        {showButton && <VariantButton
                            type='border'
                            text={variant.name}
                            onClick={() => onSelect(tool, variant)}
                            active={variantActive}
                            style={{
                                margin: '5px',
                                width: 'calc(100% - 10px)',
                            }}
                        />}
                        {(variantActive || !showButton) && hasConfig(variant) && <VariantConfig variant={variant} />}
                    </div>
                )
            })}
        </div>
    )
}

export const VariantConfig = ({variant}: {variant: Variant}) => (
    <div className={style.variantConfig}>
        {variant.configs?.map(configItem => {
            switch (configItem.kind) {
                case 'color':
                    return <ColorConfigItem
                        read={() => configItem.read()}
                        write={opt => configItem.write(opt)}
                    />
                case 'mask':
                    return <CheckboxConfigItem
                        label='Mask'
                        read={() => configItem.read()}
                        write={checked => configItem.write(checked)}
                    />
                case 'blendMode':
                    return <CheckboxConfigItem
                        label='Invert'
                        read={() => configItem.read() === 'invert'}
                        write={checked => configItem.write(checked ? 'invert' : 'normal')}
                    />
                case 'width':
                    return <NumberConfigItem
                        label='Width'
                        read={() => configItem.read()}
                        write={n => configItem.write(n)}
                        step={1}
                        min={1}
                        max={999}
                    />
                case 'fill':
                    return <FillConfigItem
                        read={() => configItem.read()}
                        write={fill => configItem.write(fill)}
                    />
                case 'optionalFill':
                    return <OptionalFillConfigItem
                        read={() => configItem.read()}
                        write={fill => configItem.write(fill)}
                    />
                case 'stroke':
                    return <StrokeConfigItem
                        read={() => configItem.read()}
                        write={stroke => configItem.write(stroke)}
                    />
                case 'optionalStroke':
                    return <OptionalStrokeConfigItem
                        read={() => configItem.read()}
                        write={stroke => configItem.write(stroke)}
                    />
            }
        })}
    </div>
);

export function getToolIconComponent(toolIcon: ToolIcon): FunctionalComponent<FeatherProps> {
    if (toolIcon === 'move') {
        return MoveIcon;
    } else if (toolIcon === 'pencil') {
        return PencilIcon;
    } else if (toolIcon === 'square') {
        return SquareIcon;
    } else if (toolIcon === 'x-square') {
        return XSquareIcon;
    } else if (toolIcon === 'box') {
        return BoxIcon;
    }
    assertIsNever(toolIcon);
}

function hasConfig<V extends Variant>(variant: V) {
    return (variant.configs?.length ?? 0) > 0;
}
