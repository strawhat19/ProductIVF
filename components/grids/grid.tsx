import Boards from '../boards/boards';

export default function Grid(props: any) {
    let { className = `gridComponent` } = props;
    return (
        <div className={`grid userGrid ${className}`}>
            <Boards />
        </div>
    )
}