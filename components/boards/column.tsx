import Tasks from './tasks';
import { ItemTypes } from './boards';
import { updateUserFields } from '../../firebase';
import React, { useContext, useState } from 'react';
import Item, { getTypeIcon, manageItem } from './item';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import ConfirmAction from '../context-menus/confirm-action';
import { forceFieldBlurOnPressEnter, removeExtraSpacesFromString } from '../../shared/constants';
import { formatDate, generateUniqueID, StateContext, capitalizeAllWords, dev } from '../../pages/_app';

export default function Column(props) {
    let count = 0;
    let [hoverItemForm, ] = useState(false);
    let { board, column, hideAllTasks } = props;
    let [showConfirm, setShowConfirm] = useState(false);
    let [itemTypeMenuOpen, setItemTypeMenuOpen] = useState(false);
    let { user, boards, setBoards, setLoading, setSystemStatus, completeFiltered, IDs, setIDs, selected, menuPosition } = useContext<any>(StateContext);

    const updateBoards = (user) => {
        localStorage.setItem(`boards`, JSON.stringify(boards));
        if (user != null) {
            updateUserFields(user?.id, { boards });
            localStorage.setItem(`user`, JSON.stringify({ ...user, boards }));
        }
    }

    const itemActiveFilters = (itm) => {
        if (completeFiltered) {
            if (!itm.complete) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    const changeItemType = (e, type?, column?) => {
        if (!e.target.classList.contains(`menuTypeIcon`)) {
            setItemTypeMenuOpen(!itemTypeMenuOpen);
        } else {
            if (type && type != column?.itemType) {
                column.itemType = type;
                updateBoards(user);
                setItemTypeMenuOpen(!itemTypeMenuOpen);
            }
        }
    }

    const changeColumnLabel = (e, item) => {
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
        
        updateBoards(user);
    }

    const adjustColumnsDetails = (column) => {
        let showDetails = column?.details && column?.details == true;
        column.details = !showDetails;

        props.setBoard(prevBoard => {
            return {
                ...prevBoard,
                updated: formatDate(new Date()),
                columns: {
                    ...prevBoard?.columns,
                    [column?.id]: column,
                },
            }
        });

        localStorage.setItem(`boards`, JSON.stringify(boards));
    }

    const deleteColumn = (columnId, index, initialConfirm = true) => {
        if (showConfirm == true) {
            if (!initialConfirm) {
                finallyDeleteColumn(columnId, index);
            }
            setShowConfirm(false);
        } else {
            if (column?.itemIds?.length > 0) {
                setShowConfirm(true);
            } else {
                finallyDeleteColumn(columnId, index);
            }
        }
    }

    const finallyDeleteColumn = (columnId, index) => {
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
            setSystemStatus(`Deleted Column.`);
            setLoading(false);
        }, 1000);
    }

    const addNewItem = (e) => {
        e.preventDefault();
        let formFields = e.target.children;
        setLoading(true);
        const column = props.board.columns[props.column.id];
        let nextIndex = column.itemIds.length + 1;
        setSystemStatus(`Creating Item.`);
        let video = formFields.itemVideo && formFields.itemVideo.value ? formFields.itemVideo.value : ``;
        let image = formFields.itemImage && formFields.itemImage.value ? formFields.itemImage.value : ``;
        let newItemID = `item_${nextIndex}`;
        let itemID = `${newItemID}_${generateUniqueID(IDs)}`;
        let content = formFields.createItem.value;
        let rank = formFields.rank.value;
        if (!rank || rank == ``) rank = nextIndex;
        rank = parseInt(rank);
        rank = rank > nextIndex ? nextIndex : rank; 
        const newItemIds = Array.from(column.itemIds);
        newItemIds.splice(rank - 1,0,itemID);

        const newItem = {
            image,
            video,
            id: itemID,
            subtasks: [],
            complete: false,
            description: ``,
            boardID: props?.board?.id,
            listID: props?.column?.id,
            type: props?.column?.itemType,
            created: formatDate(new Date()),
            updated: formatDate(new Date()),
            content: capitalizeAllWords(content),
            ...(user != null && {
                creator: {
                    id: user?.id,
                    uid: user?.uid,
                    name: user?.name,
                    email: user?.email,
                }
            }),
        }

        props.setBoard({
            ...props.board,
            updated: formatDate(new Date()),
            items: {
                ...props.board.items,
                [itemID]: newItem
            },
            columns: {
                ...props.board.columns,
                [column.id]: {
                    ...props.board.columns[column.id],
                    itemIds: newItemIds
                }
            }
        });

        setIDs([...IDs, newItem?.id]);

        e.target.reset();
        e.target.children[0].focus();

        setTimeout(() => {
            setSystemStatus(`Created Item.`);
            setLoading(false);
        }, 1000);

        let itemsElement = document.querySelector(`#items_of_${props.column.id}`);
        if (itemsElement) {
            if (rank > 7) {
                setTimeout(() => {
                    itemsElement.scrollTop = itemsElement.scrollHeight;
                }, 0);
            }
        }
    }

    return (
        <Draggable draggableId={props.column.id} index={props.index}>
            {(provided, snapshot) => (
                <div id={props.column.id} className={`container column list columns_${board?.columnOrder && board?.columnOrder?.length} ${(board?.columnOrder && board?.columnOrder?.length > 2 || !dev()) ? `multiCol` : ``} layoutCols_${props?.column?.layoutCols ? props?.column?.layoutCols : ``} ${snapshot.isDragging ? `dragging` : ``}`} {...provided.draggableProps} ref={provided.innerRef}>
                    <div className={`columnItemsContainer outerColumn`}>
                        <div style={{ position: `relative` }} id={`name_of_${props.column.id}`} title={`${props.column.title}`} className={`columnTitle flex row iconButton item listTitleButton`} {...provided.dragHandleProps}>
                            <div className={`itemOrder listOrder`} style={{ maxWidth: `fit-content` }}>
                                <i style={{ color: `var(--gameBlue)`, fontSize: 15, padding: `0 9px`, maxWidth: `fit-content` }} className={`fas fa-list`}></i>
                            </div>
                            <h3 className={`listNameRow nx-tracking-light ${props.column.title.length > 25 ? `longName` : ``}`} id={`list_name_of_${props.column.id}`} style={{ position: `relative`, fontStyle: `italic` }}>
                                <div className={`listName textOverflow extended flex row`} style={{ fontSize: 13, fontWeight: 600 }}>
                                    <div 
                                        contentEditable 
                                        spellCheck={false}
                                        suppressContentEditableWarning
                                        onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
                                        onBlur={(e) => changeColumnLabel(e, props.column)} 
                                        className={`columnName changeLabel stretchEditable`} 
                                    >
                                        {props.column.title}    
                                    </div>
                                    <div className={`columnStats flex row end`}>
                                        <span className={`subscript`} style={{display: `contents`,}}>
                                            <span className={`slashes`}>
                                                {props.items.filter(itm => itemActiveFilters(itm) && itm?.complete).length}
                                            </span> ✔ <div className={`slashes`} style={{display: `contents`}}> // </div> <span className={`slashes`}>
                                                {props.items.filter(itm => itemActiveFilters(itm)).length}
                                            </span> ☰</span>
                                            <span className={`subscript`} style={{display: `contents`,}}> <span className={`slashes`}>
                                                {[].concat(...props.items.filter(itm => itemActiveFilters(itm)).filter(itm => itm?.complete).map(itm => itm?.subtasks)).length 
                                                + [].concat(...props.items.filter(itm => itemActiveFilters(itm)).filter(itm => !itm?.complete).map(itm => itm?.subtasks)).filter(tsk => tsk?.complete).length}
                                                {/* {[].concat(...props.items.filter(itm => itemActiveFilters(itm)).map(itm => itm?.subtasks)).filter(tsk => tsk?.complete).length} */}
                                            </span> ✔ <div className={`slashes`} style={{display: `contents`}}> // </div> <span className={`slashes`}>
                                                {[].concat(...props.items.filter(itm => itemActiveFilters(itm)).map(itm => itm?.subtasks)).length}
                                            </span> ☰</span>
                                    </div>
                                </div>
                            </h3>
                            <div className={`itemButtons customButtons`}>
                                <button id={`details_Columns_${props.column.id}`} style={{ pointerEvents: `all` }} onClick={(e) => adjustColumnsDetails(props.column)} title={`Details`} className={`columnIconButton iconButton detailsButton`}>
                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-bars`}></i>
                                    <span className={`iconButtonText textOverflow extended`}>
                                        Details
                                    </span>
                                </button>
                                {/* {dev() ? <>
                                    <button id={`layout_3Columns_${props.column.id}`} style={{ pointerEvents: `all` }} onClick={(e) => adjustColumnsLayout(props.column, 3)} title={`3 Columns`} className={`iconButton layoutButton column3Layout ${props?.column?.layoutCols ? (props?.column?.layoutCols == 3 ? `activeLayout` : `inactive`) : ``}`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-th`}></i>
                                        <span className={`iconButtonText textOverflow extended`}>
                                            3 Columns
                                        </span>
                                    </button>
                                    <button id={`layout_2Columns_${props.column.id}`} style={{ pointerEvents: `all` }} onClick={(e) => adjustColumnsLayout(props.column, 2)} title={`2 Columns`} className={`iconButton layoutButton column2Layout ${props?.column?.layoutCols ? (props?.column?.layoutCols == 2 ? `activeLayout` : `inactive`) : ``}`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-th-large`}></i>
                                        <span className={`iconButtonText textOverflow extended`}>
                                            2 Columns
                                        </span>
                                    </button>
                                </> : <></>} */}
                                <button id={`delete_${props.column.id}`} style={{ pointerEvents: `all` }} onClick={(e) => deleteColumn(props.column.id, props.index)} title={`Delete List`} className={`columnIconButton iconButton deleteButton deleteListButton ${showConfirm ? `cancelBtnList` : ``}`}>
                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`mainIcon fas fa-${showConfirm ? `ban` : `trash`}`}></i>
                                    <span className={`iconButtonText textOverflow extended`}>
                                        {showConfirm ? `Cancel` : `Delete`}
                                    </span>
                                    {showConfirm && (
                                        <ConfirmAction onConfirm={(e) => deleteColumn(props.column.id, props.index, false)} />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Droppable droppableId={props.column.id} type="task">
                            {provided => (
                                <div id={`items_of_${props.column.id}`} className={`items boardColumnItems listItems`} {...provided.droppableProps} ref={provided.innerRef}>
                                    {props.items.filter(itm => itemActiveFilters(itm)).map((item, itemIndex) => {
                                        if (!item.subtasks) item.subtasks = [];
                                        return (
                                        <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                            {provided => (
                                                <div id={item.id} className={`item boardItem ${hoverItemForm ? `itemHoverToExpand` : ``} completeItem ${item.complete ? `complete completeBoardItem` : `activeBoardItem`} container ${snapshot.isDragging ? `dragging` : ``} ${(itemTypeMenuOpen || selected != null) ? `unfocus` : ``}`} title={item.content} {...provided.draggableProps} ref={provided.innerRef}>
                                                    <div onClick={(e) => manageItem(e, item, itemIndex, board, boards, setBoards)} {...provided.dragHandleProps} className={`itemRow flex row ${item?.complete ? `completed` : `incomplete`} ${item.subtasks.length > 0 ? `hasTasksRow` : `noTasksRow`}`}>
                                                        <Item 
                                                            item={item} 
                                                            count={count} 
                                                            board={board} 
                                                            column={props.column} 
                                                            itemIndex={itemIndex} 
                                                            setBoard={props.setBoard} 
                                                        />
                                                    </div>
                                                    {!hideAllTasks && item.subtasks && (
                                                        <Tasks 
                                                            item={item} 
                                                            board={board}
                                                            column={props.column} 
                                                            showForm={!board?.tasksFiltered} 
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                        )}
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                    <form title={`Add Item`} id={`add_item_form_${props.column.id}`} className={`flex addItemForm itemButtons unset addForm`} style={{ width: `100%`, flexDirection: `row` }} onSubmit={(e) => addNewItem(e)}>
                        <div className={`itemTypesMenu ${(itemTypeMenuOpen && menuPosition == null) ? `show` : ``}`}>
                            {Object.values(ItemTypes).filter(type => type !== props?.column?.itemType).map((type, typeIndex) => (
                                <div key={typeIndex} title={type} onClick={(e) => changeItemType(e, type, props.column)} className={`typeIcon itemTypeIconRow menuTypeIcon hoverGlowButton`}>
                                    <div className={`typeIconIcon`}>
                                        {getTypeIcon(type)}
                                    </div>
                                    <div className={`typeIconText`}>
                                        {type}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div title={`Change ${props?.column?.itemType} Type`} onClick={(e) => changeItemType(e)} className={`typeIcon changeItemTypeIcon hoverGlowButton`}>
                            {getTypeIcon(props?.column?.itemType)}
                        </div>
                        <input autoComplete={`off`} placeholder={`Create Item +`} type="text" name="createItem" required />
                        {props?.column?.itemType == ItemTypes.Image && (
                            <input autoComplete={`off`} style={{padding: `10px 0px 10px 15px`, minWidth: `75px`, maxWidth: `75px`}} placeholder={`Img Url`} type="text" name="itemImage" />
                        )}
                        {/* {props?.column?.itemType == ItemTypes.Video && (
                            <input autoComplete={`off`} style={{padding: `10px 0px 10px 15px`, minWidth: `100px`, maxWidth: `75px`}} placeholder={`Youtube Url`} type="text" name="itemVideo" />
                        )} */}
                        <input autoComplete={`off`} name={`rank`} placeholder={props.items.filter(itm => itemActiveFilters(itm)).length + 1} defaultValue={props.items.filter(itm => itemActiveFilters(itm)).length + 1} type={`number`} min={1} />
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