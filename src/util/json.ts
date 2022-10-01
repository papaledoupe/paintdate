/* eslint @typescript-eslint/no-explicit-any: "off", @typescript-eslint/ban-types: "off", no-spaced-func: "off" */

export function toJSON(value: any, options: { pretty?: boolean, indent?: number } = {}): string {
    const { pretty = false, indent = 4 } = options;
    return JSON.stringify(value, jsonReplacer, pretty ? indent : undefined);
}

export function fromJSON<T>(str: string): T {
    return JSON.parse(str, jsonReviver);
}

// decorator factory for class
export function jsonWrite<T>(fn: (value: T) => any) {
    return (constructor: Function) => {
        const className = constructor.name;
        if (classesToWriteFuncs.has(className)) {
            throw new Error(`jsonWrite class name collision on ${className}`);
        }
        classesToWriteFuncs.set(className, fn);
    }
}
const classesToWriteFuncs = new Map<string, (value: any) => any>();

// decorator for property
export function jsonOmit(target: Object, propertyKey: string) {
    const className = target.constructor.name;
    if (!classToOmittedProps.has(className)) {
        classToOmittedProps.set(className, new Set());
    }
    classToOmittedProps.get(className)?.add(propertyKey);
}
const classToOmittedProps = new Map<string, Set<string>>();

const classesToReviveFuncs = new Map<string, (jsonData: any) => any>();

// decorator factory for class
export function jsonRead(fn: (jsonData: any) => any) {
    return (constructor: Function) => {
        const className = constructor.name;
        if (classesToWriteFuncs.has(className)) {
            throw new Error(`jsonRead class name collision on ${className}`);
        }
        classesToReviveFuncs.set(className, fn);
    }
}

function jsonReplacer(this: any, key: string, value: any): any {
    const className = this.constructor.name;
    if (classToOmittedProps.get(className)?.has(key)) {
        return undefined;
    }
    if (key !== '#data' && value && value.constructor && classesToReviveFuncs.has(value.constructor.name)) {
        const writeFunc = classesToWriteFuncs.get(value.constructor.name);
        return {
            '#type': value.constructor.name,
            '#data': writeFunc ? writeFunc(value) : value,
        }
    }
    return value;
}

function jsonReviver(key: string, value: any): any {
    if (value && typeof value === 'object' && value['#type'] !== undefined) {
        const { '#data': data, '#type': type } = value;
        const reviveFunc = classesToReviveFuncs.get(type)
        if (!reviveFunc) {
            throw new Error(`no reviver defined for type ${type}`);
        }
        return reviveFunc(data);
    }
    return value;
}
