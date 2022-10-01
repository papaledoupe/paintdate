import {h} from 'preact';
import Dialog from "../../molecules/dialog";
import StackView, {ScreenProps, StackScreen} from "../../molecules/stackView";
import {builtIn, Stroke} from "../../../model/stroke";
import Selection from "../../molecules/selection";
import StrokeIcon from "../../atoms/strokeIcon";
import CustomStroke from "../customStroke";
import {useContext} from "react";
import {EditorConfigContext} from "../../../config/editor";

export type Props = {
    close(): void
} & ({
    allowNone: false
    select(selection: Stroke): void
} | {
    allowNone: true
    select(selection: Stroke | null): void
});

const StrokeSelectionDialog = (props: Props) => {
    return (
        <Dialog
            closeOn={['shortcut', 'click-out']}
            close={() => props.close()}
        >
            <StackView
                start={'select'}
                screens={{
                    select: {
                        title: 'Select stroke',
                        render: (screenProps) => <SelectStrokeScreen {...screenProps} {...props} />,
                    },
                    custom: {
                        title: 'New custom',
                        render: CustomStrokeScreen,
                    },
                }}
            />
        </Dialog>
    )
}
export default StrokeSelectionDialog;

const CustomStrokeScreen = ({trail, popScreen}: ScreenProps) => {
    const {config: {customStrokes}, configure} = useContext(EditorConfigContext);
    return (
        <StackScreen trail={trail}>
            <CustomStroke
                suggestedName={`Custom ${customStrokes.length + 1}`}
                create={fill => {
                    configure({customStrokes: [...customStrokes, fill]});
                    popScreen();
                }}
            />
        </StackScreen>
    );
}

const SelectStrokeScreen = ({trail, pushScreen, allowNone, select}: ScreenProps & Props) => {
    const {config: {customStrokes}} = useContext(EditorConfigContext);
    return (
        <StackScreen trail={trail}>
            <Selection<Stroke>
                options={[
                    ...builtIn,
                    ...customStrokes,
                ]}
                label={(s: Stroke | null) => s?.name ?? 'None'}
                icon={(s: Stroke | null) => <StrokeIcon stroke={s} />}
                addCustom={() => pushScreen('custom')}
                customIcon={<StrokeIcon stroke={null} />}
                allowNone={allowNone}
                select={(stroke: Stroke | null) => {
                    if (allowNone || stroke !== null) {
                        // @ts-ignore
                        select(stroke);
                    }
                }}
            />
        </StackScreen>
    );
}
