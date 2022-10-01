import {h} from 'preact';
import Dialog from "../../molecules/dialog";
import StackView, {ScreenProps, StackScreen} from "../../molecules/stackView";
import {builtIn, Fill} from "../../../model/fill";
import Selection from "../../molecules/selection";
import FillIcon from "../../atoms/fillIcon";
import CustomFill from "../customFill";
import {useContext} from "react";
import {EditorConfigContext} from "../../../config/editor";

export type Props = {
    close(): void
} & ({
    allowNone: true
    select(selection: Fill | null): void
} | {
    allowNone: false
    select(selection: Fill): void
});

const FillSelectionDialog = (props: Props) => {
    return (
        <Dialog
            closeOn={['shortcut', 'click-out']}
            close={() => props.close()}
        >
            <StackView
                start={'select'}
                screens={{
                    select: {
                        title: 'Select fill',
                        render: (screenProps) => <SelectFillScreen {...screenProps} {...props} />,
                    },
                    custom: {
                        title: 'New custom',
                        render: CustomFillScreen,
                    },
                }}
            />
        </Dialog>
    )
}
export default FillSelectionDialog;

const CustomFillScreen = ({trail, popScreen}: ScreenProps) => {
    const {config: {customFills}, configure} = useContext(EditorConfigContext);
    return (
        <StackScreen trail={trail}>
            <CustomFill
                suggestedName={`Custom ${customFills.length + 1}`}
                create={fill => {
                    configure({ customFills: [...customFills, fill] });
                    popScreen();
                }}
            />
        </StackScreen>
    )
}

const SelectFillScreen = ({trail, pushScreen, allowNone, select}: ScreenProps & Props) => {
    const {config} = useContext(EditorConfigContext);
    return (
        <StackScreen trail={trail}>
            <Selection<Fill>
                options={[
                    ...builtIn,
                    ...config.customFills,
                ]}
                label={(f: Fill | null) => f?.name ?? 'None'}
                icon={(f: Fill | null) => <FillIcon fill={f} />}
                allowNone={allowNone}
                addCustom={() => pushScreen('custom')}
                customIcon={<FillIcon fill={null} />}
                select={(fill: Fill | null) => {
                    if (allowNone || fill !== null) {
                        // @ts-ignore
                        select(fill);
                    }
                }}
            />
        </StackScreen>
    )
}
