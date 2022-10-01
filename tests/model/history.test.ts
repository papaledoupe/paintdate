import {atomic, Command, copyCommand, History, pasteCommand, redoCommand, undoCommand} from "../../src/model/history";
import {File} from "../../src/storage/storage";
import {addLayerCommand, renameLayerCommand} from "../../src/model/canvas";
import {h} from "preact";

let mockExistingFileContents: string = '';

jest.mock('../../src/storage/storage', () => ({
    ...jest.requireActual('../../src/storage/storage'),
    newUnsavedFile(): File {
        return {
            recommendedExtension: '.fake',
            contents: '',
            name: 'stub file',
            async copy(): Promise<File> { return null!! },
            async save(): Promise<void> {}
        }
    },
    async openExistingFile(): Promise<File> {
        return {
            recommendedExtension: '.fake',
            contents: mockExistingFileContents,
            name: 'stub existing file',
            async copy(): Promise<File> { return null!! },
            async save(): Promise<void> {}
        }
    }
}));

describe('History', () => {

    beforeEach(() => {
        mockExistingFileContents = '';
    })

    describe('load', () => {

        it('cannot load file without version', async () => {
            mockExistingFileContents = '{}';
            const history = new History();
            await expect(history.load()).rejects.toThrow('expected file version');
        });

        it('cannot load file with unsupported version', async () => {
            mockExistingFileContents = '{"version":"vFuture"}';
            const history = new History();
            await expect(history.load()).rejects.toThrow('unsupported file version vFuture');
        });

        it('loads existing v0.1 file', async () => {
            mockExistingFileContents = `
            {
              "version": "0.1",
              "history": [
                
              ]
            }`
            const history = new History();
            await history.load()
        });

    });

    describe('AtomicCommand', () => {

        let history: History
        beforeEach(async () => {
            history = new History();
            history.enqueue(addLayerCommand({ name: "top" }));
            history.enqueue(addLayerCommand({ name: "bottom" }));
            await history.handleChanges();
        });

        describe('AtomicCommand', () => {

            it('is applied as a unit', async () => {
                history.enqueue(atomic([
                    renameLayerCommand({ layerName: "top", newName: "top2" }),
                    renameLayerCommand({ layerName: "bottom", newName: "bottom2" }),
                ]));
                await history.handleChanges();

                expect(history.canvas.namedLayer("top")).toBeNull();
                expect(history.canvas.namedLayer("bottom")).toBeNull();
                expect(history.canvas.namedLayer("top2")).not.toBeNull();
                expect(history.canvas.namedLayer("bottom2")).not.toBeNull();
            });

            it('is undone as a unit', async () => {
                history.enqueue(atomic([
                    renameLayerCommand({ layerName: "top", newName: "top2" }),
                    renameLayerCommand({ layerName: "bottom", newName: "bottom2" }),
                ]));
                history.enqueue(undoCommand());
                await history.handleChanges();

                expect(history.canvas.namedLayer("top")).not.toBeNull();
                expect(history.canvas.namedLayer("bottom")).not.toBeNull();
                expect(history.canvas.namedLayer("top2")).toBeNull();
                expect(history.canvas.namedLayer("bottom2")).toBeNull();
            });

            it('is redone as a unit', async () => {
                history.enqueue(atomic([
                    renameLayerCommand({ layerName: "top", newName: "top2" }),
                    renameLayerCommand({ layerName: "bottom", newName: "bottom2" }),
                ]));
                history.enqueue(undoCommand());
                history.enqueue(redoCommand());
                await history.handleChanges();

                expect(history.canvas.namedLayer("top")).toBeNull();
                expect(history.canvas.namedLayer("bottom")).toBeNull();
                expect(history.canvas.namedLayer("top2")).not.toBeNull();
                expect(history.canvas.namedLayer("bottom2")).not.toBeNull();
            });

            it('rolls back changes made when not all succeed', async () => {
                history.enqueue(atomic([
                    renameLayerCommand({ layerName: "top", newName: "top2" }),
                    { target: 'canvas', type: 'error' },
                ]));
                await expect(() => history.handleChanges())
                    .rejects
                    .toThrow('simulated command processing error');

                expect(history.canvas.namedLayer("top")).not.toBeNull();
                expect(history.canvas.namedLayer("bottom")).not.toBeNull();
                expect(history.canvas.namedLayer("top2")).toBeNull();
                expect(history.canvas.namedLayer("bottom2")).toBeNull();
            });
        });

        describe('copy and paste commands', () => {

            it('does nothing when pasting without anything on clipboard', async () => {
                const history = new History();
                history.enqueue(pasteCommand());
                await history.handleChanges();
                expect(history.applied).toHaveLength(0);
            });

            it('performs commands triggered from pasting copied data', async () => {
                const history = new History();
                history.enqueue(copyCommand({
                    description: 'test',
                    paste(): Command[] {
                        return [addLayerCommand({})];
                    },
                }));
                await history.handleChanges();

                expect(history.applied).toHaveLength(0);
                expect(history.canvas.layers).toHaveLength(0);

                history.enqueue(pasteCommand());
                await history.handleChanges();

                expect(history.applied).toHaveLength(1);
                expect(history.canvas.layers).toHaveLength(1);
            });

            it('pasting twice does nothing further', async () => {
                const history = new History();
                history.enqueue(copyCommand({
                    description: 'test',
                    paste(): Command[] {
                        return [addLayerCommand({})];
                    },
                }));
                history.enqueue(pasteCommand());
                history.enqueue(pasteCommand());
                await history.handleChanges();

                expect(history.applied).toHaveLength(1);
                expect(history.canvas.layers).toHaveLength(1);
            });
        });
    });

});
