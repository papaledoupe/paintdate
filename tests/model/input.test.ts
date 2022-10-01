import {
    Action,
    DOMShortcuts,
    MemoryShortcuts,
    RegistrationHandle,
    Shortcuts,
    validateKeysConfig
} from "../../src/model/input";
import {addLayerCommand} from "../../src/model/canvas";
import {Command} from "../../src/model/history";

describe('input', () => {

    describe('DOMShortcuts', () => {

        let triggerKeyDown: ((e: KeyboardEvent) => void);
        let triggerKeyUp: ((e: KeyboardEvent) => void);
        let triggerKeyPress: ((e: KeyboardEvent) => void);
        let shortcuts: Shortcuts
        let document: Document

        beforeEach(() => {
            const docElement = {
                addEventListener(type: string, listener: (ev: KeyboardEvent) => any) {
                    if (type === 'keyup') {
                        triggerKeyUp = e => {
                            listener({ ...e, type, target: docElement });
                        }
                    } else if (type === 'keydown') {
                        triggerKeyDown = e => {
                            listener({ ...e, type, target: docElement });
                        }
                    } else if (type === 'keypress') {
                        triggerKeyPress = e => {
                            listener({ ...e, type, target: docElement });
                        }
                    } else {
                        throw new Error('unsupported mock event ' + type);
                    }
                },
                removeEventListener(type: string) {
                    if (type === 'keyup') {
                        triggerKeyUp = () => {};
                    } else if (type === 'keydown') {
                        triggerKeyDown = () => {};
                    } else {
                        throw new Error('unsupported mock event');
                    }
                },
                className: '',
            } as unknown as HTMLElement;
            document = { documentElement: docElement } as Document;
            shortcuts = new DOMShortcuts();
        });

        it('notifies registered listener of simple shortcut start when used', () => {
            shortcuts.connect({document});

            const xCallback = jest.fn();
            shortcuts.register('x', xCallback);

            triggerKeyDown({ keyCode: 88 /* x */ } as KeyboardEvent);
            expect(xCallback).toHaveBeenCalledTimes(1);
            expect(xCallback).toHaveBeenCalledWith('x')
        });

        it('notifies registered listener of simple shortcut stop', () => {
            shortcuts.connect({document});

            const xCallback = jest.fn();
            shortcuts.register('x', xCallback, 'keyup');

            triggerKeyDown({ keyCode: 88 /* x */ } as KeyboardEvent);
            expect(xCallback).toHaveBeenCalledTimes(0);

            triggerKeyUp({ keyCode: 88 /* x */ } as KeyboardEvent);
            expect(xCallback).toHaveBeenCalledTimes(1);
            expect(xCallback).toHaveBeenCalledWith('x');
        });

        it('notifies registered listener of modifier shortcut when used', () => {
            shortcuts.connect({document});

            const callback = jest.fn();
            shortcuts.register('shift+x', callback);

            triggerKeyDown({ keyCode: 88 /* x */, shiftKey: true } as KeyboardEvent);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('shift+x');
        });

        it('does not fire events for callbacks registered before connect', () => {
            const xCallback = jest.fn();
            shortcuts.register('x', xCallback);

            shortcuts.connect({document});

            triggerKeyDown({ keyCode: 88 /* x */ } as KeyboardEvent);
            expect(xCallback).toHaveBeenCalledTimes(0);
        });

        it('fires no events after disconnect', () => {
            shortcuts.connect({document});

            const xCallback = jest.fn();
            shortcuts.register('x', xCallback);

            triggerKeyDown({ keyCode: 88 /* x */ } as KeyboardEvent);
            expect(xCallback).toHaveBeenCalledTimes(1);

            triggerKeyUp({ keyCode: 88 /* x */ } as KeyboardEvent);
            triggerKeyDown({ keyCode: 88 /* x */ } as KeyboardEvent);
            expect(xCallback).toHaveBeenCalledTimes(2);

            shortcuts.disconnect({document});
            triggerKeyUp({ keyCode: 88 /* x */ } as KeyboardEvent);
            triggerKeyDown({ keyCode: 88 /* x */ } as KeyboardEvent);
            expect(xCallback).toHaveBeenCalledTimes(2);
        });

        it('sends commands from callbacks to the connected command sink', () => {
            const commandSink = jest.fn();
            shortcuts.connect({document, commandSink});
            shortcuts.register('x', () => [addLayerCommand({})]);

            triggerKeyDown({ keyCode: 88 /* x */ } as KeyboardEvent);

            expect(commandSink).toHaveBeenCalledTimes(1);
            expect(commandSink.mock.calls[0][0].type).toBe('addLayer');
        });
    });

    describe('validateKeysConfig', () => {

        it('passes validation if all keystrokes unique', () => {
            validateKeysConfig(/*@ts-ignore*/{
                actionA: {
                    description: "A",
                    keystrokes: ["a"],
                },
                actionB: {
                    description: "B",
                    keystrokes: ["b"],
                },
            });
        });

        it('fails validation if keystroke not unique', () => {
            expect(() => validateKeysConfig({
                    actionA: {
                        description: "A",
                        keystrokes: ["a"],
                    },
                    actionB: {
                        description: "B",
                        keystrokes: ["a"],
                    },
            })).toThrow('action "actionB" defines keystroke "a", but this is already assigned to action "actionA"');
        });

        it('fails validation if single action has non unique keystroke', () => {
            expect(() => validateKeysConfig({
                actionA: {
                    description: "A",
                    keystrokes: ["a", "a"],
                },
            })).toThrow('action "actionA" defines keystroke "a", but this is already assigned to action "actionA"');
        });

    });

    describe('MemoryShortcuts', () => {

        class StubCallback {
            calls = 0;
            private handle: RegistrationHandle | null = null;

            run(): Command[] {
                this.calls++;
                return [];
            }

            register(shortcut: string, shortcuts: Shortcuts, action: Action = 'keydown') {
                this.handle = shortcuts.register(shortcut, s => this.run(), action);
            }

            cancel() {
                this.handle?.cancel();
            }
        }

        let cbA: StubCallback, cbB1: StubCallback, cbB2: StubCallback, cbC: StubCallback;
        let shortcuts: MemoryShortcuts

        beforeEach(() => {
            cbA = new StubCallback();
            cbB1 = new StubCallback();
            cbB2 = new StubCallback();
            cbC = new StubCallback();
            shortcuts = new MemoryShortcuts();
            cbA.register('A', shortcuts);
            cbB1.register('B', shortcuts);
            cbB2.register('B', shortcuts);
            cbC.register('C', shortcuts, 'keyup');
        });

        it('triggers registered callback for keydown', () => {
            shortcuts.trigger('A', 'keydown');
            expect(cbA.calls).toEqual(1);
            expect(cbB1.calls).toEqual(0);
            expect(cbB2.calls).toEqual(0);
            expect(cbC.calls).toEqual(0);
        });

        it('triggers registered callback for keyup', () => {
            shortcuts.trigger('C', 'keyup');
            expect(cbA.calls).toEqual(0);
            expect(cbB1.calls).toEqual(0);
            expect(cbB2.calls).toEqual(0);
            expect(cbC.calls).toEqual(1);
        });

        it('does not trigger callback not matching action', () => {
            shortcuts.trigger('A', 'keyup');
            expect(cbA.calls).toEqual(0);
            expect(cbB1.calls).toEqual(0);
            expect(cbB2.calls).toEqual(0);
            expect(cbC.calls).toEqual(0);
        });

        it('triggers all registered callbacks', () => {
            shortcuts.trigger('B', 'keydown');
            expect(cbA.calls).toEqual(0);
            expect(cbB1.calls).toEqual(1);
            expect(cbB2.calls).toEqual(1);
            expect(cbC.calls).toEqual(0);
        });

        it('does not trigger unregistered callbacks', () => {
            cbB1.cancel();
            shortcuts.trigger('B', 'keydown');
            expect(cbA.calls).toEqual(0);
            expect(cbB1.calls).toEqual(0);
            expect(cbB2.calls).toEqual(1);
            expect(cbC.calls).toEqual(0);
        });

    });
});
