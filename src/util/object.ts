
export function dropKeys<T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
    const newObject = {...obj};
    keys.forEach(k => delete newObject[k]);
    return newObject;
}
