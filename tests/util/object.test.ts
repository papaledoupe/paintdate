import {dropKeys} from "../../src/util/object";

describe('object utils', () => {

    describe('dropKeys', () => {

        type FullObject = { a: number, b: string, c: boolean }

        it('drops specified keys', () => {
            const obj: FullObject = { a: 1, b: 'str', c: true };
            const result = dropKeys(obj, 'a', 'b');
            expect((result as any)['a']).toBeUndefined();
            expect((result as any)['b']).toBeUndefined();
            expect(result.c).toBe(true);
        });

    });

});