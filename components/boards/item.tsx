import Tags from './details/tags';
import Progress from '../progress';
import { ItemTypes } from './boards';
import Counts from './details/counts';
import ItemDetail from './itemdetail';
import CustomImage from '../custom-image';
import { addBoardScrollBars } from './board';
import { List } from '../../shared/models/List';
import { Task } from '../../shared/models/Task';
import DetailField from './details/detail-field';
import ProgressBar from './details/progress-bar';
import ConfirmAction from '../context-menus/confirm-action';
import { Item as ItemModel } from '../../shared/models/Item';
import React, { useContext, useEffect, useState } from 'react';
import { deleteItemFromDatabase, updateDocFieldsWTimeStamp } from '../../firebase';
import { showAlert, StateContext, capitalizeAllWords, dev } from '../../pages/_app';
import { forceFieldBlurOnPressEnter, isValid, removeExtraSpacesFromString } from '../../shared/constants';
import { GridTypes } from '../../shared/types/types';

export const getItemTaskCompletionPercentage = (tasks: Task[], item: ItemModel, isActive = null) => {
    let itemIsActive = isValid(item?.options?.active) && item?.options?.active == true;
    let itemIsComplete = isValid(item?.options?.complete) && item?.options?.complete == true;
    if (itemIsActive && item?.data?.taskIDs?.length == 0) return 50;
    if (itemIsComplete) return 100;

    if (tasks.length == 0) {
        if (isActive != null) return itemIsComplete ? 100 : (isActive == true ? 0 : 100);
        else return itemIsComplete ? 100 : 0;
    }

    let itemTaskCompletionProgress = 0;
    
    let activeTasks = tasks.filter(task => isValid(task?.options?.active) && task?.options?.active == true);
    let completeTasks = tasks.filter(task => isValid(task?.options?.complete) && task?.options?.complete == true);

    let activeTaskProgress = (activeTasks.length / tasks.length) * 50;
    let completeTaskProgress = (completeTasks.length / tasks.length) * 100;

    itemTaskCompletionProgress = parseFloat((activeTaskProgress + completeTaskProgress).toFixed(1));
    return itemTaskCompletionProgress;
}

export const getTypeIcon = (type) => {
    switch (type) {
        default:
            return `+`;
        case ItemTypes.Image:
            return <i style={{display: `contents`}} className={`fas fa-image`} />;
    }
}

export const manageItem = (e, item, index, tasks, activeTasks, completeTasks) => {
    if (!e.target.classList.contains(`changeLabel`) && !e.target.classList.contains(`confirmActionOption`)) {
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            let isManageButton = e.target.classList.contains(`manageButton`);
            if (isManageButton) {
                // dev() && console.log(`On Manage Button Click Item ${index + 1}`, item);
                showAlert(item?.name, <ItemDetail item={item} index={index} tasks={tasks} activeTasks={activeTasks} completeTasks={completeTasks} />, `95%`, `85%`, `30px`);
            };
        } else {
            // dev() && console.log(`On Click Item ${index + 1}`, {item, tasks});
            showAlert(item?.name, <ItemDetail item={item} index={index} tasks={tasks} activeTasks={activeTasks} completeTasks={completeTasks} />, `95%`, `85%`, `30px`);
        }
    }
}

