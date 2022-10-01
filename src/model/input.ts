import {Command} from "./history";
import Mousetrap, {MousetrapInstance} from "mousetrap";
import {keys, Keystrokes} from '../config/editor';

export type RegistrationHandle = {
    cancel(): void
}

type Connectors = {
    document: Document
    commandSink?: (cmd: Command) => void
};

export type Action = 'keyup' | 'keydown' | 'keypress'

// mousetrap doesn't work as documented as default implementation has changed
// https://craig.is/killing/mice#api.stopCallback
Mousetrap.prototype.stopCallback = function(event: Event, element: HTMLElement): boolean {
    return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || ('contentEditable' in element && element.contentEditable == 'true');
}

export interface Shortcuts {
    get connected(): boolean
    connect({document, commandSink}: Connectors): void
    disconnect({document, commandSink}: Connectors): void
    register(shortcut: string | string[], callback: (shortcut: string) => Command[], action?: Action): RegistrationHandle
}

export class DOMShortcuts implements Shortcuts {
    private mousetrap: MousetrapInstance | null = null;
    private commandSink: (command: Command) => void = () => { /* no-op default */ };

    connect({document, commandSink}: Connectors) {
        this.disconnect({document, commandSink});
        if (commandSink !== undefined) {
            this.commandSink = commandSink;
        }
        this.mousetrap = new Mousetrap(document.documentElement);
    }

    get connected(): boolean {
        return this.mousetrap !== null;
    }

    disconnect({}: Connectors) {
        this.mousetrap?.reset();
        this.mousetrap = null;
    }

    register(shortcut: string | string[], callback: (shortcut: string) => Command[], action?: Action): RegistrationHandle {
        if (this.mousetrap === null) {
            return {
                cancel() { /* no-op default */ }
            };
        }
        this.mousetrap.bind(shortcut, (e, s) => {
            (callback(s) || []).forEach(command => this.commandSink(command));
            return false; // prevents default
        }, action ?? 'keydown');
        return {
            cancel: () => this.mousetrap?.unbind(shortcut)
        }
    }
}

export const shortcutsSingleton = new DOMShortcuts();

type ActionCallback = {
    action: Action
    callback(shortcut: string): Command[]
}
export class MemoryShortcuts implements Shortcuts {

    readonly connected = true;
    private commandSink: Connectors['commandSink'] | null = null;
    private shortcuts = new Map<string, ActionCallback[]>();

    connect({commandSink}: Connectors) {
        this.commandSink = commandSink;
    }

    disconnect() {
        this.commandSink = null;
    }

    trigger(shortcut: string, action: Action) {
        (this.shortcuts.get(shortcut) ?? []).forEach(({action: a, callback}) => {
            if (a === action) callback(shortcut);
        })
    }

    register(shortcut: string | string[], callback: (shortcut: string) => Command[], action?: Action): RegistrationHandle {
        const shortcuts: string[] = typeof shortcut === 'string' ? [shortcut] : shortcut;
        shortcuts.forEach(s => {
            if (!this.shortcuts.has(s)) {
                this.shortcuts.set(s, []);
            }
            this.shortcuts.get(s)?.push({ action: action ?? 'keydown', callback });
        });
        return {
            cancel: () => shortcuts.forEach(s => {
                const remaining = this.shortcuts.get(s)?.filter(({callback: cb}) => callback !== cb) ?? [];
                this.shortcuts.set(s, remaining);
            })
        }
    }
}

export function validateKeysConfig(config: {[name: string]: Keystrokes} = keys) {
    const shortcuts = new Map<string, string>();
    for (const [name, mapping] of Object.entries(config)) {
        for (const keystroke of mapping.keystrokes) {
            if (shortcuts.has(keystroke)) {
                throw new Error(`action "${name}" defines keystroke "${keystroke}", but this is already assigned to action "${shortcuts.get(keystroke)}"`)
            }
            shortcuts.set(keystroke, name);
        }
    }
}
validateKeysConfig();
