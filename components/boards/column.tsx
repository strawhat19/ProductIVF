import Tasks from './tasks';
import { ItemTypes } from './boards';
import { toast } from 'react-toastify';
import Item, { getTypeIcon } from './item';
import { addBoardScrollBars } from './board';
import { Task } from '../../shared/models/Task';
import { Board } from '../../shared/models/Board';
import React, { useContext, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import IVFSkeleton from '../loaders/skeleton/ivf_skeleton';
import ConfirmAction from '../context-menus/confirm-action';
import { createItem, Item as ItemModel } from '../../shared/models/Item';
import { TasksFilterStates, Types, Views } from '../../shared/types/types';
import { formatDate, StateContext, capitalizeAllWords, dev, capWords } from '../../pages/_app';
import { addItemToDatabase, db, deleteListFromDatabase, itemsTable, updateDocFieldsWTimeStamp } from '../../firebase';
import { forceFieldBlurOnPressEnter, getRankAndNumber, logToast, removeExtraSpacesFromString } from '../../shared/constants';

export const isSelected = (selected, selectedTypes: Views[]) => selected != null && selectedTypes?.includes(selected?.type);

export default function Column(props) {
    let count = 0;
    let [hoverItemForm, ] = useState(false);
    let [showConfirm, setShowConfirm] = useState(false);
    let [itemTypeMenuOpen, setItemTypeMenuOpen] = useState(false);
    let { board, column, hideAllTasks, updateBoardInState } = props;
    let [forceListDetails, setForceListDetails] = useState(column?.options?.details == true);

    let { 
        user,
        users,
        selected,
        setLoading,
        setSelected,
        menuPosition, 
        selectedGrid,
        globalUserData,
        gridSearchTerm,
        setSystemStatus,
    } = useContext<any>(StateContext);

    const getListsLength = () => {
        let boardsLists = globalUserData?.lists;
        if (boardsLists && boardsLists?.length > 0) {
            boardsLists = boardsLists?.filter(lst => lst?.boardID == column?.boardID);
        }
        return boardsLists?.length;
    }

    const renderTitleSizeClass = (name) => {
        let nameClasses = ``;
        if (name?.length >= 5) nameClasses = `mTitle`;
        if (name?.length >= 15) nameClasses = `lTitle`;
        if (name?.length >= 20) nameClasses = `xlTitle`;
        return nameClasses;
    }

    const getItemTasks = (item: ItemModel, filterKey: string = ``) => {
        let itemTasks = globalUserData?.tasks?.filter(tsk => tsk?.itemID == item?.id);
        if (filterKey != ``) itemTasks = itemTasks?.filter(tsk => tsk?.options[filterKey] == true);
        return itemTasks;
    }

    const itemActiveFilters = (itm: ItemModel) => {
        let hasSearchTerm = gridSearchTerm != ``;
        let itemInCurrentSearchFilters = !hasSearchTerm;

        if (hasSearchTerm) {
            let queryStrings = [];

            let itemTags = itm?.data?.tags;
            let itemQueryStrings = [
                itm?.name, 
                itm?.description, 
                String(itm?.rank), 
                `${itm?.type[0]}${itm?.rank}`, 
                `${itm?.type[0]} ${itm?.rank}`, 
                `${itm?.type[0]}-${itm?.rank}`, 
                `${itm?.type[0]}_${itm?.rank}`,
            ];

            [...itemTags, ...itemQueryStrings]?.forEach(qStr => queryStrings?.push(qStr));

            if (itm?.data?.taskIDs?.length > 0) {
                let itemTasks = getItemTasks(itm);
                let itemTaskNames = itemTasks?.map((tsk: Task) => tsk?.name);
                let itemTaskRanks = itemTasks?.map((tsk: Task) => String(tsk?.rank));
                let taskQueryStrings = [...itemTaskNames, ...itemTaskRanks];
                taskQueryStrings?.forEach(tqStr => queryStrings?.push(tqStr));
                itemTasks?.forEach((tsk: Task) => {
                    let taskTags = tsk?.data?.tags || [];
                    let taskRelatedURLs = tsk?.data?.relatedURLs || [];
                    queryStrings.push(...taskTags, ...taskRelatedURLs);
                    queryStrings.push(
                        `${tsk?.type[0]}${tsk?.rank}`, 
                        `${tsk?.type[0]} ${tsk?.rank}`, 
                        `${tsk?.type[0]}-${tsk?.rank}`, 
                        `${tsk?.type[0]}_${tsk?.rank}`,
                    )
                });
            }

            queryStrings = [...queryStrings, ...itm?.attachments, itm?.image];

            queryStrings = queryStrings?.map(qs => qs?.toLowerCase());
            itemInCurrentSearchFilters = queryStrings?.join(``)?.includes(gridSearchTerm?.trim()?.toLowerCase());
        }

        if (board?.options?.hideCompleted) {
            if (!itm?.options?.complete) {
                return itemInCurrentSearchFilters;
            } else {
                return false;
            }
        } else {
            return itemInCurrentSearchFilters;
        }
    }

    const changeItemType = (e, type?, column?) => {
        if (!e.target.classList.contains(`menuTypeIcon`)) {
            setItemTypeMenuOpen(!itemTypeMenuOpen);
        } else {
            if (type && type != column?.itemType) {
                column.itemType = type;
                setItemTypeMenuOpen(!itemTypeMenuOpen);
            }
        }
    }

    const changeColumnLabel = (e, list) => {
        let elemValue = e.target.textContent;
        let value = elemValue == `` ? capitalizeAllWords(list.name) : capitalizeAllWords(elemValue);
        if (!elemValue || elemValue == ``) {
            elemValue = capitalizeAllWords(list.name);
            return;
        };

        elemValue = removeExtraSpacesFromString(value);
        elemValue = capitalizeAllWords(elemValue);

        e.target.innerHTML = elemValue;
        
        const name = elemValue;
        updateDocFieldsWTimeStamp(list, { name, A: name, title: `${list?.type} ${list?.rank} ${name}` });
    }

    // const adjustColumnsDetails = (column) => {
    //     let showingDetails = column?.options?.details && column?.options?.details == true;
    //     updateDocFieldsWTimeStamp(column, { [`options.details`]: !showingDetails });
    // }

    const deleteColumn = (columnId, index, initialConfirm = true) => {
        if (showConfirm == true) {
            if (!initialConfirm) {
                finallyDeleteColumn(columnId, index);
            }
            setShowConfirm(false);
        } else {
            if (column?.data?.itemIDs?.length > 0) {
                setShowConfirm(true);
            } else {
                finallyDeleteColumn(columnId, index);
            }
        }
    }

    const finallyDeleteColumn = async (columnId, index, useDB = true) => {
        if (useDB == true) {
            const brd: Board = new Board({ ...board });
            brd.data.listIDs = brd.data.listIDs?.filter(lstid => lstid != columnId);
            updateBoardInState({ ...brd, id: board?.id });
            const deleteListToast = toast.info(`Deleting List ${column?.name}`);
            await deleteListFromDatabase(column)?.then(lst => {
                setTimeout(() => toast.dismiss(deleteListToast), 1500);
                logToast(`Successfully Deleted List #${lst?.number}`, lst);
            })?.catch(deleteLstError => {
                logToast(`Failed to Delete List #${column?.number}`, deleteLstError, true);
            });
        } else deleteListNoDB(columnId, index);
    }

    const deleteListNoDB = (columnId, index) => {
        setLoading(true);
        setSystemStatus(`Deleting Column.`);
        const columnItems = props.board.columns[columnId].itemIds;

        const finalItems = columnItems.reduce((previousValue, currentValue) => {
            const { [currentValue]: oldItem, ...newItem } = previousValue;
            return newItem;
        }, props.board.items);

        const columns = props.board.columns;
        const { [columnId]: oldColumn, ...newColumns } = columns;

        const newColumnOrder = Array.from(props.board.columnOrder);
        newColumnOrder.splice(index, 1);

        props.setBoard(prevBoard => {
            return {
                ...prevBoard,
                items: { ...finalItems },
                columns: { ...newColumns },
                columnOrder: newColumnOrder,
                updated: formatDate(new Date()),
            }
        });

        setTimeout(() => {
            setSystemStatus(`Deleted Column`);
            setLoading(false);
        }, 1000);
    }

    const addNewItem = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSystemStatus(`Creating Item.`);

        let formFields = e.target.children;
        let video = formFields.itemVideo && formFields.itemVideo.value ? formFields.itemVideo.value : ``;
        let image = formFields.itemImage && formFields.itemImage.value ? formFields.itemImage.value : ``;

        let nextIndex = column?.data?.itemIDs?.length + 1;
        
        let name = capWords(formFields.createItem.value);

        let position = formFields.rank.value;
        if (!position || position == ``) position = nextIndex;
        position = parseInt(position);
        position = position > nextIndex ? nextIndex : position; 

        if (board) {
            const { rank, number } = await getRankAndNumber(Types.Item, globalUserData?.items, column?.data?.itemIDs, users, user);
            const itemsRef = await collection(db, itemsTable);
            const itemsSnapshot = await getDocs(itemsRef);
            const allDBItems = itemsSnapshot.docs.map(doc => doc.data());
            const highestDbItemRanks = allDBItems?.map((itm: ItemModel) => itm?.rank)?.sort((a, b) => b - a);
            const highestDbItemRank = highestDbItemRanks[0] + 1;
            const itemsCount = itemsSnapshot.size;
            const itemRank = itemsCount + 1;
            const itemNumber = Math.max(rank, number, itemRank, highestDbItemRank);

            const newItem = createItem(itemNumber, name, user, itemNumber, selectedGrid?.id, board?.id, column?.id, image, video) as ItemModel;

            const prevItmIDs = [...column?.data?.itemIDs];
            const newItemIDs = Array.from(prevItmIDs);
            newItemIDs.splice(position - 1, 0, newItem?.id);

            const brd: Board = new Board({ ...board });
            brd.data.itemIDs = [...brd.data.itemIDs, newItem?.id];

            await updateBoardInState({ ...brd, id: board?.id });

            if (newItemIDs?.length > 5) addBoardScrollBars();

            await addItemToDatabase(newItem, column?.id, board?.id, newItemIDs);

            e.target.reset();
            if (e.target.children && e.target.children?.length > 0) {
                e.target.children[0].focus();
            }
        }

        setTimeout(() => {
            setSystemStatus(`Created Item.`);
            setLoading(false);
        }, 1000);
    }

    const openItemDetails = (e, item, itemIndex) => {
        const target = e?.target;
        const itemInteractiveClasses = [`urlIcon`, `urlDeleteBtn`, `itemURL`, `tagImage`, `websiteURL`, `iconButton`, `changeLabel`, `completeButton`, `confirmActionOption`, `deleteItemButton`];
        const itemInteractiveClicked = itemInteractiveClasses?.some(clsString => target?.classList.contains(clsString));
        if (itemInteractiveClicked) return;
        e.preventDefault();
        const selectedToSet = { 
            item,
            board,
            column,
            itemIndex,
            type: `Details`,
            tasks: item?.tasks,
            activeTasks: item?.tasks?.filter((tsk: Task) => tsk?.options?.active),
            completeTasks: item?.tasks?.filter((tsk: Task) => tsk?.options?.complete),
        };
        setSelected(selectedToSet);
    }

    return (
        <Draggable key={props.column.id} draggableId={props.column.id} index={props.index} isDragDisabled={gridSearchTerm != ``}>
            {(provided, snapshot) => (
                <div id={props.column.id} className={`container column list columns_${getListsLength()} ${(getListsLength() > 2 || !dev()) ? `multiCol` : ``} ${getListsLength() >= 4 ? `multiColExtended` : ``} layoutCols_${props?.column?.layoutCols ? props?.column?.layoutCols : ``} ${snapshot.isDragging ? `dragging` : ``}`} {...provided.draggableProps} ref={provided.innerRef}>
                    <div className={`columnItemsContainer outerColumn`}>
                        <div style={{ position: `relative` }} id={`name_of_${props.column.id}`} title={`${props.column.title}`} className={`columnTitle flex row iconButton item listTitleButton`} {...provided.dragHandleProps}>
                            <div className={`itemOrder listOrder`} style={{ maxWidth: `fit-content` }}>
                                <i style={{ color: `var(--gameBlue)`, fontSize: 15, padding: `0 9px`, maxWidth: `fit-content` }} className={`fas fa-list`} />
                            </div>
                            <h3 className={`listNameRow nx-tracking-light ${props.column.title.length > 25 ? `longName` : ``}`} id={`list_name_of_${props.column.id}`} style={{ position: `relative`, fontStyle: `italic` }}>
                                <div className={`listName textOverflow extended flex row`} style={{ fontSize: 13, fontWeight: 600 }}>
                                    <div 
                                        contentEditable 
                                        spellCheck={false}
                                        suppressContentEditableWarning
                                        onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
                                        onBlur={(e) => changeColumnLabel(e, props.column)} 
                                        className={`columnName changeLabel stretchEditable ${renderTitleSizeClass(props.column.name)}`} 
                                    >
                                        {props.column.name}    
                                    </div>
                                    <div className={`columnStats flex row end gap5i`}>
                                        <span className={`subscript`} style={{display: `contents`,}}>
                                            <span className={`slashesNo`}>
                                                {props.items.filter(itm => itemActiveFilters(itm) && itm?.options?.complete).length}
                                            </span><span className="simpleSlashes slashes_success"> ✓</span> <div className={`slashesNo`} style={{display: `contents`}}> <span className="simpleSlashes">//</span> </div> <span className={`slashesNo`}>
                                                {props.items.filter(itm => itemActiveFilters(itm)).length}
                                            </span><span className="simpleSlashes" style={{ marginRight: 10 }}> ☰</span></span>
                                            <span className={`subscript`} style={{display: `contents`,}}> <span className={`slashesNo`}>
                                                {[].concat(...props.items.filter(itm => itemActiveFilters(itm)).filter(itm => itm?.options?.complete).map(itm => itm?.tasks)).length 
                                                + [].concat(...props.items.filter(itm => itemActiveFilters(itm)).filter(itm => !itm?.options?.complete).map(itm => itm?.tasks)).filter(tsk => tsk?.options?.complete).length}
                                            </span><span className="simpleSlashes slashes_success"> ✓</span> <div className={`slashesNo`} style={{display: `contents`}}> <span className="simpleSlashes">//</span> </div> <span className={`slashesNo`}>
                                                {[].concat(...props.items.filter(itm => itemActiveFilters(itm)).map(itm => itm?.tasks)).length}
                                            </span><span className="simpleSlashes"> ☰</span></span>
                                    </div>
                                </div>
                            </h3>
                            <div className={`listButtonOptions itemButtons customButtons`}>
                                {/* {(!forceListDetails && board?.data?.listIDs?.length <= 3) && <>
                                    <button id={`details_Columns_${props.column.id}`} style={{ pointerEvents: `all` }} onClick={(e) => adjustColumnsDetails(props.column)} title={`Details`} className={`columnIconButton iconButton detailsButton ${props.column?.options?.details == true ? `` : `optionActive`}`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${props?.column?.options?.details == true ? `fa-bars` : `fa-times`}`} />
                                        <span className={`iconButtonText listTitleButtonLabel firstTitle ${renderTitleSizeClass(props.column.name)} textOverflow extended`}>
                                            {props.column?.options?.details == true ? `Expanded` : `Compact`}
                                        </span>
                                    </button>
                                </>} */}
                                <button id={`delete_${props.column.id}`} style={{ pointerEvents: `all` }} onClick={(e) => deleteColumn(props.column.id, props.index)} title={`Delete List`} className={`columnIconButton iconButton deleteButton deleteListButton ${showConfirm ? `cancelBtnList` : ``}`}>
                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`mainIcon fas fa-${showConfirm ? `ban` : `trash`}`} />
                                    <span className={`iconButtonText listTitleButtonLabel ${renderTitleSizeClass(props.column.name)} textOverflow extended`}>
                                        {showConfirm ? `Cancel` : `Delete`}
                                    </span>
                                    {showConfirm && (
                                        <ConfirmAction onConfirm={(e) => deleteColumn(props.column.id, props.index, false)} />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Droppable droppableId={props?.column?.id} type={Types.Item}>
                            {provided => (
                                <div id={`items_of_${props?.column?.id}`} className={`items boardColumnItems boardColumnItems_${props?.column?.uuid} listItems`} {...provided.droppableProps} ref={provided.innerRef}>
                                    {props.items.filter(itm => itemActiveFilters(itm)).map((item, itemIndex) => {
                                        const tasks = [];
                                        if (!item.tasks) {
                                            item?.data?.taskIDs?.forEach(tskID => {
                                                const task = globalUserData?.tasks?.find(tsk => tsk?.id == tskID);
                                                if (task) tasks.push(task);
                                            })
                                            item.tasks = tasks;
                                        }
                                        if (item?.id) {
                                            return (
                                                <Draggable key={item?.id} draggableId={item?.id} index={itemIndex} isDragDisabled={gridSearchTerm != ``}>
                                                    {provided => (
                                                        <div id={item?.id} className={`item boardItem ${hoverItemForm ? `itemHoverToExpand` : ``} completeItem ${(item?.options?.complete) ? `complete completeBoardItem` : `activeBoardItem`} ${(item?.options?.active && (getItemTasks(item, `active`)?.length > 0 || item?.data?.taskIDs?.length == 0)) ? `activeItemBoard` : ``} ${gridSearchTerm != `` ? `wSearchTerm` : ``} container ${snapshot.isDragging ? `dragging` : ``} ${(itemTypeMenuOpen || isSelected(selected, [Views.Context])) ? `unfocus` : ``}`} title={item?.name} {...provided.draggableProps} ref={provided.innerRef}>
                                                            <div onClick={(e) => openItemDetails(e, item, itemIndex)} {...provided.dragHandleProps} className={`itemDraggableWrapper itemRow flex row ${item?.options?.complete ? `completed` : `incomplete`} ${item?.tasks.length > 0 ? `hasTasksRow` : `noTasksRow`}`}>
                                                                <Item 
                                                                    item={item} 
                                                                    count={count} 
                                                                    board={board} 
                                                                    column={props.column} 
                                                                    itemIndex={itemIndex} 
                                                                    setBoard={props.setBoard} 
                                                                    forceListDetails={forceListDetails}
                                                                    setForceListDetails={setForceListDetails}
                                                                />
                                                            </div>
                                                            {!hideAllTasks && item.tasks && (
                                                                <Tasks 
                                                                    item={item} 
                                                                    board={board}
                                                                    column={props.column} 
                                                                    showForm={(item?.options?.showTaskForm || board?.options?.tasksFilterState == TasksFilterStates.All_On)} 
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            )}
                                        }
                                    )}
                                    {provided.placeholder}
                                    {props.items.filter(itm => itemActiveFilters(itm))?.length == 0 && <>
                                        <div className={`zeroState listsZeroState`}>
                                            <IVFSkeleton 
                                                labelSize={12}
                                                showLoading={true}
                                                labelColor={`silver`}
                                                className={`gridsItemsSkeleton`} 
                                                style={{ minWidth: 300, padding: `10px 3px`, [`--animation-delay`]: `${0.15}s` }} 
                                                label={gridSearchTerm != `` ? `No Items Found for "${gridSearchTerm}"` : `No Items Yet`} 
                                            />
                                        </div>
                                    </>}
                                </div>
                            )}
                        </Droppable>
                    </div>
                    <form title={`Add Item`} id={`add_item_form_${props.column.id}`} className={`flex addItemForm itemButtons unset addForm`} style={{ width: `100%`, flexDirection: `row` }} onSubmit={(e) => addNewItem(e)}>
                        <div className={`itemTypesMenu ${(itemTypeMenuOpen && menuPosition == null) ? `show` : ``}`}>
                            {Object.values(ItemTypes).filter(type => type !== props?.column?.itemType).map((type, typeIndex) => (
                                <div key={typeIndex} title={type} onClick={(e) => changeItemType(e, type, props.column)} className={`typeIcon itemTypeIconRow menuTypeIcon`}>
                                    <div className={`typeIconIcon`}>
                                        {getTypeIcon(type)}
                                    </div>
                                    <div className={`typeIconText`}>
                                        {type}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div title={`Change ${props?.column?.itemType} Type`} onClick={(e) => changeItemType(e)} className={`typeIcon changeItemTypeIcon`}>
                            {getTypeIcon(props?.column?.itemType)}
                        </div>
                        <input autoComplete={`off`} placeholder={`Create Item +`} type={`text`} name={`createItem`} required />
                        {props?.column?.itemType == ItemTypes.Image && (
                            <input autoComplete={`off`} style={{padding: `10px 0px 10px 15px`, minWidth: `75px`, maxWidth: `75px`}} placeholder={`Img Url`} type={`text`} name={`itemImage`} />
                        )}
                        <input className={`rankField itemRankField`} autoComplete={`off`} name={`rank`} placeholder={props.items.filter(itm => itemActiveFilters(itm)).length + 1} defaultValue={props.items.filter(itm => itemActiveFilters(itm)).length + 1} type={`number`} min={1} />
                        <button type={`submit`} title={`Add Item`} className={`iconButton createList wordIconButton createItemButton`}>
                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-plus"></i>
                            <span className={`iconButtonText textOverflow extended`}>
                                <span style={{ fontSize: 12 }}>
                                    Add
                                </span>
                                <span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                    {/* {list.items.length + 1} */}
                                </span>
                            </span>
                        </button>
                    </form>
                </div>
            )}
        </Draggable>
    )
}