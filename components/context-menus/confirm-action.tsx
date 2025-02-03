export default function ConfirmAction({ 
    textOnly = false, 
    iconOnly = false, 
    onConfirm = () => { }, 
    confirmationText = `Confirm`,
    clickableStyle = { opacity: 1 }, 
    style = { right: 0, bottom: 40 }, 
}: any) {
    return (
        <div className={`confirmAction`} style={style}>
            <div className={`confirmActionOption`} onClick={onConfirm} style={clickableStyle}>
                {!textOnly && (
                    <i style={{ color: `red`, pointerEvents: `none` }} className={`fas fa-times`} />
                )}
                {!iconOnly && (
                    <span style={{ pointerEvents: `none` }}>
                        {confirmationText}
                    </span>
                )}
            </div>
        </div>
    )
}