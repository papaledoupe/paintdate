import {ComputedValueSet} from "../../src/util/set";

type SetValue = {
    field: number
}

describe('ComputedValueSet', () => {

    it('acts as a Set using default conversion function for uniqueness', () => {
        testCase(new ComputedValueSet<SetValue>());
    });

    it('acts as a Set using provided conversion function for uniqueness', () => {
        testCase(new ComputedValueSet<SetValue>({keyFunc: value => value.field}));
    });

    it('applies value func', () => {
        const set = new ComputedValueSet<SetValue>({
            keyFunc: () => 1,
            valueFunc: (value, prev) => ({ field: value.field + (prev?.field ?? 0) }),
        })
        set.add({ field: 1 });
        set.add({ field: 2 });
        expect(set.values()).toContainEqual({ field: 3 });
    });

    function testCase(s: ComputedValueSet<SetValue>) {
        expect(s.size).toBe(0);

        s.add({ field: 1 });
        expect(s.size).toBe(1);
        expect(s.has({ field: 1 })).toBe(true);
        expect(s.has({ field: 2 })).toBe(false);

        s.add({ field: 1 });
        expect(s.size).toBe(1);

        s.add({ field: 2 });
        expect(s.size).toBe(2);
        expect(s.has({ field: 1 })).toBe(true);
        expect(s.has({ field: 2 })).toBe(true);

        expect(s.values()).toContainEqual({field: 1});
        expect(s.values()).toContainEqual({field: 2});

        expect(s.delete({ field: 3 })).toBe(false);
        expect(s.delete({ field: 1 })).toBe(true);
        expect(s.size).toBe(1);

        s.clear();
        expect(s.size).toBe(0);
    }
})
