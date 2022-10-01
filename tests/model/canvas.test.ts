import {
    addShapeCommand,
    Canvas,
    deleteLayerCommand,
    Layer,
    mergeLayerDownCommand,
    moveLayerCommand, positionedShape,
    reorderLayerCommand,
    reorderShapeCommand
} from "../../src/model/canvas";
import {rect} from "../../src/model/shapes/rect";
import {v} from "../../src/model/space";
import {solidFill} from "../../src/model/fill";
import {line} from "../../src/model/shapes/line";
import {solidStroke} from "../../src/model/stroke";
import {Freeform} from "../../src/model/shapes/freeform";
import {toJSON} from "../../src/util/json";

describe('Canvas', () => {

    let exampleCanvas: Canvas;
    let exampleCanvasGridSerialized: string;
    beforeEach(() => {
        exampleCanvas = new Canvas();
        exampleCanvas.handle(addShapeCommand({
            layerName: 'bottom',
            shape: rect({ size: v(1, 1), fill: solidFill('black') }),
        }));
        exampleCanvas.handle(addShapeCommand({
            layerName: 'bottom',
            shape: rect({ size: v(1, 1), fill: solidFill('white') }),
            origin: v(1, 1),
        }));
        exampleCanvas.handle(addShapeCommand({
            layerName: 'top',
            shape: rect({ size: v(2, 2), fill: solidFill('black') }),
            origin: v(2, 2),
        }));
        exampleCanvasGridSerialized = toJSON(exampleCanvas.flatGrid());
    });

    // ensures no visual change
    function assertExampleCanvasGridUnchanged() {
        expect(toJSON(exampleCanvas.flatGrid())).toEqual(exampleCanvasGridSerialized)
    }

    // ensures layer structure unchanged as well as no visual change
    function assertExampleCanvasUnchanged() {
        expect(exampleCanvas.layers).toHaveLength(2);
        expect(exampleCanvas.topLayer()?.name).toEqual('top');
        expect(exampleCanvas.topLayer()?.shapes).toHaveLength(1);
        expect(exampleCanvas.bottomLayer()?.name).toEqual('bottom');
        expect(exampleCanvas.bottomLayer()?.shapes).toHaveLength(2);
        assertExampleCanvasGridUnchanged();
    }

    describe('flatGrid', () => {

        it('flattens all shapes and layers to a raster grid', () => {
            const grid = exampleCanvas.flatGrid();
            expect(grid.get(v(0, 0))).toBe('black');
            expect(grid.get(v(1, 0))).toBe(null);
            expect(grid.get(v(2, 0))).toBe(null);
            expect(grid.get(v(3, 0))).toBe(null);
            expect(grid.get(v(0, 1))).toBe(null);
            expect(grid.get(v(1, 1))).toBe('white');
            expect(grid.get(v(2, 1))).toBe(null);
            expect(grid.get(v(3, 1))).toBe(null);
            expect(grid.get(v(0, 2))).toBe(null);
            expect(grid.get(v(1, 2))).toBe(null);
            expect(grid.get(v(2, 2))).toBe('black');
            expect(grid.get(v(3, 2))).toBe('black');
            expect(grid.get(v(0, 3))).toBe(null);
            expect(grid.get(v(1, 3))).toBe(null);
            expect(grid.get(v(2, 3))).toBe('black');
            expect(grid.get(v(3, 3))).toBe('black');
        });

        it('handles shape and layer origins', () => {
            const canvas = new Canvas();
            canvas.handle(addShapeCommand({
                layerName: 's1',
                shape: rect({ size: v(1, 1), fill: solidFill('black') }),
                origin: v(5, 5),
            }));
            canvas.handle(moveLayerCommand({
                name: 's1',
                offset: v(-2, -2),
            }));
            const grid = canvas.flatGrid();

            expect(grid.get(v(3, 3))).toBe('black');
        });

        it('supports masking', () => {
            const canvas = new Canvas();
            canvas.handle(addShapeCommand({
                layerName: 's1',
                shape: rect({ size: v(3, 3), fill: solidFill('black') }),
            }));
            canvas.handle(addShapeCommand({
                layerName: 's1',
                shape: rect({ size: v(2, 2), fill: solidFill('black') }),
                origin: v(1, 1),
                mask: true,
            }));
            const grid = canvas.flatGrid();

            expect(grid.get(v(0, 0))).toBe('black');
            expect(grid.get(v(0, 1))).toBe('black');
            expect(grid.get(v(0, 2))).toBe('black');
            expect(grid.get(v(1, 0))).toBe('black');
            expect(grid.get(v(1, 1))).toBe(null);
            expect(grid.get(v(1, 2))).toBe(null);
            expect(grid.get(v(2, 0))).toBe('black');
            expect(grid.get(v(2, 1))).toBe(null);
            expect(grid.get(v(2, 2))).toBe(null);
        });

        it('supports virtual masking', () => {
            const canvas = new Canvas();
            canvas.handle(addShapeCommand({
                layerName: 's1',
                shape: rect({ size: v(3, 3), fill: solidFill('black') }),
            }));
            canvas.handle(addShapeCommand({
                layerName: 's1',
                shape: rect({ size: v(1, 1), fill: solidFill('white') }),
                origin: v(2, 2),
                beforeIndex: 'bottom',
            }));
            const grid = canvas.flatGrid([{
                layer: 's1',
                shapes: { 0: [positionedShape({
                        shape: rect({ size: v(2, 2), fill: solidFill('black') }),
                        origin: v(1, 1),
                        mask: true,
                })]},
            }]);

            expect(grid.get(v(0, 0))).toBe('black');
            expect(grid.get(v(0, 1))).toBe('black');
            expect(grid.get(v(0, 2))).toBe('black');
            expect(grid.get(v(1, 0))).toBe('black');
            expect(grid.get(v(1, 1))).toBe(null);
            expect(grid.get(v(1, 2))).toBe(null);
            expect(grid.get(v(2, 0))).toBe('black');
            expect(grid.get(v(2, 1))).toBe(null);
            expect(grid.get(v(2, 2))).toBe('white');
        });

    });

    describe('Layer', () => {

        let layer: Layer
        beforeEach(() => {
            layer = new Layer({
                name: 'test',
                shapes: [
                    positionedShape({
                        shape: line({ vector: v(10, 10), stroke: solidStroke('black') }),
                        origin: v(0, 0),
                    }),
                    positionedShape({
                        shape: rect({ size: v(10, 10), fill: solidFill('black') }),
                        origin: v(0, 0),
                    }),
                    positionedShape({
                        shape: rect({ size: v(10, 10), fill: solidFill('white') }),
                        origin: v(5, 5),
                    }),
                    positionedShape({
                        shape: line({ vector: v(10, 10), stroke: solidStroke('black') }),
                        origin: v(0, 0),
                    }),
                ]
            });
        });

        describe('addShape', () => {

            describe('to top', () => {

                it('adds new primitive shape to top', () => {
                    const shape = rect({size: v(1, 1)});
                    layer.addShape(positionedShape({
                        shape,
                        origin: v(1, 1),
                    }), {to: 'top'});
                    expect(layer.shapes).toHaveLength(5);
                    expect(layer.topShape()).toEqual({ shape, origin: v(1, 1), hidden: false, mask: false });
                });

                it('combines freeform shape if top shape is freeform and mergeFreeform enabled', () => {
                    const ff1 = new Freeform({color: 'black', points: [v(1, 1)]});
                    layer.addShape(positionedShape({
                        shape: ff1,
                        origin: v(10, 10),
                    }), {to: 'top'});
                    expect(layer.shapes).toHaveLength(5);
                    expect(layer.topShape()).toEqual({ shape: ff1, origin: v(10, 10), hidden: false, mask: false });

                    const ff2 = new Freeform({color: 'white', points: [v(2, 2)]});
                    layer.addShape(positionedShape({
                        shape: ff2,
                        origin: v(10, 10),
                    }), {to: 'top', mergeFreeForm: true});
                    expect(layer.shapes).toHaveLength(5);
                    expect(layer.topShape()?.shape.type).toEqual('Freeform');
                    expect(layer.topShape()?.shape.pixels).toEqual([
                        {color: 'black', pos: v(1, 1)},
                        {color: 'white', pos: v(2, 2)},
                    ]);
                });

            });

            describe('to bottom', () => {
                it('adds new primitive shape to bottom', () => {
                    const shape = rect({size: v(1, 1)});
                    layer.addShape(positionedShape({
                        shape,
                        origin: v(1, 1),
                    }), {to: 'bottom'});
                    expect(layer.shapes).toHaveLength(5);
                    expect(layer.bottomShape()).toEqual({ shape, origin: v(1, 1), hidden: false, mask: false });
                });
            });

            describe('to index', () => {
                it('adds new primitive shape to specified index', () => {
                    const shape = rect({size: v(1, 1), fill: solidFill('white')});
                    layer.addShape(positionedShape({
                        shape,
                        origin: v(1, 2),
                    }), {to: 1});
                    expect(layer.shapes).toHaveLength(5);
                    expect(layer.shapes[1]).toEqual({ shape, origin: v(1, 2), hidden: false, mask: false });
                });
            })
        });

        describe('topShape', () => {
            it('returns the top shape', () => {
                expect(layer.topShape()).toBe(layer.shapes[0]);
            });
        })

        describe('mergeDown', () => {

            it('does nothing on bottom layer', () => {
                layer.mergeDown(layer.shapes.length - 1);
                expect(layer.shapes).toHaveLength(4);
            });

            it('combines shape with next shape down', () => {
                layer.mergeDown(1);
                expect(layer.shapes).toHaveLength(3);
                expect(layer.shapes.map(({shape}) => shape.type)).toEqual(['Line', 'Freeform', 'Line']);
                // origin of bottom shape is taken as origin of combined shape
                expect(layer.shapes[1]?.shape.bounds).toEqual([v(-5, -5), v(9, 9)])
            });

        });

        describe('topShape', () => {

            it('returns top shape for coordinates', () => {
                expect(layer.shapes.shift());
                expect(layer.topShapeAt(v(0, 0))?.index).toEqual(0);
                expect(layer.topShapeAt(v(5, 5))?.index).toEqual(0);
                expect(layer.topShapeAt(v(11, 11))?.index).toEqual(1);
            });
        });

    });

    describe('commands', () => {

        describe('ReorderLayerCommand', () => {

            it('moves layer up', () => {
                exampleCanvas.handle(reorderLayerCommand({ name: 'bottom', direction: 'up' }))
                expect(exampleCanvas.layers).toHaveLength(2);
                expect(exampleCanvas.topLayer()?.name).toEqual('bottom');
            });

            it('moves layer down', () => {
                exampleCanvas.handle(reorderLayerCommand({ name: 'top', direction: 'down' }))
                expect(exampleCanvas.layers).toHaveLength(2);
                expect(exampleCanvas.topLayer()?.name).toEqual('bottom');
            });

            it('does nothing when moving top layer up', () => {
                exampleCanvas.handle(reorderLayerCommand({ name: 'top', direction: 'up' }))
                assertExampleCanvasUnchanged();
            });

            it('does nothing when moving bottom layer down', () => {
                exampleCanvas.handle(reorderLayerCommand({ name: 'bottom', direction: 'down' }))
                assertExampleCanvasUnchanged();
            });

            it('does nothing when moving non-existent layer', () => {
                exampleCanvas.handle(reorderLayerCommand({ name: 'nope', direction: 'down' }))
                assertExampleCanvasUnchanged();
            });

        });

        describe('ReorderShapeCommand', () => {

            it('moves shape up within layer', () => {
                exampleCanvas.handle(reorderShapeCommand({ layerName: 'bottom', index: 1, direction: 'up' }));
                expect(exampleCanvas.bottomLayer()?.topShape()?.origin).toEqual(v(0, 0));
            });

            it('moves shape up to bottom of previous layer when at boundary', () => {
                exampleCanvas.handle(reorderShapeCommand({ layerName: 'bottom', index: 0, direction: 'up' }));
                expect(exampleCanvas.topLayer()?.shapes).toHaveLength(2);
                expect(exampleCanvas.topLayer()?.bottomShape()?.origin).toEqual(v(1, 1));
                expect(exampleCanvas.bottomLayer()?.shapes).toHaveLength(1);
            });

            it('does nothing when shape cannot move up', () => {
                exampleCanvas.handle(reorderShapeCommand({ layerName: 'top', index: 0, direction: 'up' }));
                assertExampleCanvasUnchanged();
            });

            it('moves shape down within layer', () => {
                exampleCanvas.handle(reorderShapeCommand({ layerName: 'bottom', index: 0, direction: 'down' }));
                expect(exampleCanvas.topLayer()?.shapes).toHaveLength(1);
                expect(exampleCanvas.bottomLayer()?.shapes).toHaveLength(2);
                expect(exampleCanvas.bottomLayer()?.topShape()?.origin).toEqual(v(0, 0));
            });

            it('moves shape down to top of next layer when at boundary', () => {
                exampleCanvas.handle(reorderShapeCommand({ layerName: 'top', index: 0, direction: 'down' }));
                expect(exampleCanvas.topLayer()?.shapes).toHaveLength(0);
                expect(exampleCanvas.bottomLayer()?.shapes).toHaveLength(3);
                expect(exampleCanvas.bottomLayer()?.topShape()?.origin).toEqual(v(2, 2));
            });

            it('does nothing when shape cannot move down', () => {
                exampleCanvas.handle(reorderShapeCommand({ layerName: 'bottom', index: 1, direction: 'down' }));
                assertExampleCanvasUnchanged();
            });

            it('does nothing when layer does not exist', () => {
                exampleCanvas.handle(reorderShapeCommand({ layerName: 'nope', index: 0, direction: 'down' }));
                assertExampleCanvasUnchanged();
            });

            it('does nothing when shape does not exist', () => {
                exampleCanvas.handle(reorderShapeCommand({ layerName: 'top', index: 1, direction: 'down' }));
                assertExampleCanvasUnchanged();
            });

        });

        describe('DeleteLayerCommand', () => {

            it('deletes named layer', () => {
                exampleCanvas.handle(deleteLayerCommand({ name: 'top'}));
                expect(exampleCanvas.layers).toHaveLength(1);
                expect(exampleCanvas.topLayer()?.name).toEqual('bottom');
            });

            it('does nothing when deleting non-existent layer', () => {
                exampleCanvas.handle(deleteLayerCommand({ name: 'nope '}));
                assertExampleCanvasUnchanged();
            });

        });

        describe('MergeLayerDownCommand', () => {

            it('flattens layer into one below with no visual changes', () => {
                exampleCanvas.handle(mergeLayerDownCommand({ name: 'top' }));
                expect(exampleCanvas.layers).toHaveLength(1);
                expect(exampleCanvas.topLayer()?.name).toEqual('top');
                assertExampleCanvasGridUnchanged();
            });

            it('handles different layer origins', () => {
                exampleCanvas.handle(moveLayerCommand({ name: 'top', offset: v(5, 5) }))
                const preMergeJSON = toJSON(exampleCanvas.flatGrid());
                exampleCanvas.handle(mergeLayerDownCommand({ name: 'top' }));
                const postMergeJSON = toJSON(exampleCanvas.flatGrid());
                expect(exampleCanvas.layers).toHaveLength(1);
                expect(exampleCanvas.topLayer()?.name).toEqual('top');
                expect(preMergeJSON).toEqual(postMergeJSON)
            });

            it('does nothing when layer does not exist', () => {
                exampleCanvas.handle(mergeLayerDownCommand({ name: 'nope' }));
                assertExampleCanvasUnchanged();
            });

            it('does nothing when layer is bottom', () => {
                exampleCanvas.handle(mergeLayerDownCommand({ name: 'bottom' }));
                assertExampleCanvasUnchanged();
            });

        });
    });

});