export default function Item({ item, count, column, itemIndex, board, setForceListDetails }: any) {
    let [showConfirm, setShowConfirm] = useState(false);
    let [windowWidth, setWindowWidth] = useState(typeof window !== undefined ? window.innerWidth : 1920);

    let { 
        devEnv, 
        menuRef, 
        setLoading, 
        addNewBoard,
        setSelected, 
        selectedGrid,
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
            let isActive = isValid(item?.options?.active) && item?.options?.active == true;

            await updateDocFieldsWTimeStamp(item, { 
                ...(item?.data?.taskIDs?.length > 0 ? {
                    [`options.complete`]: !isComplete,
                } : {
                    ...(isActive ? {
                        ...(isComplete ? {
                          [`options.active`]: false,
                          [`options.complete`]: false,
                        } : {
                          [`options.active`]: false,
                          [`options.complete`]: true,
                        }),
                      } : {
                        ...(isComplete ? {
                          [`options.active`]: false,
                          [`options.complete`]: false,
                        } : {
                          [`options.active`]: true,
                          [`options.complete`]: false,
                        })
                    }),
                }),
            });

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

    const onArchiveItem = async (e) => {
        let { grids } = globalUserData;
        let archivedGrid = grids?.find(gr => gr?.gridType == GridTypes.Archived);

        let objLogs = {
            item,
            selectedGrid,
            archivedGrid, 
        }

        if (archivedGrid) {
            if (archivedGrid?.data?.boardIDs?.includes(board?.id)) {
                dev() && console.log(`Has Board`, objLogs);
            } else {
                dev() && console.log(`Not Has Board`, objLogs);
                if (dev()) {
                    await addNewBoard(e, board?.name, archivedGrid);
                }
            }
        }
    }

    const onManageItem = (e) => {
        const allTasks = getItemTasks();
        const activeTasks = getItemTasks(`active`);
        const completeTasks = getItemTasks(`complete`);
        manageItem(e, item, itemIndex, allTasks, activeTasks, completeTasks);
    }

    const showItemDetails = () => {
        let smallScreenSize = windowWidth <= 1800;
        let fourOrMoreLists = board?.data?.listIDs?.length >= 4;
        let threeOrMoreLists = board?.data?.listIDs?.length >= 3;
        let listDetailsOn = column?.options?.details && column?.options?.details == true;
        let forceDetails = (smallScreenSize && threeOrMoreLists) || fourOrMoreLists;
        setTimeout(() => {
            if (column) setForceListDetails(forceDetails);
        }, 500)
        let itemDetailsOn = forceDetails || listDetailsOn;
        return itemDetailsOn;
    }

    const onRightClick = (e: React.MouseEvent<HTMLDivElement>, item: ItemModel, column: List) => {
        // if (dev()) {
            // return;
        // } else {
            e.preventDefault();
            setItemTypeMenuOpen(true);
            setMenuPosition({ x: e.clientX, y: e.clientY });
            setSelected({item, column, board, onManageItem, onCompleteItem, onArchiveItem, onDeleteItem});
        // }
    }
    
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef?.current && !menuRef?.current?.contains(event?.target as Node)) {
            setSelected(null);
            setMenuPosition(null);
            setItemTypeMenuOpen(false);
        }
    }

    const getItemTasks = (filterKey: string = ``) => {
        let thisItemsTasks = globalUserData?.tasks?.filter(task => task?.itemID == item?.id);
        if (filterKey != ``) thisItemsTasks = thisItemsTasks?.filter(tsk => tsk?.options[filterKey] == true);
        return thisItemsTasks;
    }

    useEffect(() => {
        document.addEventListener(`click`, handleClickOutside);
        return () => document.removeEventListener(`click`, handleClickOutside);
    }, []);

    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                setWindowWidth(window.innerWidth);
            }, 200);
        };

        window.addEventListener(`resize`, handleResize);
        return () => {
            clearTimeout(resizeTimeout);
            window.removeEventListener(`resize`, handleResize);
        };
    }, []);

    return <>
        <div id={`itemElement_${item.id}`} className={`itemComponent itemInnerRow flex row ${isValid(item?.options?.active) && item?.options?.active == true ? `activeItemOrTask` : ``}`} onContextMenu={(e) => onRightClick(e, item, column)}>
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
            <div className={`itemDetailsContainer`}>
                <div className={`itemContents`}>
                    <span className={`flex row itemContent boardItemContent itemName ${item?.options?.active ? `isActiveItem` : ``} textOverflow extended`}>
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
                        {devEnv && showItemDetails() == true && <>
                            <ProgressBar progress={getItemTaskCompletionPercentage(getItemTasks(), item)} />
                        </>}
                    </span>
                    {(item?.image || showItemDetails() == true) ? <>
                        <hr className={`itemSep`} style={{height: 1, borderColor: `var(--gameBlue)`}} />
                        <div className={`itemFooter flex row`}>
                            <div className={`itemDetailsStart itemDetails`}>
                                <DetailField item={item} tasks={getItemTasks()} />
                                {devEnv && <Tags />}
                            </div>
                            <div className={`itemDetailsEnd fit`}>
                                <Counts item={item} activeTasks={getItemTasks(`active`)} completedTasks={getItemTasks(`complete`)} />
                            </div>
                        </div>
                    </> : <></>}
                </div>
                {showItemDetails() == false && <>
                    <div className={`altTagsContainer itemContents fit`}>
                        {devEnv && <Tags />}
                    </div>
                    <DetailField item={item} tasks={getItemTasks()} />
                </>}
                <Progress item={item} tasks={getItemTasks()} />
                <div className={`itemOptions itemButtons customButtons`}>
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
                        <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`itemStatusIcon ${item?.options?.complete ? `fas fa-history` : ((item?.data?.taskIDs?.length == 0 && item?.options?.active) || item?.data?.taskIDs?.length > 0) ? `fas fa-check-circle` : `fas fa-play-circle`}`} />
                    </button>
                </div>
            </div>
        </div>
    </>
}