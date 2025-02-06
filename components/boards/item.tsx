import Progress from '../progress';
import { ItemTypes } from './boards';
import ItemDetail from './itemdetail';
import CustomImage from '../custom-image';
import ConfirmAction from '../context-menus/confirm-action';
import React, { useContext, useEffect, useState } from 'react';
import { showAlert, formatDate, dev, StateContext, capitalizeAllWords } from '../../pages/_app';
import { forceFieldBlurOnPressEnter, removeExtraSpacesFromString } from '../../shared/constants';

export const getTaskPercentage = (tasks: any[]) => {
    let tasksProgress = 0;
    let completeTasks = tasks.filter(task => task.complete);
    tasksProgress = parseFloat(((completeTasks.length / tasks.length) * 100).toFixed(1));
    return tasksProgress;
}

export const getSubTaskPercentage = (subtasks: any[], item, isActive = null) => {
    if (item?.complete) return 100;
    if (subtasks.length == 0) {
        if (isActive != null) return item?.complete ? 100 : (isActive == true ? 0 : 100);
        else return item?.complete ? 100 : 0;
    };
    let subtasksProgress = 0;
    let completeTasks = subtasks.filter(task => task.complete);
    subtasksProgress = parseFloat(((completeTasks.length / subtasks.length) * 100).toFixed(1));
    return subtasksProgress;
}

export const getTypeIcon = (type, plain?) => {
    switch (type) {
        default:
            return `+`;
        case ItemTypes.Task:
            if (plain) {
                return `✔`
            } else {
                return (
                    <span style={{fontSize: 20, textAlign: `center`}}>
                        ✔
                    </span>
                );
            }
        case ItemTypes.Image:
            return <i style={{display: `contents`}} className={`fas fa-image`} />;
        case ItemTypes.Video:
            return <i style={{display: `contents`}} className={`fab fa-youtube`} />;
    }
}

export const manageItem = (e, item, index, board, boards, setBoards) => {
    if (!e.target.classList.contains(`changeLabel`) && !e.target.classList.contains(`confirmActionOption`)) {
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            let isManageButton = e.target.classList.contains(`manageButton`);
            if (isManageButton) {
                dev() && console.log(`Item ${index + 1}`, item);
                showAlert(item?.content, <ItemDetail item={item} index={index} board={board} boards={boards} setBoards={setBoards} />, `95%`, `85%`, `30px`);
            };
        } else {
            dev() && console.log(`Item ${index + 1}`, item);
            showAlert(item?.content, <ItemDetail item={item} index={index} board={board} boards={boards} setBoards={setBoards} />, `95%`, `85%`, `30px`);
        }
    }
}

