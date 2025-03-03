import { useContext } from 'react';
import { StateContext } from '../pages/_app';

export default function Footer(props) {
    let { style } = props;
    let { year } = useContext<any>(StateContext);
    return (
        <footer style={style}>
            <div className={`left`}>
                <a className={`hoverLink`} href={`/`}>
                    Home  <i className={`fas fa-undo`} />
                </a>
            </div>
            <div className={`right`}>
                Piratechs <i className={`fas fa-copyright`} /> {year}
            </div>
        </footer>
    )
}