import {ForwardFn, useLayoutEffect} from "preact/compat"
import {kebabCased} from "../util/string";
import {FunctionalComponent, h, RenderableProps} from "preact";
import {assertIsNever} from "../util/types";

export type Theme = {
    name: string
    primary: string
    secondary: string
    highlight: string
    shadow: string
    screenWhite: string
    screenBlack: string
}
const themeBase = {
    shadow: 'rgba(0, 0, 0, 0.4)',
    screenWhite: '#b1aea8',
    screenBlack: '#322f27',
}

export const themes: {[name: string]: Theme} = {
    playdate: {
        ...themeBase,
        name: 'Playdate',
        primary: '#322f27',
        secondary: '#ffb738',
        highlight: '#fff',
    },
    playdateLight: {
        ...themeBase,
        name: 'Playdate light',
        primary: '#322f27',
        secondary: '#fff',
        highlight: '#ffb738',
    },
    playdateDark: {
        ...themeBase,
        name: 'Playdate dark',
        primary: '#322f27',
        secondary: '#b1aea8',
        highlight: '#ffb738',
    }
}

let globalTheme: Theme | undefined;

// sets the fields of Theme as css variables applied to the whole document's style (so only needs calling once)
export function useTheme(theme: Theme): void {
    useLayoutEffect(() => {
        globalTheme = theme;
        applyTheme(theme, document.documentElement);
    }, [theme]);
}

// wrap a component that forwards any HTMLElement ref to override the top level theme in that element
export function withScheme<P, R extends HTMLElement>(scheme: ColorScheme, Component: ForwardFn<P, R>): FunctionalComponent<P> {
    return function WithScheme(props: RenderableProps<P>) {
        const ref = (el: HTMLElement | null) => {
            if (globalTheme === undefined || el === null) {
                return;
            }
            applyTheme(applyScheme(globalTheme, scheme), el);
        };
        // @ts-ignore
        return <Component {...props} ref={ref} />;
    };
}

function applyTheme(theme: Theme, element: HTMLElement) {
    for (const [key, value] of Object.entries(theme)) {
        element.style.setProperty(`--theme-${kebabCased(key)}`, value);
    }
}

export type ColorScheme = 'primary-on-secondary' | 'secondary-on-primary';

function applyScheme(theme: Theme, scheme: ColorScheme): Theme {
    const overrides: Partial<Theme> = {};
    if (scheme === 'primary-on-secondary') {
        // this is the default scheme, no changes.
    } else if (scheme === 'secondary-on-primary') {
        overrides.primary = theme.secondary;
        overrides.secondary = theme.primary;
    } else {
        assertIsNever(scheme);
    }
    return {
        ...theme,
        ...overrides,
    }
}
