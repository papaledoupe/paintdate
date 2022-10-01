
export function cached<T, K>(keyFunction: () => K, compute: () => T): { get(): T } {
    let value: T | null = null;
    let lastKey = '';
    return {
        get(): T {
            const key = JSON.stringify(keyFunction());
            if (value === null || lastKey !== key) {
                value = compute();
                lastKey = key;
            }
            return value;
        }
    }
}
