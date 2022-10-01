
// https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
export function modulo(n: number, m: number): number {
    return ((n % m) + m) % m;
}
