export default function Title(props) {
    let { id, left, middle, itemID, item, right, className, buttonFunction } = props;
    return <>
        <div id={id} className={`${className} titleRow flex row`}>
            <div className="flex row innerRow">
                <div className="flex row left">
                    <h2>
                        {left}
                    </h2>
                </div>
                <div className="flex row middle" style={{textAlign: `center`}}>
                    <h4>
                        <i>{middle}</i>
                    </h4>
                </div>
                <div className="flex row right">
                    <h3>
                        {right}
                    </h3>
                    <div className="itemButtons customButtons">
                        <button id={`delete_${itemID}`} onClick={(e) => buttonFunction(e, item)} title={`Delete List`} className={`iconButton deleteButton`}>
                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                            <span className={`iconButtonText textOverflow extended`}>
                                Delete
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
}