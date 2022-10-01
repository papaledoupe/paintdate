import {Fragment, h, VNode} from 'preact';
import Accordion from "../../molecules/accordion";
import {ColorConfigItem, NumberConfigItem, TextConfigItem} from "../../molecules/configItem";
import {useState} from "react";
import {InvertTextButton} from "../../atoms/textButton";
import style from './style.css';
import {dashedStroke, Stroke} from "../../../model/stroke";
import {Color} from "../../../model/pixel";
import StrokeIcon from "../../atoms/strokeIcon";
import Checkerboard from "../../atoms/checkerboard";

export type Props = {
    suggestedName: string
    create(stroke: Stroke): void
}

const CustomStroke = (props: Props) => {
    return (
        <Accordion
            start='Custom dashed'
            sections={[
                {
                    title: 'Custom dashed',
                    render: () => <CustomDashed {...props} />
                },
                {
                    title: 'Custom sequence',
                    render(): VNode {
                        return <span>TODO</span>
                    }
                },
                {
                    title: 'From fill',
                    render(): VNode {
                        return <span>TODO</span>
                    }
                },
            ]}
        />
    )
}
export default CustomStroke;

type CustomDashedState = {
    name: string
    color: Color
    length: number
    space: number
}
const CustomDashed = ({suggestedName, create}: Props) => {
    const [{name, color, length, space}, setState] = useState<CustomDashedState>({
        name: suggestedName,
        color: 'black',
        length: 1,
        space: 1,
    });
    const stroke = dashedStroke(name, color, length, space);

    return (
        <Fragment>
            <Preview stroke={stroke} />
            <TextConfigItem
                label='Name'
                read={() => name}
                write={name => setState(s => ({...s, name}))}
            />
            <ColorConfigItem
                label='Pattern'
                read={() => color}
                write={color => setState(s => ({ ...s, color }))}
            />
            <NumberConfigItem
                label='Dash length'
                min={1}
                read={() => length}
                write={length => setState(s => ({ ...s, length }))}
            />
            <NumberConfigItem
                label='Dash spacing'
                min={1}
                read={() => space}
                write={space => setState(s => ({ ...s, space }))}
            />
            <div className={style.submit}>
                <InvertTextButton
                    text='Create'
                    onClick={() => create(stroke)}
                />
            </div>
        </Fragment>
    )
}

const Preview = ({stroke}: {stroke: Stroke}) => {
    return (
        <Checkerboard>
            <div className={style.preview}>
                <StrokeIcon
                    width='40px'
                    height='40px'
                    stroke={stroke}
                />
            </div>
        </Checkerboard>
    )
}
