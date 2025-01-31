import { useContext } from 'react';
import { toast } from 'react-toastify';
import { StateContext } from '../../pages/_app';

export default function ContextMenu({menuRef, menuPosition}) {
    let { selected, setBoards, setMenuPosition, setItemTypeMenuOpen, setSelected } = useContext<any>(StateContext);
    let ids = (selected == null || selected?.column == undefined || selected?.column == null) ? [] : Array.from(selected?.column?.itemIds);

    const onDismiss = () => {
        setSelected(null);
        setMenuPosition(null);
        setItemTypeMenuOpen(false);
    }

    const onClose = () => {
        onDismiss();
    }

    const manageItemDetails = () => {
        onDismiss();
        toast.info(`In Development!`);
    }

    const onRightClick = () => {
        onDismiss();
    }

    const copyToClipBoard = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(selected?.item?.title);
            toast.success(`Copied to Clipboard`);
        }
        onDismiss();
    }

    // const showDefaultContextMenu = (event: React.MouseEvent) => {
    //     // onDismiss();
    //     setTimeout(() => {
    //       document.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: event.clientX, clientY: event.clientY }));
    //     }, 0);
    // };

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
        onDismiss();
    }

    return menuPosition && (
        <div
            ref={menuRef}
            className={`customContextMenu`}
            style={{
                padding: 0,
                zIndex: 1000,
                width: `auto`,
                minWidth: 170,
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
                <li className={`customContextMenuOption flex gap15`} onClick={() => onClose()}>
                    <i className={`fas fa-times`} style={{ color: `var(--gameBlueSoft)` }} /> <span>Close</span>
                </li>
                <li className={`customContextMenuOption flex gap15`} onClick={() => copyToClipBoard()}>
                    <i className={`fas fa-copy`} style={{ color: `var(--gameBlueSoft)` }} /> <span>Copy</span>
                </li>
                {/* <li className={`customContextMenuOption flex gap15`} onClick={() => manageItemDetails()}>
                    <i className={`fas fa-bars`} style={{ color: `var(--gameBlueSoft)` }} /> <span>Manage</span>
                </li> */}
               {ids?.indexOf(selected?.item?.id) > 0 && (
                    <li className={`customContextMenuOption flex gap15`} onClick={() => moveItemToPosition()}>
                        <i className={`fas fa-sort-amount-up`} style={{ color: `var(--gameBlueSoft)` }} /> <span>To Top</span>
                    </li>
                )}
                {(ids?.indexOf(selected?.item?.id) < ids?.length - 1) && (
                    <li className={`customContextMenuOption flex gap15`} onClick={() => moveItemToPosition(false)}>
                        <i className={`fas fa-sort-amount-down`} style={{ color: `var(--gameBlueSoft)` }} /> <span>To Bottom</span>
                    </li>
                )}
                {/* <li className={`customContextMenuOption flex gap15`} onClick={() => onRightClick()}>
                    <i className={`fas fa-mouse-pointer`} style={{ color: `var(--gameBlueSoft)` }} /> <span>Right Click</span>
                </li> */}
            </ul>
        </div>
    );
}