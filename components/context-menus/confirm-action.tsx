export default function ConfirmAction({ onConfirm = () => {} }: any) {
    return (
        <div className={`confirmAction`}>
            <div className={`confirmActionOption`} onClick={onConfirm}>
                <i style={{ color: `red` }} className={`fas fa-times`} />
                <span>Confirm</span>
            </div>
        </div>
    )
}