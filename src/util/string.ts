export function kebabCased(str: string): string {
    return Array.from(str)
        .map((letter, i) =>
            letter.toUpperCase() === letter
                ? `${i !== 0 ? '-' : ''}${letter.toLowerCase()}`
                : letter)
        .join('');
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
