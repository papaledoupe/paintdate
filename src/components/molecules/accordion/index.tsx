import {h, VNode} from 'preact';
import {useCallback, useState} from "react";
import style from './style.css';

export type Section = {
    title: string
    render(): VNode
}

export type Props = {
    start?: string
    sections: Section[]
}

const Accordion = ({start, sections}: Props) => {
    const [current, setCurrent] = useState<string | undefined>(start);
    const open = useCallback((title: string) => setCurrent(title), []);

    return (
        <div className={style.stack}>
        {sections.map(section => current === section.title
            ? <Open section={section} />
            : <Closed section={section} open={open} />)}
        </div>
    );
}
export default Accordion;

const Closed = ({section, open}: {section: Section, open(title: string): void}) => (
    <div className={`${style.item} ${style.closed}`} onClick={() => open(section.title)}>
        <header>{section.title}</header>
    </div>
);
const Open = ({section}: {section: Section}) => (
    <div className={`${style.item} ${style.open}`}>
        <header>{section.title}</header>
        <section>
            {section.render()}
        </section>
    </div>
);
