import {cached} from "../../src/util/cache";

describe('cache', () => {

    it('returns cached value when key does not change', () => {
        let computed = 0;
        const {get} = cached(() => 'constant', () => computed += 1);
        expect(get()).toEqual(1);
        expect(get()).toEqual(1);
    });

    it('computes value when key changes', () => {
        let computed = 0;
        const {get} = cached(() => computed, () => computed += 1);
        expect(get()).toEqual(1);
        expect(get()).toEqual(2);
    });
});
