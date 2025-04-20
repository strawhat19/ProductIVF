// import _details.scss for styles

import { useContext } from 'react';
import ItemDetail from '../../boards/itemdetail';
import { StateContext } from '../../../pages/_app';

export default function Details({ className = `detailsElement` }: any) {
    let { selected } = useContext<any>(StateContext);
    return <>
        <div className={`detailsComponent ${className} ${selected?.tasks?.length >= 5 ? `overflowingTasks` : selected?.tasks?.length}`}>
            <ItemDetail 
                key={selected?.item?.meta?.updated} 
                item={selected?.item}
                board={selected?.board} 
                tasks={selected?.tasks} 
                column={selected?.column}
                index={selected?.itemIndex} 
                activeTasks={selected?.activeTasks} 
                completeTasks={selected?.completeTasks} 
            />
        </div>
    </>
}