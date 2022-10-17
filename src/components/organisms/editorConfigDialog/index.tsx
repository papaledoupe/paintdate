import {h} from 'preact';
import Dialog from "../../molecules/dialog";
import StackView, {StackScreen} from "../../molecules/stackView";
import {EditorConfig} from "../../../config/editor";
import {useRef} from "react";
import {
    CheckboxConfigItem,
    NumberConfigItem,
    SelectConfigItem,
    VectorConfigItem
} from "../../molecules/configItem";
import {themes} from "../../theme";
import {InvertTextButton} from "../../atoms/textButton";
import style from './style.css';

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
                                    <SelectConfigItem
                                        label='Theme'
                                        options={Object.entries(themes).map(([id, {name}]) => ({
                                            label: name,
                                            value: id,
                                        }))}
                                        read={() => stagedConfig.theme}
                                        write={theme => stagedConfig.theme = theme}
                                    />
                                    <NumberConfigItem
                                        label='Scale'
                                        read={() => stagedConfig.scale}
                                        write={scale => { stagedConfig.scale = scale }}
                                    />
                                    <VectorConfigItem
                                        label='Grid size'
                                        read={() => stagedConfig.grid}
                                        write={grid => { stagedConfig.grid = grid }}
                                    />
                                    <CheckboxConfigItem
                                        label='Show coordinates'
                                        read={() => stagedConfig.showCoordinates}
                                        write={show => { stagedConfig.showCoordinates = show }}
                                    />
                                    <CheckboxConfigItem
                                        label='Crop exports'
                                        read={() => stagedConfig.cropExports}
                                        write={crop => { stagedConfig.cropExports = crop }}
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
