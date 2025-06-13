export default function Avatar({ name }) {
    const getNameInitials = (nm) => {
        return nm?.slice(0,2)?.toUpperCase();
    }
    return (
        <div className={`avatarComponent`}>
            {getNameInitials(name)}
        </div>
    )
}