export default function Footer(props) {
    let { style } = props;
    return (
        <footer style={style}>
            <div className={`left`}>
                <a className={`hoverLink`} href={`/`}>
                    Home  <i className={`fas fa-undo`} />
                </a>
            </div>
            <div className={`right`}>
                 Piratechs <i className={`fas fa-copyright`} />2023
            </div>
        </footer>
    )
}