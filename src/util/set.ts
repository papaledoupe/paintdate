export type KeyType = string | number;

export type KeyFunc<T> = (value: T) => KeyType;
export type ValueFunc<T> = (value: T, prev: T | null) => T | null;

export class ComputedValueSet<T> {
    protected keyFunc: KeyFunc<T>
    protected valueFunc: ValueFunc<T>
    private readonly map = new Map<KeyType, T>();

    constructor({keyFunc, valueFunc}: {keyFunc?: KeyFunc<T>, valueFunc?: ValueFunc<T>} = {}) {
        this.keyFunc = keyFunc || (v => JSON.stringify(v));
        this.valueFunc = valueFunc || (v => v);
    }

    get size(): number {
        return this.map.size;
    }

    values(): T[] {
        return Array.from(this.map.values());
    }

    add(value: T): this {
        const computedKey = this.keyFunc(value);
        const computedValue = this.valueFunc(value, this.map.get(computedKey) || null);
        if (computedValue === null) {
            this.map.delete(computedKey);
        } else {
            this.map.set(computedKey, computedValue);
        }
        return this;
    }

    delete(value: T): boolean {
        return this.map.delete(this.keyFunc(value));
    }

    has(value: T): boolean {
        return this.map.has(this.keyFunc(value));
    }

    clear(): void {
        this.map.clear();
    }
}
