import { useContext } from 'react';
import { StateContext } from '../../pages/_app';

export default function ContextMenu({menuRef, menuPosition}) {
    let { selected, setBoards, setMenuPosition } = useContext<any>(StateContext);
    let ids = (selected == null || selected?.column == undefined || selected?.column == null) ? [] : Array.from(selected?.column?.itemIds);

    const moveItemToPosition = (top = true) => {
        const itemIds = top == true ? [
            selected?.item?.id,
            ...selected?.column?.itemIds.filter(id => id != selected?.item?.id),
        ] : [
            ...selected?.column?.itemIds.filter(id => id != selected?.item?.id),
            selected?.item?.id,
        ]
        const updatedBoard = {
            ...selected?.board,
            columns: {
                ...selected?.board?.columns,
                [selected?.column?.id]: {
                    ...selected?.column,
                    itemIds,
                }
            }
        };
        setBoards(prevBoards => prevBoards.map(brd => brd.id == selected?.board?.id ? updatedBoard : brd));
        setMenuPosition(null);
    }

    return menuPosition && (
        <div
            ref={menuRef}
            className={`customContextMenu`}
            style={{
                padding: 0,
                zIndex: 1000,
                width: `auto`,
                border: `none`,
                borderRadius: 5,
                top: menuPosition.y,
                position: `absolute`,
                left: menuPosition.x,
                backdropFilter: `blur(5px)`,
                background: `rgba(0, 39, 53, 0.85)`,
                boxShadow: `2px 2px 5px rgba(0,0,0,0.2)`,
            }}
        >
            <ul className={`customContextMenuOptions`}>
               {ids?.indexOf(selected?.item?.id) > 0 && (
                   <li className={`customContextMenuOption flex gap15`} onClick={() => moveItemToPosition()}>
                        <i className={`fas fa-sort-amount-up`} style={{ color: `var(--gameBlueSoft)` }} /> <span>Move to Top of Column</span>
                    </li>
               )}
               {(ids?.indexOf(selected?.item?.id) < ids?.length - 1) && (
                   <li className={`customContextMenuOption flex gap15`} onClick={() => moveItemToPosition(false)}>
                        <i className={`fas fa-sort-amount-down`} style={{ color: `var(--gameBlueSoft)` }} /> <span>Move to Bottom of Column</span>
                    </li>
               )}
            </ul>
        </div>
    );
}