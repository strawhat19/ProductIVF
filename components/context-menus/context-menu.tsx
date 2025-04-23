import { useContext } from 'react';
import { toast } from 'react-toastify';
import { StateContext } from '../../pages/_app';
import { addBoardScrollBars } from '../boards/board';
import { updateDocFieldsWTimeStamp } from '../../firebase';
// import { fontAwesomeIcons } from '../../shared/constants';

export default function ContextMenu({ menuRef, menuPosition, iconColor = `var(--gameBlue)` }: any) {
    let { selected, setMenuPosition, setItemTypeMenuOpen, setSelected } = useContext<any>(StateContext);
    let ids = (selected == null || selected?.column == undefined || selected?.column == null) ? [] : Array.from(selected?.column?.data?.itemIDs);

    const onDismiss = (setSelect = true) => {
        if (setSelect) setSelected(null);
        setMenuPosition(null);
        setItemTypeMenuOpen(false);
    }

    const onClose = () => {
        onDismiss();
    }

    // const onArchiveItem = (e) => {
    //     onDismiss();
    //     selected?.onArchiveItem(e);
    // }

    // const onCompleteItem = (e) => {
    //     onDismiss();
    //     selected?.onCompleteItem(e);
    // }

    // const onDeleteItem = (e) => {
    //     onDismiss();
    //     selected?.onDeleteItem(e);
    // }

    const sortTasks = () => {
        onDismiss();
        selected?.onSortItemTasks();
    }

    // const isActiveItem = () => {
    //     let isActive = selected?.item?.options?.active;
    //     let itemIsActive = selected?.item?.options?.active;
    //     let noTasks = selected?.item?.data?.taskIDs?.length == 0;
    //     let hasTasks = selected?.item?.data?.taskIDs?.length > 0;
    //     isActive = (itemIsActive && noTasks) || hasTasks;
    //     return isActive;
    // }

    // const onRightClick = () => {
    //     onDismiss();
    //     selected?.onDefaultRightClick();
    // }

    const copyToClipBoard = () => {
        if (navigator.clipboard) {
            let textToCopy = selected?.item?.name;
            navigator.clipboard.writeText(textToCopy);
            toast.success(`Copied to Clipboard`);
        }
        onDismiss();
    }

    const setItemTaskForm = async (taskFormShowing) => {
        onDismiss();
        await updateDocFieldsWTimeStamp(selected?.item, { [`options.showTaskForm`]: !taskFormShowing });
    }

    const moveItemToPosition = async (top = true) => {
        const itemIDsWithoutItem = selected?.column?.data?.itemIDs.filter(id => id != selected?.item?.id);
        const itemIDsWithItemMovedToTop = [ selected?.item?.id, ...itemIDsWithoutItem ];
        const itemIDsWithItemMovedToBottom = [ ...itemIDsWithoutItem, selected?.item?.id ];
        const updatedListItemIDs = top == true ? itemIDsWithItemMovedToTop : itemIDsWithItemMovedToBottom;
        onDismiss();
        await updateDocFieldsWTimeStamp(selected?.column, { [`data.itemIDs`]: updatedListItemIDs });
        addBoardScrollBars();
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
                <li title={selected?.item?.name} className={`menuTitleRow customContextMenuOption flex gap15 disabledOption`} onClick={() => onClose()}>
                    <span style={{ maxWidth: 120 }} className={`textOverflow`}>
                        {selected?.item?.name?.toUpperCase()}
                    </span>
                </li>
                <li className={`customContextMenuOption flex gap15`} onClick={() => onClose()}>
                    <i className={`fas fa-times`} style={{ color: iconColor }} /> <span>Close</span>
                </li>
                <li className={`customContextMenuOption flex gap15`} onClick={() => setItemTaskForm(selected?.item?.options?.showTaskForm)}>
                    <i className={`fas ${selected?.item?.options?.showTaskForm ? `fa-minus` : `fa-plus`}`} style={{ color: iconColor, fontSize: selected?.item?.options?.showTaskForm ? 14 : undefined }} /> <span>{selected?.item?.options?.showTaskForm ? `` : ``}Tasks</span>
                </li>
                <li className={`customContextMenuOption flex gap15`} onClick={() => sortTasks()}>
                    <i className={`fas fa-sort`} style={{ color: iconColor, fontSize: 20 }} /> <span>Sort</span>
                </li>
                <li className={`customContextMenuOption flex gap15`} onClick={() => copyToClipBoard()}>
                    <i className={`fas fa-copy`} style={{ color: iconColor }} /> <span>Copy</span>
                </li>
                {ids?.indexOf(selected?.item?.id) > 0 && (
                    <li className={`customContextMenuOption flex gap15`} onClick={() => moveItemToPosition()}>
                        <i className={`fas fa-sort-amount-up`} style={{ color: iconColor }} /> <span>To Top</span>
                    </li>
                )}
                {(ids?.indexOf(selected?.item?.id) < ids?.length - 1) && (
                    <li className={`customContextMenuOption flex gap15`} onClick={() => moveItemToPosition(false)}>
                        <i className={`fas fa-sort-amount-down`} style={{ color: iconColor }} /> <span>To Bottom</span>
                    </li>
                )}
                {/* {devEnv && (
                    <li className={`customContextMenuOption flex gap15`} onClick={onArchiveItem}>
                        <i className={`archivedIcon ${fontAwesomeIcons.folder}`} style={{ color: iconColor }} /> <span>Archive</span>
                    </li>
                )} */}
                {/* <li className={`customContextMenuOption flex gap15`} onClick={onManageItem}>
                    <i className={`fas fa-bars`} style={{ color: iconColor }} /> <span>Manage</span>
                </li>
                <li className={`customContextMenuOption flex gap15`} onClick={onCompleteItem}>
                    <i className={`contextMenuIcon ${selected?.item?.options?.complete ? `fas fa-history` : isActiveItem() ? `fas fa-check-circle` : `fas fa-play-circle`}`} style={{ color: iconColor }} /> <span>{selected?.item?.options?.complete ? `Open` : isActiveItem() ? `Complete` : `Active`}</span>
                </li>
                <li className={`customContextMenuOption flex gap15`} onClick={onDeleteItem}>
                    <i className={`fas fa-trash`} style={{ color: iconColor }} /> <span>Delete</span>
                </li> */}
                {/* <li className={`customContextMenuOption flex gap15`} onClick={() => onRightClick()}>
                    <i className={`fas fa-mouse-pointer`} style={{ color: iconColor }} /> <span>Right Click</span>
                </li> */}
            </ul>
        </div>
    );
}