import {FunctionalComponent, h} from "preact";
import {FeatherProps} from "preact-feather/dist/types";
import {forwardRef, Ref} from "preact/compat";
import Button, {ButtonProps} from "../button";
import {dropKeys} from "../../../util/object";

const smallSize = 14;
const largeSize = 18;

export type Props = {
    label?: string
    icon: FunctionalComponent<FeatherProps>
    iconSize?: number | 'small' | 'large'
} & ButtonProps;

const IconButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
    const {label, icon: Icon, iconSize = 'small'} = props;
    const buttonProps: ButtonProps = dropKeys(props, 'label', 'icon', 'iconSize');
    let size: number;
    if (iconSize === 'small') {
        size = smallSize;
    } else if (iconSize === 'large') {
        size = largeSize;
    } else {
        size = iconSize;
    }
    return (
        <Button ref={ref} {...buttonProps}
        >
            <Icon size={size} />
            {label !== undefined && <span>{label}</span>}
        </Button>
    );
});
export default IconButton;
