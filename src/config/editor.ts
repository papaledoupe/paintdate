import {v, Vector2} from "../model/space";
import {Fill} from "../model/fill";
import {createContext} from "preact";
import {Stroke} from "../model/stroke";

export type Keystrokes = {
    description: string
    keystrokes: string[]
}

export const keys: {[name: string]: Keystrokes} = {
    undo: {
        description: "Undo an editor action",
        keystrokes: ["mod+z"]
    },
    redo: {
        description: "Redo an editor action",
        keystrokes: ["mod+y", "mod+shift+z"]
    },
    cut: {
        description: "Cut selected area from current layer",
        keystrokes: ["mod+x"]
    },
    copy: {
        description: "Copy selected area from current layer",
        keystrokes: ["mod+c"]
    },
    paste: {
        description: "Paste cut or copied area to current layer",
        keystrokes: ["mod+v"]
    },
    delete: {
        description: "Delete selected area from current layer",
        keystrokes: ["del", "backspace"]
    },
    save: {
        description: "Save current open file in editor format",
        keystrokes: ["mod+s"]
    },
    saveAs: {
        description: "Save current open file to specified path in editor format",
        keystrokes: ["mod+shift+s"]
    },
    export: {
        description: "Save current open file to specified path in raw image format",
        keystrokes: ["mod+e"]
    },
    open: {
        description: "Open existing editor file",
        keystrokes: ["mod+o"]
    },
    close: {
        description: "Close open dialog or overlay without saving changes",
        keystrokes: ["esc"]
    },
    confirm: {
        description: "Close open dialog or overlay saving changes",
        keystrokes: ["enter"]
    },
    canvasSettings: {
        description: "Open canvas settings dialog",
        keystrokes: ["mod+,"]
    },
    editorConfig: {
        description: "Open editor configuration dialog",
        keystrokes: ["mod+shift+,"]
    },
    dragTool: {
        description: "Switch to Drag tool",
        keystrokes: ["d"]
    },
    eraserTool: {
        description: "Switch to Eraser tool",
        keystrokes: ["e"]
    },
    fillTool: {
        description: "Switch to Fill tool",
        keystrokes: ["f"]
    },
    lineTool: {
        description: "Switch to Line tool",
        keystrokes: ["l"]
    },
    pencilTool: {
        description: "Switch to Pencil tool",
        keystrokes: ["p"]
    },
    rectTool: {
        description: "Switch to Rect tool",
        keystrokes: ["r"]
    },
    selectTool: {
        description: "Switch to Select tool",
        keystrokes: ["s"]
    },
    toolModify1: {
        description: "Hold to modify behaviour of some tools. Select: lock aspect ratio of selected area. Rect: lock aspect ratio of drawn rectangle (square). Drag: snap dragging to horizontal or vertical axis. Line: snap line to horizontal, vertical, diagonal or isometric axis",
        keystrokes: ["shift"]
    },
}

export type EditorConfig = {
    scale: number
    grid: Vector2
    showCoordinates: boolean
    theme: string
    customFills: Fill[]
    customStrokes: Stroke[]
    cropExports: boolean
}
export function newEditorConfigWithDefaults(overrides: Partial<EditorConfig> = {}): EditorConfig {
    return {
        scale: 4,
        grid: v(16, 16),
        showCoordinates: true,
        theme: 'playdate',
        customFills: [],
        customStrokes: [],
        cropExports: true,
        ...overrides,
    }
}

export type EditorConfigContextType = {
    config: EditorConfig
    configure(changes: Partial<EditorConfig>): void
}
export const EditorConfigContext = createContext<EditorConfigContextType>({
    config: newEditorConfigWithDefaults(),
    configure() {/* no-op default */}
});
