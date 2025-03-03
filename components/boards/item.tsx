import Progress from '../progress';
import { ItemTypes } from './boards';
import ItemDetail from './itemdetail';
import CustomImage from '../custom-image';
import { addBoardScrollBars } from './board';
import { List } from '../../shared/models/List';
import ConfirmAction from '../context-menus/confirm-action';
import { Item as ItemModel } from '../../shared/models/Item';
import React, { useContext, useEffect, useState } from 'react';
import { deleteItemFromDatabase, updateDocFieldsWTimeStamp } from '../../firebase';
import { showAlert, formatDate, dev, StateContext, capitalizeAllWords } from '../../pages/_app';
import { forceFieldBlurOnPressEnter, removeExtraSpacesFromString } from '../../shared/constants';

export const getTaskPercentage = (tasks: any[]) => {
    let tasksProgress = 0;
    let completeTasks = tasks.filter(task => task?.options?.complete);
    tasksProgress = parseFloat(((completeTasks.length / tasks.length) * 100).toFixed(1));
    return tasksProgress;
}

export const getSubTaskPercentage = (subtasks: any[], item, isActive = null) => {
    let itemIsComplete = item?.options?.complete;
    if (itemIsComplete) return 100;
    if (subtasks.length == 0) {
        if (isActive != null) return itemIsComplete ? 100 : (isActive == true ? 0 : 100);
        else return itemIsComplete ? 100 : 0;
    };
    let subtasksProgress = 0;
    let completeTasks = subtasks.filter(task => task?.options?.complete);
    subtasksProgress = parseFloat(((completeTasks.length / subtasks.length) * 100).toFixed(1));
    return subtasksProgress;
}

export const getTypeIcon = (type) => {
    switch (type) {
        default:
            return `+`;
        case ItemTypes.Image:
            return <i style={{display: `contents`}} className={`fas fa-image`} />;
    }
}

export const manageItem = (e, item, index, tasks) => {
    if (!e.target.classList.contains(`changeLabel`) && !e.target.classList.contains(`confirmActionOption`)) {
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            let isManageButton = e.target.classList.contains(`manageButton`);
            if (isManageButton) {
                dev() && console.log(`On Manage Button Click Item ${index + 1}`, item);
                showAlert(item?.name, <ItemDetail item={item} index={index} tasks={tasks} />, `95%`, `85%`, `30px`);
            };
        } else {
            dev() && console.log(`On Click Item ${index + 1}`, {item, tasks});
            showAlert(item?.name, <ItemDetail item={item} index={index} tasks={tasks} />, `95%`, `85%`, `30px`);
        }
    }
}

