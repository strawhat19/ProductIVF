import SubTasks from './subtasks';
import { ItemTypes } from './boards';
import ItemDetail from './itemdetail';
import CustomImage from '../custom-image';
import React, { useContext, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { showAlert, formatDate, generateUniqueID, StateContext, dev, capitalizeAllWords } from '../../pages/_app';
import Item from './item';

export const getSubTaskPercentage = (subtasks) => {
    let subtasksProgress = 0;
    let completeTasks = subtasks.filter(task => task.complete);
    subtasksProgress = parseFloat(((completeTasks.length / subtasks.length) * 100).toFixed(1));
    return subtasksProgress;
}

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

    const getTypeIcon = (type, plain?) => {
        switch (type) {
            default:
                return `+`;
            case ItemTypes.Task:
                if (plain) {
                    return `✔`
                } else {
                    return <span style={{fontSize: 20, textAlign: `center`}}>✔</span>;
                }
            case ItemTypes.Image:
                return <i style={{display: `contents`}} className="fas fa-image"></i>;
            case ItemTypes.Video:
                return <i style={{display: `contents`}} className="fab fa-youtube"></i>;
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
        };
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
        let listItems = e.target.previousSibling;
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
        window.requestAnimationFrame(() => {
            if (rank <= 5) {
                return listItems.scrollTop = 0;
            } else {
                return listItems.scrollTop = listItems.scrollHeight;
            }
        });
    }

    const manageItem = (e, item, index) => {
        if (!e.target.classList.contains(`changeLabel`)) {
            let isButton = e.target.classList.contains(`iconButton`);
            if (isButton) {
                let isManageButton = e.target.classList.contains(`manageButton`);
                if (isManageButton) {
                    dev() && console.log(`Item ${index + 1}`, item);
                    showAlert(item?.content, <ItemDetail item={item} index={index} board={board} boards={boards} setBoards={setBoards} />, `95%`, `75%`);
                };
            } else {
                dev() && console.log(`Item ${index + 1}`, item);
                showAlert(item?.content, <ItemDetail item={item} index={index} board={board} boards={boards} setBoards={setBoards} />, `95%`, `75%`);
            }
        }
    }

    const changeLabel = (e, item) => {
        let elemValue = e.target.textContent;
        let value = elemValue == `` ? capitalizeAllWords(item.task) : capitalizeAllWords(elemValue);
        if (!elemValue || elemValue == ``) {
            elemValue = capitalizeAllWords(item.task);
            return;
        };
        elemValue = capitalizeAllWords(value);
        item.updated = formatDate(new Date());
        item.content = capitalizeAllWords(value);
        localStorage.setItem(`boards`, JSON.stringify(boards));
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

    const completeItem = (e, itemId, index, item) => {
        let button = e.target;
        let isButton = button.classList.contains(`iconButton`);
        if (isButton) {
            let completeButton = button.classList.contains(`completeButton`);
            if (!completeButton) return;
        }
        if (!e.target.classList.contains(`changeLabel`)) {
            completeActions(item, index, itemId, isButton);
        }
    }

    const completeActions = (item, index, itemId, isButton) => {
        if (count == 0) {
            setLoading(true);
            setSystemStatus(`Marking Item as Complete.`);

            props.board.items[itemId].updated = formatDate(new Date());
            props.board.items[itemId].complete = !props.board.items[itemId].complete;

            props.setBoard({
                ...props.board,
                updated: formatDate(new Date()),
                items: {
                    ...props.board.items
                },
            });

            setTimeout(() => {
                setSystemStatus(item.complete ? `Marked Item as Complete.` : `Reopened Item.`);
                setLoading(false);
            }, 1000);
            if (isButton) count = count + 1;
        }
    }

    const deleteItem = (e, item, columnId, index, itemId) => {
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            e.preventDefault();
            setLoading(true);
            setSystemStatus(`Deleting Item.`);
            const column = props.board.columns[columnId];
            const newItemIds = Array.from(column.itemIds);
            newItemIds.splice(index, 1);

            const items = props.board.items;
            const { [itemId]: oldItem, ...newItems } = items;

            props.setBoard({
                ...props.board,
                updated: formatDate(new Date()),
                items: {
                    ...newItems
                },
                columns: {
                    ...props.board.columns,
                    [columnId]: {
                        ...column,
                        itemIds: newItemIds
                    }
                }
            });
            setTimeout(() => {
                setSystemStatus(`Deleted Item ${item.content}.`);
                setLoading(false);
            }, 1000);   
        }
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

    return (
        <Draggable draggableId={props.column.id} index={props.index}>
            {(provided, snapshot) => (
                <div id={props.column.id} className={`container column list ${snapshot.isDragging ? `dragging` : ``}`} {...provided.draggableProps} ref={provided.innerRef}>
                    <div style={{ position: `relative` }} id={`name_of_${props.column.id}`} title={`${props.column.title}`} className={`columnTitle flex row iconButton item listTitleButton`} {...provided.dragHandleProps}>
                        <div className="itemOrder listOrder" style={{ maxWidth: `fit-content` }}>
                            <i style={{ color: `var(--gameBlue)`, fontSize: 15, padding: `0 9px`, maxWidth: `fit-content` }} className="fas fa-list"></i>
                        </div>
                        <h3 className={`listNameRow nx-tracking-light ${props.column.title.length > 25 ? `longName` : ``}`} id={`list_name_of_${props.column.id}`} style={{ position: `relative`, fontStyle: `italic` }}>
                            <div className={`listName textOverflow extended flex row`} style={{ fontSize: 13, fontWeight: 600 }}>
                                <div onBlur={(e) => changeColumnLabel(e, props.column)} className="columnName changeLabel" contentEditable suppressContentEditableWarning>
                                    {props.column.title}    
                                </div>
                                <div className="columnStats flex row end">
                                    <span className="subscript" style={{display: `contents`,}}><span className="slashes">{props.items.filter(itm => itemActiveFilters(itm) && itm?.complete).length}</span> ✔ <div className="slashes" style={{display: `contents`}}> // </div> <span className="slashes">{props.items.filter(itm => itemActiveFilters(itm)).length}</span> ☰</span><span className="subscript" style={{display: `contents`,}}> - <span className="slashes">{[].concat(...props.items.filter(itm => itemActiveFilters(itm)).map(itm => itm?.subtasks)).filter(itm => itm?.complete).length}</span> ✔ <div className="slashes" style={{display: `contents`}}> // </div> <span className="slashes">{[].concat(...props.items.filter(itm => itemActiveFilters(itm)).map(itm => itm?.subtasks)).length}</span> ☰</span>
                                </div>
                            </div>
                        </h3>
                        <div className="itemButtons customButtons">
                            {/* <button title={`Edit List`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                            <button id={`delete_${props.column.id}`} style={{ pointerEvents: `all` }} onClick={(e) => deleteColumn(props.column.id, props.index)} title={`Delete List`} className={`iconButton deleteButton`}>
                                <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                                <span className={`iconButtonText textOverflow extended`}>Delete</span>
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
                                                <div onClick={(e) => manageItem(e, item, itemIndex)} {...provided.dragHandleProps} className={`itemRow flex row ${item?.complete ? `completed` : `incomplete`} ${item.subtasks.length > 0 ? `hasTasksRow` : `noTasksRow`}`}>
                                                    <Item 
                                                        item={item} 
                                                        count={count} 
                                                        board={board} 
                                                        column={props.column} 
                                                        itemIndex={itemIndex} 
                                                        setBoard={props.setBoard} 
                                                    />
                                                </div>
                                                {!tasksFiltered && item.subtasks && <SubTasks item={item} />}
                                            </div>
                                        )}
                                    </Draggable>
                                    )}
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <form title={`Add Item`} id={`add_item_form_${props.column.id}`} className={`flex addItemForm itemButtons unset addForm`} style={{ width: `100%`, flexDirection: `row` }} onSubmit={(e) => addNewItem(e)}>
                        <div className={`itemTypesMenu ${itemTypeMenuOpen ? `show` : ``}`}>
                            {Object.values(ItemTypes).filter(type => type !== props?.column?.itemType).map((type, typeIndex) => <div key={typeIndex} title={type} onClick={(e) => changeItemType(e, type, props.column)} className={`typeIcon menuTypeIcon`}>{getTypeIcon(type)}</div>)}
                        </div>
                        <div title={`Change ${props?.column?.itemType} Type`} onClick={(e) => changeItemType(e)} className={`typeIcon`}>{getTypeIcon(props?.column?.itemType)}</div>
                        <input placeholder={`Add`} type="text" name="createItem" required />
                        {props?.column?.itemType == ItemTypes.Image && <input style={{padding: `10px 0px 10px 15px`, minWidth: `75px`, maxWidth: `75px`}} placeholder={`Img Url`} type="text" name="itemImage" />}
                        {props?.column?.itemType == ItemTypes.Video && <input style={{padding: `10px 0px 10px 15px`, minWidth: `100px`, maxWidth: `75px`}} placeholder={`Youtube Url`} type="text" name="itemVideo" />}
                        <input name={`rank`} placeholder={props.items.filter(itm => itemActiveFilters(itm)).length + 1} defaultValue={props.items.filter(itm => itemActiveFilters(itm)).length + 1} type={`number`} min={1} />
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