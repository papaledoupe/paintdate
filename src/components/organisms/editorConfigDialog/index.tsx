import {h} from 'preact';
import Dialog from "../../molecules/dialog";
import StackView, {StackScreen} from "../../molecules/stackView";
import {EditorConfig} from "../../../config/editor";
import {useRef} from "react";
import {
    CheckboxVariantConfigItem,
    NumberVariantConfigItem,
    SelectVariantConfigItem,
    VectorVariantConfigItem
} from "../../molecules/configItem";
import {themes, withScheme} from "../../theme";
import TextButton from "../../atoms/textButton";
import style from './style.css';

const InvertTextButton = withScheme('secondary-on-primary', TextButton);

export type Props = {
    config: EditorConfig
    close(newConfig: EditorConfig | null): void
}
const EditorConfigDialog = ({close, config}: Props) => {
    const {current: stagedConfig} = useRef({...config});
    return (
        <Dialog
            closeOn={['shortcut', 'click-out']}
            close={confirmed => close(confirmed ? stagedConfig : null)}
        >
            <StackView
                start={'config'}
                screens={{
                    config: {
                        title: 'Editor configuration',
                        render({trail}) {
                            return (
                                <StackScreen trail={trail}>
                                    <SelectVariantConfigItem
                                        label='Theme'
                                        options={Object.entries(themes).map(([id, {name}]) => ({
                                            label: name,
                                            value: id,
                                        }))}
                                        read={() => stagedConfig.theme}
                                        write={theme => stagedConfig.theme = theme}
                                    />
                                    <NumberVariantConfigItem
                                        label='Scale'
                                        read={() => stagedConfig.scale}
                                        write={scale => { stagedConfig.scale = scale }}
                                    />
                                    <VectorVariantConfigItem
                                        label='Grid size'
                                        read={() => stagedConfig.grid}
                                        write={grid => { stagedConfig.grid = grid }}
                                    />
                                    <CheckboxVariantConfigItem
                                        label='Show coordinates'
                                        read={() => stagedConfig.showCoordinates}
                                        write={show => { stagedConfig.showCoordinates = show }}
                                    />
                                    <div className={style.save}>
                                        <InvertTextButton
                                            type='border'
                                            text='Save'
                                            onClick={() => close(stagedConfig)}
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
export default EditorConfigDialog;
