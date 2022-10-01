
export function noBubble<T extends Event>(handler: (event: T) => void): (event: T) => void {
    return (event) => {
        event.preventDefault();
        event.stopPropagation();
        return handler(event);
    }
}
