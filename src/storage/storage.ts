// Note: using an experimental browser API here. Notably, no FF support.
declare global {
    interface Window {
        showOpenFilePicker: typeof showOpenFilePicker
        showSaveFilePicker: typeof showSaveFilePicker
    }
}

export interface File {
    recommendedExtension: string
    contents: string | Blob
    get name(): string
    save(): Promise<void>
    copy(): Promise<File>
}

export async function getContentsString(f: File): Promise<string> {
    if (typeof f.contents === 'string') {
        return f.contents;
    }
    return await f.contents.text();
}

type FilePicker = {
    toOpen(): Promise<FileSystemFileHandle>
    toSave(suggestedName: string): Promise<FileSystemFileHandle>
}
const windowFilePicker: FilePicker = {
    async toOpen(): Promise<FileSystemFileHandle> {
        const [handle] = await window.showOpenFilePicker();
        if (handle.kind !== 'file') {
            throw new Error('must open a file');
        }
        return handle;
    },
    async toSave(suggestedName: string): Promise<FileSystemFileHandle> {
        return await window.showSaveFilePicker({
            suggestedName,
            // TODO? types: []
        });
    },
}

class FSAccessFile implements File {
    recommendedExtension: string
    contents = '';
    name = '';
    private handle: FileSystemFileHandle | null;
    private readonly picker: FilePicker

    private constructor(recommendedExtension: string, picker: FilePicker, handle: FileSystemFileHandle | null = null) {
        this.recommendedExtension = recommendedExtension;
        this.picker = picker;
        this.handle = handle;
    }

    static newFile(recommendedExtension: string, picker: FilePicker = windowFilePicker): FSAccessFile {
        return new FSAccessFile(recommendedExtension, picker, null);
    }

    static async existingFile(recommendedExtension: string, picker: FilePicker = windowFilePicker): Promise<FSAccessFile> {
        const f = new FSAccessFile(recommendedExtension, picker, null);
        await f.read();
        return f;
    }

    private async read(): Promise<void> {
        if (this.handle === null) {
            this.handle = await this.picker.toOpen();
        }
        const f = await this.handle.getFile();
        this.name = f.name;
        this.contents = await f.text();
    }

    async save(): Promise<void> {
        if (this.handle === null) {
            this.handle = await this.picker.toSave(`untitled${this.recommendedExtension}`);
        }
        const f = await this.handle.getFile();
        this.name = f.name;
        const w = await this.handle.createWritable({ keepExistingData: false });
        await w.write(this.contents);
        await w.close();
    }

    async copy(): Promise<File> {
        const copy = await FSAccessFile.newFile(this.recommendedExtension, this.picker);
        copy.contents = this.contents;
        return copy;
    }
}

export function newUnsavedFile(recommendedExtension: string): File {
    return FSAccessFile.newFile(recommendedExtension);
}

export async function openExistingFile(recommendedExtension: string): Promise<File> {
  return FSAccessFile.existingFile(recommendedExtension);
}
