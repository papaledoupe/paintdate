import {h} from 'preact';
import Dialog from "../../molecules/dialog";
import StackView, {StackScreen} from "../../molecules/stackView";
import {useRef} from "react";
import {CheckboxConfigItem, VectorConfigItem} from "../../molecules/configItem";
import {CanvasSettings} from "../../../model/canvas";
import style from "../editorConfigDialog/style.css";
import {InvertTextButton} from "../../atoms/textButton";

export type Props = {
    settings: CanvasSettings
    close(newSettings: CanvasSettings | null): void
}
const CanvasSettingsDialog = ({close, settings}: Props) => {
    const {current: stagedSettings} = useRef({...settings});
    return (
        <Dialog
            closeOn={['shortcut', 'click-out']}
            close={confirmed => close(confirmed ? stagedSettings : null)}
        >
            <StackView
                start={'settings'}
                screens={{
                    settings: {
                        title: 'Canvas settings',
                        render({trail}) {
                            return (
                                <StackScreen trail={trail}>
                                    <VectorConfigItem
                                        label='Size'
                                        xLabel={'W'}
                                        yLabel={'H'}
                                        read={() => stagedSettings.size}
                                        write={size => {
                                            stagedSettings.size = size
                                        }}
                                    />
                                    <CheckboxConfigItem
                                        label='Automatically merge freeform shapes'
                                        read={() => stagedSettings.mergeFreeform}
                                        write={merge => {
                                            stagedSettings.mergeFreeform = merge
                                        }}
                                    />
                                    <CheckboxConfigItem
                                        label='Loop'
                                        read={() => stagedSettings.loop}
                                        write={loop => {
                                            stagedSettings.loop = loop
                                        }}
                                    />
                                    <div className={style.save}>
                                        <InvertTextButton
                                            type='border'
                                            text='Save'
                                            onClick={() => close(stagedSettings)}
                                        />
                                    </div>
                                </StackScreen>
                            )
                        }
                    },
                }}
            />
        </Dialog>
    )
}
export default CanvasSettingsDialog;
