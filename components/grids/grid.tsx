import { useContext } from 'react';
import Boards from '../boards/boards';
import { StateContext } from '../../pages/_app';

export default function Grid(props: any) {
    let { user, selectedGrids} = useContext<any>(StateContext);
    let { grid, grid_id = user != null ? user?.lastSelectedGridID : selectedGrids?.length > 0 ? selectedGrids[0]?.id : ``, className = `gridComponent` } = props;

    return (
        <div className={`grid userGrid ${className}`}>
            <Boards />
        </div>
    )
}