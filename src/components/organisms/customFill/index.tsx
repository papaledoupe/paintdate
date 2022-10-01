import {Fragment, h, VNode} from 'preact';
import {Fill, patternFill} from "../../../model/fill";
import Accordion from "../../molecules/accordion";
import {TextConfigItem} from "../../molecules/configItem";
import {Pattern as PlaydatePattern} from "../../../model/playdate/pattern";
import {useState} from "react";
import {InvertTextButton} from "../../atoms/textButton";
import style from './style.css';
import Checkerboard from "../../atoms/checkerboard";
import FillIcon from "../../atoms/fillIcon";

export type Props = {
    suggestedName: string
    create(fill: Fill): void
}

const CustomFill = (props: Props) => {
    return (
        <Accordion
            start='Draw pattern'
            sections={[
                {
                    title: 'Draw pattern',
                    render(): VNode {
                        return <span>TODO</span>
                    }
                },
                {
                    title: 'Import Playdate pattern table',
                    render: () => <ImportGFXP {...props} />
                },
            ]}
        />
    )
}
export default CustomFill;

type ImportGFXPState = {
    name: string
    pattern: string
}
const ImportGFXP = ({suggestedName, create}: Props) => {
    const [{name, pattern}, setState] = useState<ImportGFXPState>({
        name: suggestedName,
        pattern: '{0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0}',
    })

    let fill: Fill | null = null;
    const patt = PlaydatePattern.fromTable(pattern);
    if (patt !== null) {
        fill = patternFill(name, patt.grid);
    }

    return (
        <Fragment>
            <Preview fill={fill} />
            <TextConfigItem
                label='Name'
                read={() => name}
                write={name => setState(s => ({...s, name}))}
            />
            <TextConfigItem
                label='Pattern'
                read={() => pattern}
                write={pattern => setState(s => ({ ...s, pattern }))}
            />
            <div className={style.submit}>
                <InvertTextButton
                    text='Import'
                    onClick={fill === null ? undefined : () => fill && create(fill)}
                />
            </div>
        </Fragment>
    )
}

const Preview = ({fill}: {fill: Fill | null}) => {
    return (
        <Checkerboard>
            <div className={style.preview}>
                <FillIcon
                    width='40px'
                    height='40px'
                    fill={fill}
                />
            </div>
        </Checkerboard>
    )
}