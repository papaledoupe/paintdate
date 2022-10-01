import {h} from 'preact';
import style from "./style.css";
import {ChangeEvent, useState} from "react";
import {Fill} from "../../../model/fill";
import FillSelectionDialog from "../../organisms/fillSelectionDialog";
import FillIcon from "../../atoms/fillIcon";
import {Stroke} from "../../../model/stroke";
import StrokeSelectionDialog from "../../organisms/strokeSelectionDialog";
import StrokeIcon from "../../atoms/strokeIcon";
import {v, Vector2} from "../../../model/space";
import {Color} from "../../../model/pixel";
import Button from "../../atoms/button";

export const SelectConfigItem = ({read, write, label, options}: {
    label: string
    options: {label: string, value: string}[]
    read(): string
    write(option: string): void
}) => (
    <div className={style.configItem}>
        <label>{label}</label>
        <select
            value={read()}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => { write(e.currentTarget.value) }}
        >
            {options.map(({label, value}) => <option key={value} value={value}>{label}</option>)}
        </select>
    </div>
);

export const CheckboxConfigItem = ({read, write, label}: {
    label: string
    read(): boolean
    write(checked: boolean): void
}) => (
    <div className={style.configItem}>
        <label>{label}</label>
        <input
            type='checkbox'
            checked={read()}
            onChange={e => write(e.currentTarget.checked)}
        />
    </div>
);

export const NumberConfigItem = ({read, write, label, max, min, step, size}: {
    label: string
    max?: number
    min?: number
    size?: number
    step?: number
    read(): number
    write(value: number): void
}) => (
    <div className={style.configItem}>
        <label>{label}</label>
        <input
            type='number'
            required={true}
            step={step ?? 1}
            min={min}
            max={max}
            value={read()}
            size={size ?? (`${max ?? ''}`.length || 3)}
            onChange={e => {
                const value = parseInt(e.currentTarget.value, 10);
                if (!isNaN(value)) write(value);
            }}
        />
    </div>
);

export const TextConfigItem = ({read, write, label}: {
    label: string
    read(): string
    write(value: string): void
}) => (
    <div className={style.configItem}>
        <label>{label}</label>
        <input
            type='text'
            value={read()}
            onChange={e => write(e.currentTarget.value)}
        />
    </div>
);


export const VectorConfigItem = ({read, write, label, xLabel, yLabel, max, min, step, size}: {
    label: string
    xLabel?: string
    yLabel?: string
    max?: Vector2
    min?: Vector2
    size?: Vector2
    step?: Vector2
    read(): Vector2
    write(value: Vector2): void
}) => (
    <div className={`${style.configItem} ${style.vector}`}>
        <label>{label}</label>
        <label className={style.dimension}>{xLabel ?? 'x'}</label>
        <input
            key='x'
            type='number'
            required={true}
            step={step?.x ?? 1}
            min={min?.x}
            max={max?.x}
            value={Math.round(read().x)}
            size={size?.x ?? (`${max?.x ?? ''}`.length || 3)}
            onChange={e => {
                const value = parseInt(e.currentTarget.value, 10);
                if (!isNaN(value)) write(v(value, read().y));
            }}
        />
        <label className={style.dimension}>{yLabel ?? 'y'}</label>
        <input
            key='y'
            type='number'
            required={true}
            step={step?.y ?? 1}
            min={min?.y}
            max={max?.y}
            value={Math.round(read().y)}
            size={size?.y ?? (`${max?.y ?? ''}`.length || 3)}
            onChange={e => {
                const value = parseInt(e.currentTarget.value, 10);
                if (!isNaN(value)) write(v(read().x, value));
            }}
        />
    </div>
);

export const OptionalFillConfigItem = ({ label = 'Fill', read, write, allowNone }: {
    label?: string
    allowNone?: boolean
    read(): Fill | null
    write(fill: Fill | null): void
}) => {
    const [fillSelectOpen, setFillSelectOpen] = useState<boolean>(false);
    const fill = read();
    return (
        <div className={style.configItem}>
            {fillSelectOpen && <FillSelectionDialog
                allowNone={allowNone ?? true}
                close={() => setFillSelectOpen(false)}
                select={(selection: Fill | null) => {
                    write(selection);
                    setFillSelectOpen(false)
                }}
            />}
            <label>{label}</label>
            <Button type='solid' onClick={() => setFillSelectOpen(true)}>
                <FillIcon height='18px' width='18px' fill={fill} />
                <span>{fill?.name ?? 'None'}</span>
            </Button>
        </div>
    );
}
export const FillConfigItem = (props: {
    label?: string
    read(): Fill
    write(fill: Fill): void
}) => {
    return <OptionalFillConfigItem {...props} allowNone={false} />
}

export const OptionalStrokeConfigItem = ({ label = 'Stroke', read, write, allowNone }: {
    label?: string
    allowNone?: boolean
    read(): Stroke | null
    write(stroke: Stroke | null): void
}) => {
    const [strokeSelectOpen, setStrokeSelectOpen] = useState<boolean>(false);
    const stroke = read();
    return (
        <div className={style.configItem}>
            {strokeSelectOpen && <StrokeSelectionDialog
                allowNone={allowNone ?? true}
                close={() => setStrokeSelectOpen(false)}
                select={(selection: Stroke | null) => {
                    write(selection);
                    setStrokeSelectOpen(false)
                }}
            />}
            <label>{label}</label>
            <Button type='solid' onClick={() => setStrokeSelectOpen(true)}>
                <StrokeIcon height='18px' width='18px' stroke={stroke} />
                <span>{stroke?.name ?? 'None'}</span>
            </Button>
        </div>
    );
}
export const StrokeConfigItem = (props: {
    label?: string
    read(): Stroke
    write(stroke: Stroke): void
}) => {
    return <OptionalStrokeConfigItem {...props} allowNone={false} />
}

export const ColorConfigItem = ({ label = 'Color', read, write }: {
    label?: string
    read(): Color
    write(color: Color): void
}) => (
    <div className={style.configItem}>
        <label>{label}</label>
        {(['black', 'white'] as Color[]).map(color => (
            <button
                key={color}
                className={`${style.colorOption} ${read() === color ? style.active : ''} ${style[color]}`}
                onClick={() => write(color)}
            />
        ))}
    </div>
);
