import {FunctionalComponent, h, VNode} from "preact";
import {Fragment, useState} from "react";
import {ArrowRight} from 'preact-feather';
import style from './style.css';

export type ScreenProps = {
    trail: ScreenId[]
    pushScreen(id: string): void
    popScreen(): void
}

export type Screen = {
    title: string
    render(props: ScreenProps): VNode
    onPush?: () => void
    onPop?: () => void
}

export type ScreenId = Screen & { id: string }

export type Props = {
    start: string
    screens: {[id: string]: Screen}
}

const StackView = (props: Props) => {
    const [stack, setStack] = useState<ScreenId[]>(() => {
        const start = props.screens[props.start];
        if (!start) {
            throw new Error(`no screen defined for start screen "${props.start}"`);
        }
        return [{ ...start, id: props.start }];
    });
    const currentScreen = stack[0];

    const pushScreen = (id: string) => setStack(s => {
        const screen = props.screens[id];
        if (!screen) return s;
        screen.onPush?.();
        return [{ ...screen, id }, ...s];
    });
    const popScreen = () => setStack(s => {
        s[0]?.onPop?.();
        return s.slice(1);
    });

    return currentScreen.render({
        trail: stack,
        pushScreen,
        popScreen,
    });
};
export default StackView;

export const StackScreen: FunctionalComponent<{trail: ScreenId[]}> = ({trail, children}) => (
    <div className={style.screen}>
        <header>
            {[...trail].reverse().map((screen, i) => (
                <Fragment key={i}>
                    {i > 0 && <ArrowRight size={14} style={{margin: '0 5px'}} />}
                    <div className={`${style.title} ${i === trail.length - 1 ? style.current : ''}`}>{screen.title}</div>
                </Fragment>
            ))}
        </header>
        <section className={style.body}>
            {children}
        </section>
    </div>
);