export default function Item({ item, count, column, itemIndex, board }: any) {
    let [showConfirm, setShowConfirm] = useState(false);
    let { 
        boards, 
        menuRef, 
        setBoards, 
        setLoading, 
        setSelected, 
        globalUserData,
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

        const name = elemValue;
        updateDocFieldsWTimeStamp(item, { name, A: name, title: `${item?.type} ${item?.rank} ${name}` });
    }

    const completeActions = async (item, isButton) => {
        if (count == 0) {
            setLoading(true);
            setSystemStatus(`Marking Item as Complete.`);

            let isComplete = item?.options?.complete == true;
            await updateDocFieldsWTimeStamp(item, { [`options.complete`]: !isComplete });

            setTimeout(() => {
                setSystemStatus(!isComplete ? `Marked Item as Complete.` : `Reopened Item.`);
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
            completeActions(item, isButton);
        }
    }

    const deleteItemLogic = async () => {
        if (column?.data?.itemIDs?.length < 5) {
            await addBoardScrollBars();
        }
        await deleteItemFromDatabase(item);
    }

    const finallyDeleteItem = () => {
        setLoading(true);
        setSystemStatus(`Deleting Item`);
        
        deleteItemLogic();

        setTimeout(() => {
            setSystemStatus(`Deleted Item #${item?.number}`);
            setLoading(false);
        }, 1000);  
    }

    const deleteItem = (e, item, initialConfirm = true) => {
        let allowedDeletionSelectors = [`iconButton`, `confirmActionOption`, `customContextMenuOption`];
        let isButton = allowedDeletionSelectors.some(className => e?.target?.classList.contains(className));
        if (isButton) {
            e.preventDefault();
            if (showConfirm == true) {
                if (!initialConfirm) {
                    finallyDeleteItem();
                }
                setShowConfirm(false);
            } else {
                if (item?.data?.taskIDs?.length > 0) {
                    setShowConfirm(true);
                } else {
                    finallyDeleteItem();
                }
            }
        }
    }

    const onDeleteItem = (e) => {
        deleteItem(e, item);
    }
    
    const onCompleteItem = (e) => {
        completeItem(e, item);
    }

    const onManageItem = (e) => {
        const tasksForThisItem = globalUserData?.tasks?.filter(tsk => tsk?.itemID == item?.id);
        console.log({tasksForThisItem});
        manageItem(e, item, itemIndex, tasksForThisItem);
    }

    const onRightClick = (e: React.MouseEvent<HTMLDivElement>, item: ItemModel, column: List) => {
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
                <i className={`itemIndex ${item?.options?.complete ? `completedIndex` : `activeIndex`}`}>
                    <span className={`itemIconType ${item?.itemType}`}>
                        +
                    </span> 
                    {itemIndex + 1}
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
                        {item.name}
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
                {(item?.image || column?.options?.details && column?.options?.details == true) ? <>
                    <hr className={`itemSep`} style={{height: 1, borderColor: `var(--gameBlue)`}} />
                    <div className={`itemFooter flex row`}>
                        {item?.meta?.created && !item?.meta?.updated ? (
                            <span className={`itemDate itemName itemCreated textOverflow extended flex row`}>
                                <i className={`status`}>
                                    Cre.
                                </i> 
                                <span className={`itemDateTime`}>
                                    {item?.meta?.created}
                                </span>
                            </span>
                        ) : item?.meta?.updated ? (
                            <span className={`itemDate itemName itemCreated itemUpdated textOverflow extended flex row`}>
                                <i className={`status`}>
                                    Upd.
                                </i> 
                                <span className={`itemDateTime`}>
                                    {item?.meta?.updated}
                                </span>
                            </span>
                        ) : null}
                        {item?.data?.taskIDs && item?.data?.taskIDs.length > 0 && <>
                            <span className={`taskProgressCount subtaskIndex subscript flex row gap5`}>
                                <span className={`slashes`}>
                                    ✔
                                </span> {item?.options?.complete ? item?.data?.taskIDs.length : globalUserData?.tasks?.filter(task => task?.itemID == item?.id && task?.options?.complete).length} <span className={`slashes`}>
                                    //
                                </span> {item?.data?.taskIDs.length}
                            </span>
                        </>}
                    </div>
                </> : <></>}
            </div>
            <Progress item={item} tasks={globalUserData?.tasks?.filter(tsk => tsk?.itemID == item?.id)} />
            <div className={`itemOptions itemButtons customButtons`}>
                {/* <button id={`copy_${item.id}`} onClick={(e) => copyItem(e, item)} title={`Copy Item`} className={`iconButton ${ItemActions.Copy} copyButton wordIconButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas fa-copy`}></i>
                </button> */}
                <button id={`delete_${item?.id}`} onClick={(e) => onDeleteItem(e)} title={`Delete Item`} className={`deleteItemButton iconButton deleteButton wordIconButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas fa-${showConfirm ? `ban` : `trash`}`} />
                    {showConfirm && (
                        <ConfirmAction 
                            onConfirm={(e) => deleteItem(e, item, false)} 
                            clickableStyle={{ height: `100%`, paddingRight: 7 }}
                            style={{ right: 40, bottom: 0, height: `100%`, justifyContent: `center` }} 
                        />
                    )}
                </button>
                <button id={`complete_${item?.id}`} onClick={(e) => onCompleteItem(e)} title={`Complete Item`} className={`iconButton wordIconButton completeButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas ${item?.options?.complete ? `fa-history` : `fa-check-circle`}`} />
                </button>
                {/* <button id={`manage_${item.id}`} onClick={(e) => onManageItem(e)} title={`Manage Item`} className={`iconButton wordIconButton manageButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas fa-bars`} />
                </button> */}
            </div>
        </div>
    </>
}