export default function Item({ item, count, column, itemIndex, board, setBoard }: any) {
    let [showConfirm, setShowConfirm] = useState(false);
    let { 
        boards, 
        menuRef, 
        setBoards, 
        setLoading, 
        setSelected, 
        setSystemStatus, 
        setMenuPosition, 
        setItemTypeMenuOpen, 
    } = useContext<any>(StateContext);

    const changeLabel = (e, item) => {
        let elemValue = e.target.textContent;
        let value = elemValue == `` ? capitalizeAllWords(item.task) : capitalizeAllWords(elemValue);
        if (!elemValue || elemValue == ``) {
            elemValue = capitalizeAllWords(item.task);
            return;
        };

        elemValue = removeExtraSpacesFromString(value);
        elemValue = capitalizeAllWords(elemValue);

        e.target.innerHTML = elemValue;
        item.title = elemValue;
        item.content = elemValue;
        item.updated = formatDate(new Date());

        localStorage.setItem(`boards`, JSON.stringify(boards));
    }

    const completeActions = (item, itemId, isButton) => {
        if (count == 0) {
            setLoading(true);
            setSystemStatus(`Marking Item as Complete.`);

            board.items[itemId].updated = formatDate(new Date());
            board.items[itemId].complete = !board.items[itemId].complete;

            setBoard({
                ...board,
                updated: formatDate(new Date()),
                items: {
                    ...board.items
                },
            });

            setTimeout(() => {
                setSystemStatus(item.complete ? `Marked Item as Complete.` : `Reopened Item.`);
                setLoading(false);
            }, 1000);
            if (isButton) count = count + 1;
        }
    }

    const completeItem = (e, item) => {
        let button = e.target;
        let isButton = button.classList.contains(`iconButton`);
        if (isButton) {
            let completeButton = button.classList.contains(`completeButton`);
            if (!completeButton) return;
        }
        if (!e.target.classList.contains(`changeLabel`)) {
            completeActions(item, item?.id, isButton);
        }
    }

    const deleteItemLogic = (columnId, index, itemId) => {
        const column = board.columns[columnId];
        const newItemIds = Array.from(column.itemIds);
        newItemIds.splice(index, 1);

        const items = board.items;
        const { [itemId]: oldItem, ...newItems } = items;

        setBoard({
            ...board,
            updated: formatDate(new Date()),
            items: {
                ...newItems
            },
            columns: {
                ...board.columns,
                [columnId]: {
                    ...column,
                    itemIds: newItemIds
                }
            }
        });
    }

    const finallyDeleteItem = (columnId, index, itemId) => {
        setLoading(true);
        setSystemStatus(`Deleting Item.`);
        
        deleteItemLogic(columnId, index, itemId);

        setTimeout(() => {
            setSystemStatus(`Deleted Item ${item.content}.`);
            setLoading(false);
        }, 1000);  
    }

    const deleteItem = (e, item, columnId, index, itemId, initialConfirm = true) => {
        let allowedDeletionSelectors = [`iconButton`, `confirmActionOption`, `customContextMenuOption`];
        let isButton = allowedDeletionSelectors.some(className => e?.target?.classList.contains(className));
        if (isButton) {
            e.preventDefault();
            if (showConfirm == true) {
                if (!initialConfirm) {
                    finallyDeleteItem(columnId, index, itemId);
                }
                setShowConfirm(false);
            } else {
                if (item?.subtasks?.length > 0) {
                    setShowConfirm(true);
                } else {
                    finallyDeleteItem(columnId, index, itemId);
                }
            }
        }
    }

    const onDeleteItem = (e) => {
        deleteItem(e, item, column.id, itemIndex, item.id);
    }
    
    const onCompleteItem = (e) => {
        completeItem(e, item);
    }

    const onManageItem = (e) => {
        manageItem(e, item, itemIndex, board, boards, setBoards);
    }

    const onRightClick = (e: React.MouseEvent<HTMLDivElement>, item, column) => {
        e.preventDefault();
        setItemTypeMenuOpen(true);
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setSelected({item, column, board, onManageItem, onCompleteItem, onDeleteItem});
    }
    
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef?.current && !menuRef?.current?.contains(event?.target as Node)) {
            setSelected(null);
            setMenuPosition(null);
            setItemTypeMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener(`click`, handleClickOutside);
        return () => document.removeEventListener(`click`, handleClickOutside);
    }, []);

    return <>
        <div id={`itemElement_${item.id}`} className={`itemComponent itemInnerRow flex row`} onContextMenu={(e) => onRightClick(e, item, column)}>
            <span className={`itemOrder rowIndexOrder`}>
                <i className={`itemIndex ${item.complete ? `completedIndex` : `activeIndex`}`}>
                    {(item?.type == ItemTypes.Item || item?.type == ItemTypes.Task) && (
                        <span className={`itemIconType ${item?.type}`}>
                            {getTypeIcon(item?.type, true)}
                        </span>
                    )} {itemIndex + 1}
                </i>
            </span>
            {item?.image && (
                <CustomImage className={`itemImage boardItemImage`} src={item?.image} alt={item?.content} useLazyLoad={true} />
            )}
            <div className={`itemContents`}>
                <span className={`flex row itemContent boardItemContent itemName textOverflow extended`}>
                    {/* <textarea onBlur={(e) => changeLabel(e, item)} className={`changeLabel`} defaultValue={item.content} /> */}
                    <span 
                        contentEditable 
                        spellCheck={false}
                        suppressContentEditableWarning 
                        onBlur={(e) => changeLabel(e, item)} 
                        className={`changeLabel stretchEditable`}
                        onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
                    >
                        {item.content}
                    </span>
                    {/* {item.subtasks.length > 0 && (
                        <div className="progress">
                            <div className="progressBar" style={{clipPath: `polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)`}}></div>
                        </div>
                    )} */}
                </span>
                {/* {devEnv && wordInCategories(item) && <span className="itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-hashtag"></i> 
                    <span className={`itemDateTime`}>
                        {wordOfCategory(item)}
                    </span>
                </span>} */}
                {(item?.image || column?.details && column?.details == true) ? <>
                    <hr className={`itemSep`} style={{height: 1, borderColor: `var(--gameBlue)`}} />
                    <div className={`itemFooter flex row`}>
                        {item.created && !item.updated ? (
                        <span className={`itemDate itemName itemCreated textOverflow extended flex row`}>
                            <i className={`status`}>Cre.</i> 
                            <span className={`itemDateTime`}>
                                {formatDate(new Date(item.created))}
                            </span>
                        </span>
                        ) : item.updated ? (
                        <span className={`itemDate itemName itemCreated itemUpdated textOverflow extended flex row`}>
                            <i className={`status`}>Upd.</i> 
                            <span className={`itemDateTime`}>
                                {/* {getLatestUpdateDate(item)} */}
                                {formatDate(new Date(item?.updated))}
                            </span>
                        </span>
                        ) : null}
                        {item.subtasks && item.subtasks.length > 0 && <>
                            <span className={`taskProgressCount subtaskIndex subscript flex row gap5`}>
                                <span className={`slashes`}>
                                    ✔
                                </span> {item?.complete ? item.subtasks.length : item.subtasks.filter(subtask => subtask.complete).length} <span className={`slashes`}>
                                    //
                                </span> {item.subtasks.length}
                            </span>
                        </>}
                    </div>
                </> : <></>}
            </div>
            <Progress item={item} tasks={item?.subtasks} />
            <div className={`itemOptions itemButtons customButtons`}>
                {/* <button id={`copy_${item.id}`} onClick={(e) => copyItem(e, item)} title={`Copy Item`} className={`iconButton ${ItemActions.Copy} copyButton wordIconButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas fa-copy`}></i>
                </button> */}
                <button id={`delete_${item.id}`} onClick={(e) => onDeleteItem(e)} title={`Delete Item`} className={`deleteItemButton iconButton deleteButton wordIconButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas fa-${showConfirm ? `ban` : `trash`}`} />
                    {showConfirm && (
                        <ConfirmAction 
                            clickableStyle={{ height: `100%`, paddingRight: 7 }}
                            style={{ right: 40, bottom: 0, height: `100%`, justifyContent: `center` }} 
                            onConfirm={(e) => deleteItem(e, item, column.id, itemIndex, item.id, false)} 
                        />
                    )}
                </button>
                <button id={`complete_${item.id}`} onClick={(e) => onCompleteItem(e)} title={`Complete Item`} className={`iconButton wordIconButton completeButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas ${item.complete ? `fa-history` : `fa-check-circle`}`} />
                </button>
                <button id={`manage_${item.id}`} onClick={(e) => onManageItem(e)} title={`Manage Item`} className={`iconButton wordIconButton manageButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas fa-bars`} />
                </button>
            </div>
        </div>
    </>
}