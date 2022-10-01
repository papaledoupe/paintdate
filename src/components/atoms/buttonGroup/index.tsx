import {h, Ref, RenderableProps} from 'preact';
import style from './style.css';
import {forwardRef} from "preact/compat";
import {withScheme} from "../../theme";

export type Props = RenderableProps<{label?: string}>;

const ButtonGroup = forwardRef(({label, children}: Props, ref: Ref<HTMLDivElement>) => (
    <div ref={ref} className={style.group}>
        {label && <span className={style.label}>{label}</span>}
        {children}
    </div>
))
export default ButtonGroup;

export const InvertButtonGroup = withScheme('secondary-on-primary', ButtonGroup);
