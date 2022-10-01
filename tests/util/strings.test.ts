import {kebabCased} from "../../src/util/string";

describe('string utils', () => {

   describe('kebabCased', () => {

       it('converts string to kebab case', () => {
           expect(kebabCased("")).toEqual("");
           expect(kebabCased("foo")).toEqual("foo");
           expect(kebabCased("fooBar")).toEqual("foo-bar");
           expect(kebabCased("FooBar")).toEqual("foo-bar");
       });

   });

});