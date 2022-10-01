import {h} from 'preact';
import {nextVariant, Tool, Variant} from "../../../model/tool";
import {tools as allTools} from '../../../model/tools/all';
import style from './style.css';
import {RegistrationHandle, Shortcuts} from "../../../model/input";
import {Fragment, useEffect, useState} from "react";
import ToolControl from "../../molecules/toolControl";

export type HistoryInfo = {
    canUndo: boolean
    canRedo: boolean
}

const Tools = ({shortcuts, current, onSelect}: {
    shortcuts?: Shortcuts
    current: Tool
    onSelect<V extends Variant>(tool: Tool<V>, variant: V): void
}) => {
    const tools = Object.values(allTools);

    const [currentToolHolder] = useState<{ current: Tool }>({ current });
    currentToolHolder.current = current;

    useEffect(() => {
        if (!shortcuts) return;
        const {cancel} = registerShortcuts(
            shortcuts,
            tools,
            () => currentToolHolder.current,
            onSelect,
        );
        return () => cancel();
    }, [shortcuts?.connected]);

    return (
        <Fragment>
            <h4>Tools</h4>
            <div className={style.tools}>
                {tools.map(tool => <ToolControl
                    key={tool.name}
                    tool={tool}
                    currentTool={current}
                    onSelect={onSelect}
                />)}
            </div>
        </Fragment>
    )
}

export default Tools;

function registerShortcuts(shortcuts: Shortcuts,
                           tools: Tool[],
                           getCurrent: () => Tool,
                           onSelect: <V extends Variant>(tool: Tool<V>, variant: V) => void): RegistrationHandle {
    const handles = tools.map(tool =>
        shortcuts.register(tool.selectionShortcuts, () => {
            onSelect(tool, tool === getCurrent() ? nextVariant(tool) : tool.variants[0]);
            return [];
        }));
    return {
        cancel: () => handles.forEach(({cancel}) => cancel())
    }
}
