import {Canvas, CanvasCommand, CanvasSettings, isCanvasCommand} from "./canvas";
import {File, getContentsString, newUnsavedFile, openExistingFile} from "../storage/storage";
import {v4 as uuid} from 'uuid';
import {fromJSON, toJSON} from "../util/json";
import {gridToImageData} from "../util/dom/canvas";
import {version} from '../../package.json';
import {EditorConfig, newEditorConfigWithDefaults} from "../config/editor";

export interface Command {
    target: string
    type: string
}

export type Change = {
    uuid: string
    timestamp: number
    command: Command
}

export const sourceFileExtension = '.pd.json';
export const pngExtension = '.png';
export const pngType = 'image/png';

type SourceFileDataVersion = {
    appVersion: string
    version: string
}
type SourceFileDataV0_1 = SourceFileDataVersion & {
    version: '0.1'
    settings: CanvasSettings
    history: Change[]
}
type SourceFileData = SourceFileDataV0_1

export function undoCommand(): Command {
    return { target: 'history', type: 'undo' }
}

export function redoCommand(): Command {
    return { target: 'history', type: 'redo' }
}

export function openCommand(): Command {
    return { target: 'file', type: 'open' }
}

export function saveCommand(): Command {
    return { target: 'file', type: 'save' }
}

export function saveAsCommand(): Command {
    return { target: 'file', type: 'saveAs' }
}

export type CopyCommand = Command & {
    target: 'clipboard'
    type: 'copy'
    item: ClipboardItem
}
export function copyCommand(item: ClipboardItem): CopyCommand {
    return { target: 'clipboard', type: 'copy', item }
}
export function pasteCommand(): Command {
    return { target: 'clipboard', type: 'paste' }
}

export type ChangeEditorConfigCommand = Command & {
    target: 'editor'
    type: 'changeConfig'
    changes: Partial<EditorConfig>
}
export function changeEditorConfigCommand(changes: Partial<EditorConfig>): ChangeEditorConfigCommand {
    return { target: 'editor', type: 'changeConfig', changes }
}

// changes made are applied, undone and redone as a unit
export type AtomicCommand = Command & {
    target: 'any'
    type: 'atomic'
    commands: CanvasCommand[]
}
export function atomic(commands: CanvasCommand[]): AtomicCommand {
    return {
        target: 'any',
        type: 'atomic',
        commands
    }
}
function isAtomic(command: Command): command is AtomicCommand {
    return command.target === 'any' && command.type === 'atomic';
}

export type ExportOptions = { fileType: string, fileExt: string }
export type ExportCommand = Command & { target: 'file', type: 'export' } & ExportOptions;
export function exportCommand(options: Partial<ExportOptions> = {}): ExportCommand {
    const fileType = options.fileType || pngType;
    let fileExt = options.fileExt || '';
    if (fileExt === '' && fileType === pngType) fileExt = pngExtension;
    return { target: 'file', type: 'export', fileType, fileExt }
}

class AtomicError extends Error {
    readonly wrapped: unknown
    constructor(wrapped: unknown) {
        super(`error atomically applying commands: ${wrapped}`);
        this.wrapped = wrapped;
    }
}

export type ClipboardItem = {
    description: string
    paste(): Command[]
}

export class History {
    readonly applied: Change[] = []; // first applied = head
    private readonly undone: Change[] = []; // first undone = head
    private readonly queued: Change[] = []; // first to apply = head

    private clipboard: ClipboardItem | null = null;

    canvas: Canvas = new Canvas();
    editorConfig: EditorConfig = newEditorConfigWithDefaults();

    private sourceFile: File;

    constructor() {
        this.sourceFile = newUnsavedFile(sourceFileExtension);
    }

    get queuedChanges(): number {
        return this.queued.length;
    }

    get canUndo(): boolean {
        return this.applied.length > 0;
    }

    get canRedo(): boolean {
        return this.undone.length > 0;
    }

    get canPaste(): boolean {
        return this.clipboard !== null;
    }

    enqueue(command: Command) {
        this.queued.push({
            command,
            timestamp: Date.now(),
            uuid: uuid(),
        });
    }

    async handleNow(...command: Command[]) {
        command.forEach(cmd => this.enqueue(cmd));
        await this.handleChanges();
    }

