export default function ItemWrapper({ children, instanceType = `itemDetails`, cursorGrab = true }) {
    return (
        <div className={`${instanceType}_Board board lists`}>
            <div className={`${instanceType}_List column list`}>
                <div className={`${instanceType}_Items items boardColumnItems`}>
                    <div className={`${instanceType}_Tasks item boardItem ${cursorGrab ? `` : `cursorAuto`}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}