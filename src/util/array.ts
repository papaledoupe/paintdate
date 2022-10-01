
export function chunkArray<T>(array: T[], size: number): T[][] {
    if (size < 1) {
        throw new Error('size must be a natural number');
    }
    const chunked: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
}
