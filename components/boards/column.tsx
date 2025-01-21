import Tasks from './tasks';
// import SubTasks from './subtasks';
import { ItemTypes } from './boards';
import 'react-circular-progressbar/dist/styles.css';
import React, { useContext, useState } from 'react';
import Item, { getTypeIcon, manageItem } from './item';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { formatDate, generateUniqueID, StateContext, capitalizeAllWords, dev } from '../../pages/_app';
import SubTasks from './subtasks';
import SwapyTasks from './swapy-tasks';

export default function Column(props) {
    let count = 0;
    const { board } = props;
    let [itemTypeMenuOpen, setItemTypeMenuOpen] = useState(false);
    const { boards, setBoards, setLoading, setSystemStatus, completeFiltered, tasksFiltered, IDs, setIDs } = useContext<any>(StateContext);

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
                localStorage.setItem(`boards`, JSON.stringify(boards));
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
        elemValue = capitalizeAllWords(value);
        item.updated = formatDate(new Date());
        item.title = capitalizeAllWords(value);
        localStorage.setItem(`boards`, JSON.stringify(boards));
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

    const adjustColumnsLayout = (column, columnsNum: number) => {
        if (columnsNum >= 0 && columnsNum <= 3 && column.layoutCols != columnsNum) {
            column.layoutCols = columnsNum;
        } else {
            column.layoutCols = 1;
        }
        
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

    const deleteColumn = (columnId, index) => {
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
                updated: formatDate(new Date()),
                items: {
                    ...finalItems
                },
                columns: {
                    ...newColumns
                },
                columnOrder: newColumnOrder
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
            type: props?.column?.itemType,
            created: formatDate(new Date()),
            content: capitalizeAllWords(content),
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
                    <div className={`outerColumn`}>
                        <div style={{ position: `relative` }} id={`name_of_${props.column.id}`} title={`${props.column.title}`} className={`columnTitle flex row iconButton item listTitleButton`} {...provided.dragHandleProps}>
                            <div className={`itemOrder listOrder`} style={{ maxWidth: `fit-content` }}>
                                <i style={{ color: `var(--gameBlue)`, fontSize: 15, padding: `0 9px`, maxWidth: `fit-content` }} className={`fas fa-list`}></i>
                            </div>
                            <h3 className={`listNameRow nx-tracking-light ${props.column.title.length > 25 ? `longName` : ``}`} id={`list_name_of_${props.column.id}`} style={{ position: `relative`, fontStyle: `italic` }}>
                                <div className={`listName textOverflow extended flex row`} style={{ fontSize: 13, fontWeight: 600 }}>
                                    <div onBlur={(e) => changeColumnLabel(e, props.column)} className={`columnName changeLabel`} contentEditable suppressContentEditableWarning>
                                        {props.column.title}    
                                    </div>
                                    <div className={`columnStats flex row end`}>
                                        <span className={`subscript`} style={{display: `contents`,}}><span className={`slashes`}>{props.items.filter(itm => itemActiveFilters(itm) && itm?.complete).length}</span> ✔ <div className={`slashes`} style={{display: `contents`}}> // </div> <span className={`slashes`}>{props.items.filter(itm => itemActiveFilters(itm)).length}</span> ☰</span><span className={`subscript`} style={{display: `contents`,}}> - <span className={`slashes`}>{[].concat(...props.items.filter(itm => itemActiveFilters(itm)).map(itm => itm?.subtasks)).filter(itm => itm?.complete).length}</span> ✔ <div className={`slashes`} style={{display: `contents`}}> // </div> <span className={`slashes`}>{[].concat(...props.items.filter(itm => itemActiveFilters(itm)).map(itm => itm?.subtasks)).length}</span> ☰</span>
                                    </div>
                                </div>
                            </h3>
                            <div className={`itemButtons customButtons`}>
                                <button id={`details_Columns_${props.column.id}`} style={{ pointerEvents: `all` }} onClick={(e) => adjustColumnsDetails(props.column)} title={`Details`} className={`iconButton detailsButton`}>
                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-bars`}></i>
                                    <span className={`iconButtonText textOverflow extended`}>
                                        Details
                                    </span>
                                </button>
                                {dev() ? <>
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
                                </> : <></>}
                                <button id={`delete_${props.column.id}`} style={{ pointerEvents: `all` }} onClick={(e) => deleteColumn(props.column.id, props.index)} title={`Delete List`} className={`iconButton deleteButton`}>
                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-trash`}></i>
                                    <span className={`iconButtonText textOverflow extended`}>
                                        Delete
                                    </span>
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
                                                <div id={item.id} className={`item completeItem ${item.complete ? `complete` : ``} container ${snapshot.isDragging ? `dragging` : ``} ${itemTypeMenuOpen ? `unfocus` : ``}`} title={item.content} {...provided.draggableProps} ref={provided.innerRef}>
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
                                                    {!tasksFiltered && item.subtasks && <SwapyTasks item={item} />}
                                                    {/* {!tasksFiltered && item.subtasks && <SubTasks item={item} useSwapy={true} />} */}
                                                    {/* {!tasksFiltered && item.subtasks && itemIndex % 2 != 0 && <Tasks item={item} items={item?.subtasks} />} */}
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
                        <div className={`itemTypesMenu ${itemTypeMenuOpen ? `show` : ``}`}>
                            {Object.values(ItemTypes).filter(type => type !== props?.column?.itemType).map((type, typeIndex) => <div key={typeIndex} title={type} onClick={(e) => changeItemType(e, type, props.column)} className={`typeIcon menuTypeIcon`}>{getTypeIcon(type)}</div>)}
                        </div>
                        <div title={`Change ${props?.column?.itemType} Type`} onClick={(e) => changeItemType(e)} className={`typeIcon`}>{getTypeIcon(props?.column?.itemType)}</div>
                        <input autoComplete={`off`} placeholder={`Add`} type="text" name="createItem" required />
                        {props?.column?.itemType == ItemTypes.Image && <input autoComplete={`off`} style={{padding: `10px 0px 10px 15px`, minWidth: `75px`, maxWidth: `75px`}} placeholder={`Img Url`} type="text" name="itemImage" />}
                        {props?.column?.itemType == ItemTypes.Video && <input autoComplete={`off`} style={{padding: `10px 0px 10px 15px`, minWidth: `100px`, maxWidth: `75px`}} placeholder={`Youtube Url`} type="text" name="itemVideo" />}
                        <input autoComplete={`off`} name={`rank`} placeholder={props.items.filter(itm => itemActiveFilters(itm)).length + 1} defaultValue={props.items.filter(itm => itemActiveFilters(itm)).length + 1} type={`number`} min={1} />
                        <button type={`submit`} title={`Add Item`} className={`iconButton createList wordIconButton`}>
                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-plus"></i>
                            <span className={`iconButtonText textOverflow extended`}>
                                <span style={{ fontSize: 12 }}>Add</span>
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