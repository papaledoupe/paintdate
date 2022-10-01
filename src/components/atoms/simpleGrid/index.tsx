import {h, FunctionalComponent, Fragment} from "preact";
import {chunkArray} from "../../../util/array";
import style from './style.css';

export type Props = {
    columns: number
}

const SimpleGrid: FunctionalComponent<Props> = ({children, columns}) => (
    <Fragment>{chunkArray(Array.isArray(children) ? children : [children], columns).map((row, rowNum) => (
        <div
            key={rowNum}
            className={style.row}
        >
            {[...new Array(columns)].map((_, i) => row[i] ?? null).map((child, colNum) => {
                const last = colNum === columns - 1;
                return (
                    <div
                        key={`${rowNum}.${colNum}`}
                        className={`${style.column} ${last ? style.last : ''}`}
                        style={{width: `${Math.floor(100 / columns)}%`}}
                    >
                        {child}
                    </div>
                );
            })}
        </div>
    ))}</Fragment>
);
export default SimpleGrid;
