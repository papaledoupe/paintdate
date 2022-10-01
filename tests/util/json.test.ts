import {fromJSON, jsonOmit, jsonRead, jsonWrite, toJSON} from "../../src/util/json";

describe('json', () => {

    describe('jsonOmit', () => {

        class Thing {
            private foo: string
            @jsonOmit private bar: number
            constructor(foo: string, bar: number) {
                this.foo = foo;
                this.bar = bar;
            }
        }

        it('omits annotated fields from stringification', () => {
            const json = toJSON(new Thing('str', 2));
            expect(json).toEqual('{"foo":"str"}')
        })

    });

    describe('json writing', () => {

        @jsonWrite(({x, y, z}: Coordinate) => `${x},${y},${z}`)
        @jsonRead(data => new Coordinate(data.split(',').map((s: string) => parseInt(s, 10))))
        class Coordinate {
            x: number
            y: number
            z: number
            constructor([x, y, z]: [number, number, number]) {
                this.x = x;
                this.y = y;
                this.z = z;
            }
        }

        it('uses custom json reader/writer', () => {
            const json = toJSON(new Coordinate([4, -2, 1]));
            expect(JSON.parse(json)['#data']).toEqual('4,-2,1');
            const read = fromJSON<Coordinate>(json);
            expect(read.x).toEqual(4);
            expect(read.y).toEqual(-2);
            expect(read.z).toEqual(1);
        });
    })

    describe('json reviving', () => {

        @jsonRead(data => new Foo(data.foo, data.number))
        class Foo {
            foo: string
            @jsonOmit
            ignore: number

            constructor(foo: string, ignore: number) {
                this.foo = foo;
                this.ignore = ignore;
            }
        }

        @jsonRead((data) => new Revivable(data.foo, data.bar))
        class Revivable {
            foo: Foo
            bar: number

            constructor(foo: Foo, bar: number) {
                this.foo = foo;
                this.bar = bar;
            }
        }

        it('allows class to be serialized and deserialized', () => {
            const revivable = new Revivable(new Foo('str', 234), 123);
            const revived = fromJSON<Revivable>(toJSON(revivable));
            expect(revived.foo.foo).toEqual(revivable.foo.foo);
            expect(revived.foo.ignore).toBeUndefined();
            expect(revived.bar).toEqual(revivable.bar);
        });

    });

});
