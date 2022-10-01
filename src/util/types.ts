
// used when a union type should be narrowed to never, and you want a compile-time error when it isn't
export function assertIsNever(value: never): never {
    throw new Error(`expected value to be never, but was ${value}`);
}
