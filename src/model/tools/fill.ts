import {Color} from "../pixel";
import {Vector2} from "../space";
import {ConfigItem, CursorMode, fillConfigItem, Tool, Variant} from "../tool";
import {Fill as FillModel, solidFill} from "../fill";
import {Layer, replaceShapeCommand} from "../canvas";
import {Command} from "../history";
import {keys} from '../../config/editor';

class FillVariant implements Variant {
    readonly name = 'Fill';
    fill: FillModel = solidFill('black');

    readonly configs: ConfigItem[] = [
        fillConfigItem({
            read: () => this.fill,
            write: fill => { this.fill = fill },
        }),
    ]
}

export class Fill implements Tool<FillVariant> {
    readonly name = 'Fill';
    readonly icon = 'box';
    readonly variants: FillVariant[] = [new FillVariant()];

    variant = this.variants[0];
    virtualShapes = [];
    readonly selectionShortcuts = keys.fillTool.keystrokes;

    get cursorMode(): CursorMode {
        return {
            highlight: 'pixel',
            icon: 'box',
            iconColor: this.getColor(Vector2.zero) || undefined,
        };
    }

    private getColor(pos: Vector2): Color | null {
        return this.variant.fill.pixelColor(pos);
    }

    private started = false;

    onStart() {
        this.started = true;
    }

    onFinish(pos: Vector2, activeLayer: Layer | null): Command[] {
        if (!this.started) {
            return [];
        }
        this.started = false;

        if (activeLayer === null) {
            return [];
        }
        const target = activeLayer.topShapeAt(pos.sub(activeLayer.origin));
        if (target === null) {
            return [];
        }

        const shapeOrigin = activeLayer.origin.add(target.shape.origin);
        const fillShape = target.shape.shape.filled(pos.sub(shapeOrigin), this.variant.fill);
        if (fillShape === null) {
            return [];
        }

        return [replaceShapeCommand({
            layerName: activeLayer.name,
            index: target.index,
            shape: {
                ...target.shape,
                shape: fillShape,
                origin: target.shape.origin,
            },
        })];
    }

    set active(active: boolean) {
        // nothing to clear
    }
}
