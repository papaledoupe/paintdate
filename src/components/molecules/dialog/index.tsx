import {FunctionalComponent, h} from 'preact';
import style from './style.css';
import {createPortal, useEffect} from "react";
import {shortcutsSingleton, Shortcuts} from "../../../model/input";
import {keys} from '../../../config/editor';

export type CloseType = 'click-out' | 'shortcut';

export type Props = {
    shortcuts?: Shortcuts
    closeOn?: CloseType[]
    close?: (confirmed: boolean) => void
}

const Dialog: FunctionalComponent<Props> = (props) => {
    const {
        closeOn = [],
        close = () => { /* no-op default */},
        shortcuts = shortcutsSingleton,
    } = props;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const element = document.getElementById('modals')!;
    useEffect(() => {
        if (closeOn.includes('shortcut')) {
            const closeHandle = shortcuts.register(keys.close.keystrokes, () => {
                close(false);
                return [];
            });
            const confirmHandle = shortcuts.register(keys.confirm.keystrokes, () => {
                close(true);
                return [];
            });
            return () => {
                closeHandle.cancel();
                confirmHandle.cancel();
            }
        }
    }, [shortcuts]);
    return createPortal((
        <div onClick={() => closeOn.includes('click-out') && close(false)} className={style.overlay}>
            <div onClick={e => e.stopPropagation()} className={style.dialog}>
                {props.children}
            </div>
        </div>
    ), element);
};
export default Dialog;
