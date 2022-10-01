import {h, RenderableProps, VNode} from "preact";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import {noBubble} from "../../../util/dom/events";
import style from './style.css';
import {forwardRef, Ref} from "preact/compat";
import {withScheme} from "../../theme";

export type ButtonProps = {
    toolTip?: string | VNode
    onClick?: () => void
    type?: 'solid' | 'border'
    style?: object
    active?: boolean
}

const Button = forwardRef((props: RenderableProps<ButtonProps>, ref: Ref<HTMLButtonElement>) => {
    const {
        onClick,
        toolTip,
        children,
        type = 'solid',
        style: buttonStyle = {},
        active = false,
    } = props;
    const disabled = onClick === undefined;

    const button = (
        <button
            ref={ref}
            className={`${style.button} ${active ? style.active : ''} ${disabled ? style.disabled : ''} ${type === 'border' ? style.border : style.solid}`}
            disabled={disabled}
            onClick={noBubble(() => onClick?.())}
            style={{...buttonStyle}}
        >
            {children}
        </button>
    );
    if (toolTip === undefined) {
        return button;
    }
    return (
        <Tippy
            className={style.tippy}
            content={toolTip}
            duration={[200, 200]}
            delay={[400, 0]}
        >
            {button}
        </Tippy>
    )
});
export default Button;

export const InvertButton = withScheme('secondary-on-primary', Button);
