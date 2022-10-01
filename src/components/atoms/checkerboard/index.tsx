import {h, RenderableProps} from 'preact'
import style from './style.css'

const Checkerboard = ({children}: RenderableProps<unknown>) => (
    <div className={style.checkerboard}>
        {children}
    </div>
);
export default Checkerboard;