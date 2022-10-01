import {h} from 'preact';
import style from './style.css';
import {useCallback, useEffect, useState} from "react";
import {RegistrationHandle, Shortcuts} from "../../../model/input";
import {HistoryInfo} from "../../organisms/tools";
import {EditorConfig, keys} from "../../../config/editor";
import {CanvasSettings, configureCommand} from "../../../model/canvas";
import {
    changeEditorConfigCommand,
    Command,
    exportCommand,
    openCommand,
    redoCommand,
    saveAsCommand,
    saveCommand,
    undoCommand
} from "../../../model/history";
import EditorConfigDialog from "../../organisms/editorConfigDialog";
import CanvasSettingsDialog from "../../organisms/canvasSettingsDialog";
import ButtonGroup from "../../atoms/buttonGroup";
import TextButton from "../../atoms/textButton";

const CanvasControls = ({shortcuts, historyInfo, editorConfig, canvasSettings, sendCommand}: {
    shortcuts?: Shortcuts
    historyInfo: HistoryInfo
    editorConfig: EditorConfig
    canvasSettings: CanvasSettings
    sendCommand(cmd: Command): void
}) => {

    const [editorConfigOpen, setEditorConfigOpen] = useState(false);
    const [canvasSettingsOpen, setCanvasSettingsOpen] = useState(false);
    const openEditorConfig = useCallback(() => {
        setEditorConfigOpen(true);
        setCanvasSettingsOpen(false);
    },  []);
    const openCanvasSettings = useCallback(() => {
        setEditorConfigOpen(false);
        setCanvasSettingsOpen(true);
    },  []);

    useEffect(() => {
        if (!shortcuts) return;
        const {cancel} = registerShortcuts(
            shortcuts,
            openEditorConfig,
            openCanvasSettings,
        );
        return () => cancel();
    }, [shortcuts?.connected]);

    return (
        <div className={style.controls}>
            <ButtonGroup label='Settings'>
                {editorConfigOpen && <EditorConfigDialog
                    config={editorConfig}
                    close={newConfig => {
                        if (newConfig !== null) {
                            sendCommand(changeEditorConfigCommand(newConfig));
                        }
                        setEditorConfigOpen(false);
                    }}
                />}
                <TextButton
                    text='Editor'
                    onClick={() => setEditorConfigOpen(true) }
                />
                {canvasSettingsOpen && <CanvasSettingsDialog
                    settings={canvasSettings}
                    close={newSettings => {
                        if (newSettings !== null) {
                            sendCommand(configureCommand(newSettings));
                        }
                        setCanvasSettingsOpen(false);
                    }}
                />}
                <TextButton
                    text='Canvas'
                    onClick={() => setCanvasSettingsOpen(true) }
                />
            </ButtonGroup>
            <ButtonGroup label='File'>
                <TextButton
                    text='Open'
                    onClick={() => sendCommand(openCommand()) }
                />
                <TextButton
                    text='Save'
                    onClick={() => sendCommand(saveCommand()) }
                />
                <TextButton
                    text='Save as'
                    onClick={() => sendCommand(saveAsCommand()) }
                />
                <TextButton
                    text='Export'
                    onClick={() => sendCommand(exportCommand())}
                />
            </ButtonGroup>
            <ButtonGroup>
                <TextButton
                    text='Undo'
                    onClick={historyInfo.canUndo ? () => sendCommand(undoCommand()) : undefined}
                />
                <TextButton
                    text='Redo'
                    onClick={historyInfo.canRedo ? () => sendCommand(redoCommand()) : undefined}
                />
            </ButtonGroup>
        </div>
    );
}
export default CanvasControls;

function registerShortcuts(shortcuts: Shortcuts,
                           openEditorConfig: () => void,
                           openCanvasSettings: () => void): RegistrationHandle {
    const handles: RegistrationHandle[] = [];

    handles.push(shortcuts.register(keys.undo.keystrokes, () => [undoCommand()]));
    handles.push(shortcuts.register(keys.redo.keystrokes, () => [redoCommand()]));
    handles.push(shortcuts.register(keys.save.keystrokes, () => [saveCommand()]));
    handles.push(shortcuts.register(keys.saveAs.keystrokes, () => [saveAsCommand()]));
    handles.push(shortcuts.register(keys.open.keystrokes, () => [openCommand()]));
    handles.push(shortcuts.register(keys.export.keystrokes, () => [exportCommand()]));
    handles.push(shortcuts.register(keys.editorConfig.keystrokes, () => {
        openEditorConfig();
        return [];
    }));
    handles.push(shortcuts.register(keys.canvasSettings.keystrokes, () => {
        openCanvasSettings();
        return [];
    }));

    return {
        cancel: () => handles.forEach(({cancel}) => cancel())
    }
}
