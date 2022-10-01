import {h, VNode} from 'preact';
import style from './style.css';
import SimpleGrid from "../../atoms/simpleGrid";
import {InvertButton} from "../../atoms/button";

export type Props<T> = {
    options: T[]
    addCustom?: () => void
    customIcon?: VNode
} & ({
    label(item: T | null): string
    icon(item: T | null): VNode | null
    allowNone: true
    select?: (item: T | null) => void
} | {
    label(item: T): string
    icon(item: T): VNode | null
    allowNone: false
    select?: (item: T) => void
})

type ItemProps = {
    label: string
    icon?: VNode
    click(): void
};

const Item = ({label, icon, click}: ItemProps) => (
    <div className={style.item}>
        <InvertButton onClick={() => click()}>
            {icon}
            <span className={style.itemName}>{label}</span>
        </InvertButton>
    </div>
);

export default function Selection<T>({options, addCustom, customIcon, allowNone, select, label, icon}: Props<T>) {
    const items: VNode[] = [
        ...(allowNone ? [<Item
            key='__none'
            label={label(null)}
            icon={icon(null) ?? undefined}
            click={() => select?.(null)}
        />] : []),
        ...options.map(item => <Item
            key={label(item)}
            label={label(item)}
            icon={icon(item) ?? undefined}
            click={() => select?.(item)}
        />),
        ...(addCustom ? [<Item
            key='__new_custom'
            label='New custom'
            click={() => addCustom()}
            icon={customIcon}
        />] : []),
    ];

    return (
        <SimpleGrid columns={2}>{items}</SimpleGrid>
    )
}
