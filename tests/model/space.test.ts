import {Bounds, boundsSize, combineBounds, Grid, inBounds, shrinkBounds, v, Vector2} from "../../src/model/space";
import {fromJSON, toJSON} from "../../src/util/json";

describe('model', () => {

    describe('space', () => {

        describe('Vector2', () => {

            describe('add', () => {

                it('adds together vectors', () => {
                    expect(v(1, 1).add(v(-2, 1))).toEqual(v(-1, 2))
                });

            });

            describe('sub', () => {

                it('subtracts vectors', () => {
                    expect(v(1, 1).sub(v(-2, 1))).toEqual(v(3, 0))
                });

            });

            describe('toString', () => {

                it('returns string representation of vector', () => {
                    expect(v(1, 2).toString()).toEqual('(1, 2)');
                    expect(v(-4, 1.2).toString()).toEqual('(-4, 1.2)');
                })

            });

            describe('eq', () => {

                it('returns true for equivalent vectors', () => {
                    expect(v(1, 2) === v(1, 2)).toBe(false); // as expected in JS
                    expect(v(1, 2).eq(v(1, 2))).toBe(true);
                })

            });

            describe('rasterLine', () => {

                it('creates raster line between two points (simple 45 deg angle)', () => {
                    const line = v(0, 0).rasterLine(v(4, 4));
                    expect(line).toEqual([
                        v(0, 0),
                        v(1, 1),
                        v(2, 2),
                        v(3, 3),
                        v(4, 4),
                    ]);
                });

                it('creates raster line between two points (simple straight line)', () => {
                    const line = v(0, 1).rasterLine(v(4, 1));
                    expect(line).toEqual([
                        v(0, 1),
                        v(1, 1),
                        v(2, 1),
                        v(3, 1),
                        v(4, 1),
                    ]);
                });

                it('creates raster line between two points (isometric line)', () => {
                    const line = v(0, 0).rasterLine(v(5, -2));
                    expect(line).toEqual([
                        v(0, 0),
                        v(1, 0),
                        v(2, -1),
                        v(3, -1),
                        v(4, -2),
                        v(5, -2),
                    ]);
                });

                it('creates raster line between two points (isometric line with odd number of pixels)', () => {
                    // previously when there was an odd number of pixels, the "spare" pixel went at the start not the
                    // end; this was not a good experience in the editor as the line was "jumpy" and made it hard to
                    // draw isometric lines.

                    const line = v(0, 0).rasterLine(v(5, 3).snapTo([v(2, 1)]));
                    expect(line).toEqual([
                        v(0, 0),
                        v(1, 0),
                        v(2, 1),
                        v(3, 1),
                        v(4, 2),
                        v(5, 2),
                        v(6, 3),
                    ]);
                });

            });

            describe('normalized', () => {

                it('returns normalized vector', () => {
                    expect(v(1, 0).normalized()).toEqual(v(1, 0));
                    expect(v(0, 1).normalized()).toEqual(v(0, 1));
                    expect(v(1, 1).normalized()).toEqual(v(1/Math.sqrt(2), 1/Math.sqrt(2)));
                    expect(v(2, 1).normalized()).toEqual(v(2/Math.sqrt(5), 1/Math.sqrt(5)));
                })

            });

            describe('dot', () => {

                it('returns dot product of two vectors', () => {
                    expect(v(1, 0).dot(v(0, 1))).toEqual(0);
                    expect(v(1, 1).dot(v(0, 1))).toEqual(1);
                    expect(v(2, 1).dot(v(1, 3))).toEqual(5);
                });

            });

            describe('scale', () => {

                it('scales vector by scalar', () => {
                    expect(v(1, 2).scale(3)).toEqual(v(3, 6));
                });

            });

            describe('perpendicularDistance', () => {

                it('returns perpendicular distance to point from line', () => {
                    expect(v(1, 0).perpendicularDistance(v(1, 1))).toBeCloseTo(1, 10);
                    expect(v(1, 0).perpendicularDistance(v(0, 10))).toBeCloseTo(10, 10);
                    expect(v(0, 1).perpendicularDistance(v(1, 1))).toBeCloseTo(1, 10);
                    expect(v(1, 1).perpendicularDistance(v(1, 1))).toBeCloseTo(0, 10);
                    expect(v(1, 1).perpendicularDistance(v(1, -1))).toBeCloseTo(Math.sqrt(2), 10);
                    expect(v(-1, 1).perpendicularDistance(v(1, 1))).toBeCloseTo(Math.sqrt(2), 10);
                });

            });

            describe('snapTo', () => {

                it('snaps point to closest of the given lines', () => {
                    const axes = [v(1, 0), v(0, 1)];
                    expect(v(2, 1).snapTo(axes)).toEqual(v(2, 0));
                    expect(v(1, 2).snapTo(axes)).toEqual(v(0, 2));

                    expect(v(-1, 2).snapTo(axes)).toEqual(v(-0, 2));
                    expect(v(-2, 1).snapTo(axes)).toEqual(v(-2, 0));

                    expect(v(-2, -1).snapTo(axes)).toEqual(v(-2, -0));
                    expect(v(-1, -2).snapTo(axes)).toEqual(v(-0, -2));

                    expect(v(1, -2).snapTo(axes)).toEqual(v(0, -2));
                    expect(v(2, -1).snapTo(axes)).toEqual(v(2, -0));
                });

            });

            describe('serialization', () => {
                const vec = v(2, -6);

                it('reversibly serializes', () => {
                    const revived = fromJSON<Vector2>(toJSON(vec));
                    expect(revived.x).toEqual(2);
                    expect(revived.y).toEqual(-6);
                });

                it('serializes to compact (ish) form', () => {
                    expect(toJSON(vec)).toEqual('{"#type":"Vector2","#data":[2,-6]}');
                });

            });

        });

        describe('Grid', () => {

            describe('without looping', () => {

                it('stores and retrieves elements by index' , () => {
                    const g = new Grid<boolean>({size: v(3, 3)});
                    g.put(v(1, 1), true);
                    g.put(v(2, 1), false);

                    expect(g.get(v(1, 0))).toBeNull();
                    expect(g.get(v(1, 1))).toBe(true);
                    expect(g.get(v(2, 1))).toBe(false);
                });

                it('returns previous value when putting value to the grid', () => {
                    const g = new Grid<boolean>({size: v(3, 3)});
                    const {previous} = g.put(v(1, 1), true);

                    expect(previous).toBeNull();
                })

                it('allows removal of elements', () => {
                    const g = new Grid<boolean>({size: v(3, 3)});
                    g.put(v(1, 1), true);
                    const {previous} = g.remove(v(1, 1));

                    expect(g.get(v(1, 1))).toBeNull();
                    expect(previous).toBe(true);
                });

                it('does nothing when out of bounds', () => {
                    const g = new Grid<boolean>({size: v(3, 3)});
                    const {previous} = g.put(v(3, 3), true);

                    expect(previous).toBeNull();
                    expect(g.get(v(3, 3))).toBeNull();
                });

                it('returns default value when provided and absent from grid', () => {
                    const g = new Grid<boolean>({size: v(3, 3)});

                    expect(g.getOrDefault(v(1, 1), false)).toBe(false);
                });

                it('fills and clears the grid', () => {
                    const g = new Grid<boolean>({size: v(2, 2)});
                    g.fill(true);
                    expect(g.get(v(0, 0))).toBe(true);
                    expect(g.get(v(1, 0))).toBe(true);
                    expect(g.get(v(0, 1))).toBe(true);
                    expect(g.get(v(1, 1))).toBe(true);

                    g.clear();
                    expect(g.get(v(0, 0))).toBeNull();
                    expect(g.get(v(1, 0))).toBeNull();
                    expect(g.get(v(0, 1))).toBeNull();
                    expect(g.get(v(1, 1))).toBeNull();
                });

                it('lists all cells', () => {
                    const g = new Grid<boolean>({size: v(2, 2)});
                    g.put(v(1, 0), true);
                    g.put(v(0, 1), false);

                    expect(g.cells.length).toBe(4);
                    expect(g.cells).toContainEqual({ pos: v(0, 0), value: null });
                    expect(g.cells).toContainEqual({ pos: v(1, 0), value: true });
                    expect(g.cells).toContainEqual({ pos: v(0, 1), value: false });
                    expect(g.cells).toContainEqual({ pos: v(1, 1), value: null });
                });

                describe('rows and columns', () => {
                    const g = new Grid<boolean>({size: v(2, 2)});
                    g.put(v(1, 0), true);
                    g.put(v(0, 1), false);

                    /*
                    |     | x=0   | x=1  |
                    |-----|-------|------|
                    | y=0 |       | true |
                    | y=1 | false |      |
                     */

                    it('returns row', () => {
                        expect(g.row(0)).toEqual([
                            { pos: v(0, 0), value: null },
                            { pos: v(1, 0), value: true },
                        ]);
                        expect(g.row(1)).toEqual([
                            { pos: v(0, 1), value: false },
                            { pos: v(1, 1), value: null },
                        ]);
                    });

                    it('returns empty array for out of bounds row', () => {
                        expect(g.row(2)).toEqual([]);
                        expect(g.row(-1)).toEqual([]);
                    });

                    it('returns column', () => {
                        expect(g.column(0)).toEqual([
                            { pos: v(0, 0), value: null },
                            { pos: v(0, 1), value: false },
                        ]);
                        expect(g.column(1)).toEqual([
                            { pos: v(1, 0), value: true },
                            { pos: v(1, 1), value: null },
                        ]);
                    });

                    it('returns empty array for out of bounds column', () => {
                        expect(g.column(2)).toEqual([]);
                        expect(g.column(-1)).toEqual([]);
                    });
                });

            });

            describe('with looping', () => {

                it('stores and retrieves elements by index with loop' , () => {
                    const g = new Grid<boolean>({size: v(3, 3), loop: true});
                    g.put(v(3, 3), true);
                    expect(g.get(v(0, 0))).toBe(true);

                    g.put(v(4, 5), false);
                    expect(g.get(v(1, 2))).toBe(false);
                });

                describe('rows and columns', () => {
                    const g = new Grid<boolean>({size: v(2, 2), loop: true});
                    /*
                    |     | x=0   | x=1  |
                    |-----|-------|------|
                    | y=0 |       | true |
                    | y=1 | false |      |
                     */
                    g.put(v(1, 0), true);
                    g.put(v(0, 1), false);

                    it('returns looped row for out of bounds row', () => {
                        expect(g.row(2)).toEqual([
                            { pos: v(0, 2), value: null },
                            { pos: v(1, 2), value: true },
                        ]);
                        expect(g.row(-1)).toEqual([
                            { pos: v(0, -1), value: false },
                            { pos: v(1, -1), value: null },
                        ]);
                    });

                    it('returns looped column for out of bounds column', () => {
                        expect(g.column(2)).toEqual([
                            { pos: v(2, 0), value: null },
                            { pos: v(2, 1), value: false },
                        ]);
                        expect(g.column(-1)).toEqual([
                            { pos: v(-1, 0), value: true },
                            { pos: v(-1, 1), value: null },
                        ]);
                    });
                });
            });

            describe('serialization', () => {

                const grid = new Grid<number>({ loop: true, size: v(2, 2) });
                grid.put(v(0, 0), 5);
                grid.put(v(1, 1), -5);

                it('reversibly serializes', () => {
                    const revived = fromJSON<Grid<number>>(toJSON(grid));
                    expect(revived.get(v(0, 0))).toEqual(5);
                    expect(revived.get(v(0, 1))).toBeNull();
                    expect(revived.get(v(1, 0))).toBeNull();
                    expect(revived.get(v(1, 1))).toEqual(-5);
                    expect(revived.get(v(2, 2))).toEqual(5);
                });

                it('serializes to compact (ish) form', () => {
                    expect(toJSON(grid)).toEqual('{"#type":"Grid","#data":{"size":{"#type":"Vector2","#data":[2,2]},"loop":true,"grid":[[5,null],[null,-5]]}}');
                });
            });

            describe('repeated', () => {

                it('produces looping grid populated with single value', () => {
                    const grid = Grid.repeated('sausage');
                    expect(grid.size).toEqual(v(1, 1));
                    expect(grid.get(v(0, 0))).toEqual('sausage');
                    expect(grid.get(v(100, -200))).toEqual('sausage');
                });

                it('produces looping grid populated with no value', () => {
                    const grid = Grid.repeated();
                    expect(grid.size).toEqual(v(1, 1));
                    expect(grid.get(v(0, 0))).toBeNull();
                    expect(grid.get(v(100, -200))).toBeNull();
                });
            });
        });

    });

    describe('Bounds', () => {

        describe('inBounds', () => {

            it('returns whether the point is in the bounds', () => {
                const bounds: Bounds = [v(-1, -1), v(2, 3)];
                expect(inBounds(bounds, v(-2, 0))).toBe(false);
                expect(inBounds(bounds, v(-1, 0))).toBe(true);
                expect(inBounds(bounds, v(-1, -1))).toBe(true);
                expect(inBounds(bounds, v(1, 1))).toBe(true);
                expect(inBounds(bounds, v(3, 1))).toBe(false);
                expect(inBounds(bounds, v(3, 3))).toBe(false);
                expect(inBounds(bounds, v(2, 3))).toBe(true);
            });

        });

        describe('combineBounds', () => {

            it('returns copy of same bounds when no second arg', () => {
                const bounds: Bounds = [v(1, 2), v(3, 4)];
                const result = combineBounds(bounds);
                expect(result).toEqual(bounds);
                expect(result).not.toBe(bounds);
            });

            it('returns combined bounds (same)', () => {
                const result = combineBounds(
                    [v(1, 2), v(3, 4)],
                    [v(1, 2), v(3, 4)]
                );
                expect(result).toEqual([v(1, 2), v(3, 4)]);
            });

            it('returns combined bounds', () => {
                const result = combineBounds(
                    [v(1, 2), v(3, 4)],
                    [v(-1, 2), v(10, 4)]
                );
                expect(result).toEqual([v(-1, 2), v(10, 4)]);
            });

        });

        describe('boundsSize', () => {

            it('returns the size of bounds as a vector', () => {
                expect(boundsSize([v(-1, -1), v(1, 1)])).toEqual(v(3, 3));
                expect(boundsSize([v(-5, 10), v(5, 11)])).toEqual(v(11, 2));
            });

            it('returns the size of bounds as a vector', () => {
                expect(boundsSize([v(-1, -1), v(1, 1)])).toEqual(v(3, 3));
                expect(boundsSize([v(1, 1), v(-1, -1)])).toEqual(v(3, 3));
                expect(boundsSize([v(-5, 10), v(5, 11)])).toEqual(v(11, 2));
                expect(boundsSize([v(5, 10), v(-5, 11)])).toEqual(v(11, 2));
            });
        });

        describe('shrinkBounds', () => {

            it('returns new bounds 1 smaller in all directions', () => {
                expect(shrinkBounds([v(0, 0), v(3, 3)])).toEqual([v(1, 1), v(2, 2)]);
            });

            it('returns zero-size bounds when shrinking to zero-size', () => {
                expect(shrinkBounds([v(-1, -1), v(1, 1)])).toEqual([v(0, 0), v(0, 0)]);
            });

            it('returns negative bounds when shrinking below zero-size', () => {
                expect(shrinkBounds([v(0, 0), v(1, 1)])).toEqual([v(1, 1), v(0, 0)]);
            });
        });
    });

});
