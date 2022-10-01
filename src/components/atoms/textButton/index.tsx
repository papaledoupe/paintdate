import {h, Ref} from "preact";
import {forwardRef} from "preact/compat";
import Button, {ButtonProps} from "../button";
import {dropKeys} from "../../../util/object";
import style from './style.css';

const smallSize = 11;
const largeSize = 14;

export type Props = {
    text: string
    textSize?: number | 'small' | 'large'
} & ButtonProps;

const TextButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
    const {
        text,
        textSize = 'small',
    } = props;
    const buttonProps: ButtonProps = dropKeys(props, 'text', 'textSize');
    let size: number;
    if (textSize === 'small') {
        size = smallSize;
    } else if (textSize === 'large') {
        size = largeSize;
    } else {
        size = textSize;
    }
    return (
        <Button ref={ref} {...buttonProps}>
            <span className={style.text} style={{fontSize: `${size}px`}}>{text}</span>
        </Button>
    );
});
export default TextButton;