    async handleChanges() {
        let toRethrow;
        while (this.queued.length > 0) {
            try {
                await this.handle(this.queued.shift()!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
            } catch (e) {
                if (e instanceof AtomicError) {
                    // when AtomicError thrown, we need to rebuild from scratch
                    toRethrow = e.wrapped;
                } else {
                    throw e;
                }
            }
        }
        if (toRethrow) {
            throw toRethrow;
        }
    }

    async saveAs() {
        this.sourceFile = await this.sourceFile.copy();
        await this.save();
    }

    async save() {
        const fileData: SourceFileDataV0_1 = {
            appVersion: version,
            version: '0.1',
            history: this.applied,
            settings: this.canvas.settings,
        }
        this.sourceFile.contents = toJSON(fileData, {pretty: true});
        await this.sourceFile.save()
    }

    async load() {
        this.sourceFile = await openExistingFile('.pd.json');
        const data: SourceFileData = fromJSON(await getContentsString(this.sourceFile));
        if (data.version === undefined) {
            throw new Error("expected file version");
        }
        if (data.version !== '0.1') {
            throw new Error(`unsupported file version ${data.version}`);
        }

        // if (data.appVersion === ...) {
        //    fix some bug or do something special that isn't handled by file version
        // }

        this.canvas = new Canvas();
        this.applied.splice(0, this.applied.length);
        this.undone.splice(0, this.undone.length);
        this.queued.splice(0, this.queued.length);
        this.queued.push(...data.history);
    }

    async export({ fileExt, fileType }: ExportOptions) {
        const exportFile = await newUnsavedFile(fileExt);
        let grid = this.canvas.flatGrid();
        if (this.editorConfig.cropExports) {
            grid = grid.cropped();
        }
        const dataUrl = gridToImageData(fileType, grid)
        // this is an amusing way to convert a data URL to file data...
        exportFile.contents = await (await fetch(dataUrl)).blob();
        await exportFile.save();
    }

    private async handle(change: Change) {
        const {command} = change;
        console.debug('handling command', command);

        if (command.target === 'history') {
            if (command.type === 'undo') this.undo();
            if (command.type === 'redo') this.redo();
            return;
        } else if (command.target === 'file') {
            try {
                if (command.type === 'save') await this.save();
                if (command.type === 'saveAs') await this.saveAs();
                if (command.type === 'open') await this.load();
                if (command.type === 'export') await this.export(command as ExportCommand);
            } catch (e) {
                console.warn(`file operation (${command.type}) failed`, e);
            }
            return;
        } else if (command.target === 'clipboard') {
            if (command.type === 'copy') await this.copy(command as CopyCommand);
            if (command.type === 'paste') await this.paste();
            return;
        } else if (command.target === 'editor') {
            if (command.type === 'changeConfig') await this.changeConfig(command as ChangeEditorConfigCommand);
            return;
        }

        if (isAtomic(command)) {
            this.atomic(command.commands);
        } else if (isCanvasCommand(command)) {
            this.canvas.handle(command)
        }
        this.applied.push(change);
    }

    private atomic(commands: CanvasCommand[]) {
        commands.forEach((command) => {
            try {
                this.canvas.handle(command)
            } catch (e) {
                this.rebuild();
                throw new AtomicError(e);
            }
        });
    }

    private copy(command: CopyCommand) {
        this.clipboard = command.item;
    }

    private paste() {
        (this.clipboard?.paste() || []).forEach(command => this.enqueue(command))
        this.clipboard = null;
    }

    private changeConfig(cmd: ChangeEditorConfigCommand): void {
        this.editorConfig = {
            ...this.editorConfig,
            ...cmd.changes,
        }
    }

    private undo() {
        const undone = this.applied.pop();
        if (undone === undefined) {
            return;
        }
        this.undone.push(undone);
        this.rebuild();
    }

    private rebuild() {
        this.canvas = new Canvas();
        const unapplied = this.applied.splice(0, this.applied.length);
        const unqueued = this.queued.splice(0, this.queued.length);
        this.queued.push(...unapplied, ...unqueued);
    }

    private redo() {
        const redone = this.undone.pop();
        if (redone === undefined) {
            return;
        }
        this.queued.push(redone);
    }
}
