import {h} from 'preact';
import Dialog from "../../molecules/dialog";
import StackView, {StackScreen} from "../../molecules/stackView";
import {builtIn, Fill} from "../../../model/fill";
import Selection from "../../molecules/selection";
import FillIcon from "../../atoms/fillIcon";

export type Props = {
    close(): void
} & ({
    allowNone: true
    select(selection: Fill | null): void
} | {
    allowNone: false
    select(selection: Fill): void
});

const FillSelectionDialog = ({select, allowNone, close}: Props) => {
    return (
        <Dialog
            closeOn={['shortcut', 'click-out']}
            close={() => close()}
        >
            <StackView
                start={'select'}
                screens={{
                    select: {
                        title: 'Select fill',
                        render({pushScreen, trail}) {
                            return (
                                <StackScreen trail={trail}>
                                    <Selection<Fill>
                                        options={[
                                            ...builtIn,
                                            // ...customs,
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
                    },
                    custom: {
                        title: 'New custom',
                        render({trail}) {
                            return (
                                <StackScreen trail={trail}>
                                    <p>TODO</p>
                                </StackScreen>
                            )
                        }
                    },
                }}
            />
        </Dialog>
    )
}
export default FillSelectionDialog;
