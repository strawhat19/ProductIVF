import { useContext } from 'react';
import { StateContext } from '../pages/_app';

export default function Footer(props) {
    let { style } = props;
    let { year } = useContext<any>(StateContext);
    return (
        <footer style={style}>
            {/* {rte == `_messages` ? <>
                <form className={`chatForm`}>
                    <input type={`text`} name={`message`} placeholder={`Enter Message...`} />
                </form>
            </> : <> */}
                <div className={`left`}>
                    <a className={`hoverLink`} href={`/`}>
                        Home  <i className={`fas fa-undo`} />
                    </a>
                </div>
                <div className={`right`}>
                    <a id={`footer-piratechs-link`} className={`footerPiratechsLink hoverLink`} href={`https://piratechs.com/`}>
                        {`Piratechs`}
                    </a>
                    <i className={`fas fa-copyright`} /> {year}
                </div>
            {/* </>} */}
        </footer>
    )
}
