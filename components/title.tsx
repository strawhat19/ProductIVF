export default function Title(props) {
    return <>
        <div id={props.id} className={`${props.className} titleRow flex row`}>
            <div className="flex row innerRow">
                <div className="flex row left">
                    <h2>{props.left}</h2>
                </div>
                <div className="flex row middle" style={{textAlign: `center`}}>
                    <h4><i>{props.middle}</i></h4>
                </div>
                <div className="flex row right">
                    <h3>{props.right}</h3>
                    <div className="itemButtons customButtons">
                        <button id={`delete_${props.itemID}`} onClick={(e) => props.buttonFunction(e, props.item)} title={`Delete List`} className={`iconButton deleteButton`}>
                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                            <span className={`iconButtonText textOverflow extended`}>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
}