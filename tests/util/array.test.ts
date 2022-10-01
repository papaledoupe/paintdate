import {chunkArray} from "../../src/util/array";

describe('array utils', () => {

   describe('chunkArray', () => {

       it('converts array to chunks of requested size', () => {
           expect(chunkArray([1, 2, 3, 4, 5], 1)).toEqual([[1], [2], [3], [4], [5]]);
           expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
           expect(chunkArray([1, 2, 3, 4, 5], 6)).toEqual([[1, 2, 3, 4, 5]]);
           expect(chunkArray([1], 2)).toEqual([[1]]);
           expect(chunkArray([], 2)).toEqual([]);
       });

       it('raises error when using invalid size', () => {
           expect(() => chunkArray([], -1)).toThrow();
       });

       it('ignores non-integer part of size', () => {
           // note, .6 ignored rather than rounding up to 3.
           expect(chunkArray([1, 2, 3, 4, 5], 2.6)).toEqual([[1, 2], [3, 4, 5]]);
       });

   });

});