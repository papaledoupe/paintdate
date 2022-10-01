import {h} from 'preact';
import Dialog from "../../molecules/dialog";
import StackView, {StackScreen} from "../../molecules/stackView";
import {builtIn, Stroke} from "../../../model/stroke";
import Selection from "../../molecules/selection";
import StrokeIcon from "../../atoms/strokeIcon";

export type Props = {
    close(): void
} & ({
    allowNone: false
    select(selection: Stroke): void
} | {
    allowNone: true
    select(selection: Stroke | null): void
});

const StrokeSelectionDialog = ({select, close, allowNone}: Props) => {
    return (
        <Dialog
            closeOn={['shortcut', 'click-out']}
            close={() => close()}
        >
            <StackView
                start={'select'}
                screens={{
                    select: {
                        title: 'Select stroke',
                        render: ({pushScreen, trail}) => (
                            <StackScreen trail={trail}>
                                <Selection<Stroke>
                                    options={[
                                        ...builtIn,
                                        //...customs,
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
                        ),
                    },
                    custom: {
                        title: 'New custom',
                        render: ({trail}) => (
                            <StackScreen trail={trail}>
                                <p>TODO</p>
                            </StackScreen>
                        ),
                    },
                }}
            />
        </Dialog>
    )
}
export default StrokeSelectionDialog;
