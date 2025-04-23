import Tags from './details/tags';
import Progress from '../progress';
import { ItemTypes } from './boards';
import Counts from './details/counts';
import ItemDetail from './itemdetail';
import CustomImage from '../custom-image';
import { addBoardScrollBars } from './board';
import { Task } from '../../shared/models/Task';
import { List } from '../../shared/models/List';
import DetailField from './details/detail-field';
import { Views } from '../../shared/types/types';
// import { GridTypes } from '../../shared/types/types';
// import ToggleButtons from './details/toggle-buttons';
// import RelatedURLsDND from './details/related-urls-dnd';
import ConfirmAction from '../context-menus/confirm-action';
import { Item as ItemModel } from '../../shared/models/Item';
import React, { useContext, useEffect, useState } from 'react';
// import { collection, getDocs, query, where } from 'firebase/firestore';
import { showAlert, StateContext, capitalizeAllWords } from '../../pages/_app';
import { deleteItemFromDatabase, updateDocFieldsWTimeStamp } from '../../firebase';
import { forceFieldBlurOnPressEnter, isValid, removeExtraSpacesFromString } from '../../shared/constants';

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

export default function Item({ item, count, column, itemIndex, board, setForceListDetails }: any) {
    let [showConfirm, setShowConfirm] = useState(false);
    let [windowWidth, setWindowWidth] = useState(typeof window !== undefined ? window.innerWidth : 1920);

    let { 
        // user,
        menuRef, 
        // devEnv, 
        setLoading, 
        setSelected, 
        // addNewBoard,
        globalUserData,
        // selectedGrid,
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

    const getItemTasks = (filterKey: string = ``) => {
        let thisItemsTasks = globalUserData?.tasks?.filter(task => task?.itemID == item?.id);
        if (filterKey != ``) thisItemsTasks = thisItemsTasks?.filter(tsk => tsk?.options[filterKey] == true);
        return thisItemsTasks;
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

    // const onArchiveItem = async (e) => {
    //     let { grids } = globalUserData;
    //     let archivedGrid = grids?.find(gr => gr?.gridType == GridTypes.Archived);

    //     let objLogs = {
    //         item,
    //         selectedGrid,
    //         archivedGrid, 
    //     }

    //     if (archivedGrid) {
    //         let boardUUID = extractIDDetails(board?.id)?.uuid;
    //         let boardUUIDs = archivedGrid?.data?.boardIDs?.map(id => extractIDDetails(id)?.uuid);
    //         if (boardUUIDs?.includes(boardUUID)) {
    //             if (dev()) {
    //                 console.log(`Has Board`, objLogs);
    //                 const archivedGridBoardID = archivedGrid?.data?.boardIDs[0];
    //                 const archivedGridBoardListQuery = await query(collection(db, listsTable), where(`boardID`, `==`, archivedGridBoardID));
    //                 const archivedGridBoardListDocs = await getDocs(archivedGridBoardListQuery);
    //                 for (const listDoc of archivedGridBoardListDocs.docs) {
    //                     await transferItem(item, listDoc?.id, archivedGridBoardID, archivedGrid?.id);
    //                 }
    //             }
    //         } else {
    //             if (dev()) {
    //                 console.log(`Not Has Board`, objLogs);
    //                 const listsRef = await collection(db, listsTable);
    //                 const listsSnapshot = await getDocs(listsRef);
    //                 const listsCount = listsSnapshot.size;
    //                 const listRank = listsCount + 1;
    //                 const newList = createList(listRank, `Items`, user, listRank, archivedGrid?.id, board?.id, [item?.id]) as List;
    //                 // Remove List ID from Current Board
    //                 // Remove Item ID from Current Board
    //                 await addListToDatabase(newList, board?.id)?.then(async lst => {
    //                     await addNewBoard(e, board?.name, archivedGrid, [lst?.id], [item?.id]);
    //                     await transferItem(item, lst?.id, board?.id, archivedGrid?.id);
    //                 });
    //             }
    //         }
    //     }
    // }

    const showItemDetails = () => {
        let listItemsContainerSmall = false;
        if (document) {
            if (column?.uuid) {
                let listItemsContainerElement = document?.querySelector(`.boardColumnItems_${column?.uuid}`);
                if (listItemsContainerElement) {
                    listItemsContainerSmall = (listItemsContainerElement?.clientWidth + 7) <= 660;
                }
            }
        }
        let smallScreenSize = windowWidth <= 1800;
        let fourOrMoreLists = board?.data?.listIDs?.length >= 4;
        let threeOrMoreLists = board?.data?.listIDs?.length >= 3;
        let listDetailsOn = column?.options?.details && column?.options?.details == true;
        let forceDetails = (smallScreenSize && threeOrMoreLists) || fourOrMoreLists || listItemsContainerSmall;
        setTimeout(() => {
            if (column) setForceListDetails(forceDetails);
        }, 500)
        let itemDetailsOn = forceDetails || listDetailsOn;
        return itemDetailsOn;
    }

    const sortItemTasks = async (item) => {
        const updatedItemTasks = [];
        const currentItemTaskIDs = item?.data?.taskIDs;
        const completeItemTasks = item?.tasks?.filter((tsk: Task) => tsk?.options?.complete);
        const completeItemTasksSorted = completeItemTasks?.sort((tskA: Task, tskB: Task) => tskA?.name?.length - tskB?.name?.length);
        const completeItemTasksSortedIDs = completeItemTasksSorted?.map((tsk: Task) => tsk?.id);
        const updatedItemTaskIDs = currentItemTaskIDs?.filter(tskID => !completeItemTasksSortedIDs?.includes(tskID))?.concat(completeItemTasksSortedIDs);
        updatedItemTaskIDs?.forEach(tskID => {
            const thisItemTask = item?.tasks?.find((tsk: Task) => tsk?.id == tskID);
            if (thisItemTask) updatedItemTasks?.push(thisItemTask);
        });
        item.tasks = updatedItemTasks;
        await updateDocFieldsWTimeStamp(item, { [`data.taskIDs`]: updatedItemTaskIDs });
    }

    const onSortItemTasks = async () => {
        await sortItemTasks(item);
    }

    // const defaultRightClick = (element) => {
    //     const evt = new MouseEvent(`contextmenu`, { view: window, bubbles: true, cancelable: true });
    //     element?.dispatchEvent(evt);
    // }

    // const onDefaultRightClick = () => {
    //     if (document) {
    //         let itemElementClicked = document?.querySelector(`.itemElement_${item.uuid}`);
    //         if (itemElementClicked) defaultRightClick(itemElementClicked);
    //     }
    // }

    const onRightClick = (e: React.MouseEvent<HTMLDivElement>, item: ItemModel, column: List) => {
        e.preventDefault();
        setItemTypeMenuOpen(true);
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setSelected({ 
            item,
            column,
            board,
            onSortItemTasks,
            type: Views.Context,
        });
    }
    
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef?.current && !menuRef?.current?.contains(event?.target as Node)) {
            setSelected(null);
            setMenuPosition(null);
            setItemTypeMenuOpen(false);
        }
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
        <div id={`itemElement_${item.id}`} className={`itemComponent itemElement_${item.uuid} itemInnerRow flex row ${isValid(item?.options?.active) && item?.options?.active == true ? `activeItemOrTask` : ``}`} onContextMenu={(e) => onRightClick(e, item, column)}>
            <span className={`itemOrder rowIndexOrder`}>
                <i className={`itemIndex ${item?.options?.complete ? `completedIndex` : `activeIndex`}`}>
                    <span className={`itemIconType ${item?.itemType}`}>
                        +
                    </span> 
                    <span className={`itemOrderText fit ${(itemIndex + 1) >= 10 ? `largeNum` : (itemIndex + 1) >= 100 ? `extraLargeNum` : ``}`}>
                        {itemIndex + 1}
                    </span>
                </i>
            </span>
            {item?.image && (
                <CustomImage className={`itemImage boardItemImage`} src={item?.image} alt={item?.content} />
            )}
            <div className={`itemDetailsContainer`}>
                <div className={`itemContents`}>
                    <span className={`flex row itemContent boardItemContent itemName ${item?.options?.active ? `isActiveItem` : ``} textOverflow extended`}>
                        <span 
                            contentEditable 
                            spellCheck={false}
                            suppressContentEditableWarning 
                            onBlur={(e) => changeLabel(e, item)} 
                            onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
                            className={`changeLabel stretchEditable itemChangeLabel`}
                        >
                            {item.name}
                        </span>
                    </span>
                    {(item?.image || showItemDetails() == true) ? <>
                        <hr className={`itemSep`} style={{height: 1, borderColor: `var(--gameBlue)`}} />
                        <div className={`itemFooter flex row`}>
                            <div className={`itemDetailsStart itemDetails`}>
                                <DetailField item={item} tasks={getItemTasks()} />
                                <Tags item={item} />
                                {/* {devEnv && <RelatedURLsDND item={{ ...item, data: { ...item?.data, relatedURLs: [item?.data?.relatedURLs[0]] } }} />} */}
                            </div>
                            <div className={`itemDetailsEnd fit`}>
                                <Counts item={item} activeTasks={getItemTasks(`active`)} completedTasks={getItemTasks(`complete`)} />
                            </div>
                        </div>
                    </> : <></>}
                </div>
                {(!item?.image && showItemDetails() == false) && <>
                    <div className={`altTagsContainer itemContents fit`}>
                        <Tags item={item} />
                        {/* {devEnv && <RelatedURLsDND item={{ ...item, data: { ...item?.data, relatedURLs: [item?.data?.relatedURLs[0]] } }} />} */}
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
                    {/* <button id={`complete_${item?.id}`} onClick={(e) => onCompleteItem(e)} title={`Complete Item`} className={`iconButton wordIconButton completeButton`}>
                        {(item?.options?.complete || ((item?.data?.taskIDs?.length == 0 && item?.options?.active) || item?.data?.taskIDs?.length > 0)) ? (
                            <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`itemStatusIcon ${item?.options?.complete ? `fas fa-history` : ((item?.data?.taskIDs?.length == 0 && item?.options?.active) || item?.data?.taskIDs?.length > 0) ? `fas fa-check-circle` : `fas fa-play-circle`}`} />
                        ) : (
                            <span className={`customButtonGlyph`} style={{color: `var(--gameBlue)`, fontSize: 16}}>
                                ▶
                            </span>
                        )}
                    </button> */}
                </div>
            </div>
        </div>
    </>
}