import React, { useContext } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { showAlert, formatDate, generateUniqueID, StateContext } from '../pages/_app';

function List(props) {
    const { setLoading, setSystemStatus } = useContext<any>(StateContext);

    const addNewItem = (e) => {
        e.preventDefault();
        let formFields = e.target.children;
        const column = props.state.columns[props.column.id];
        setLoading(true);
        setSystemStatus(`Creating Item ${column.itemIds.length + 1}.`);
        let listItems = e.target.previousSibling;
        let newItemID = `item_${column.itemIds.length + 1}`;
        let itemID = `${newItemID}_${generateUniqueID()}`;
        const newItemIds = Array.from(column.itemIds);
        newItemIds.push(itemID);

        const newItem = {
            id: itemID,
            complete: false,
            content: formFields[0].value,
            created: formatDate(new Date()),
        }

        props.setState({
            ...props.state,
            items: {
                ...props.state.items,
                [itemID]: newItem
            },
            columns: {
                ...props.state.columns,
                [column.id]: {
                    ...props.state.columns[column.id],
                    itemIds: newItemIds
                }
            }
        });

        e.target.reset();
        setTimeout(() => {
            setSystemStatus(`Created Item ${column.itemIds.length + 1}.`);
            setLoading(false);
        }, 1000);
        window.requestAnimationFrame(() => {
            return listItems.scrollTop = listItems.scrollHeight;
        });
    }

    const completeItem = (itemId, index, item) => {
        setLoading(true);
        setSystemStatus(`Marking Item ${index + 1} as Complete.`);
        props.state.items[itemId].complete = !props.state.items[itemId].complete;

        props.setState({
            ...props.state,
            items: {
                ...props.state.items
            },
        });
        setTimeout(() => {
            setSystemStatus(item.complete ? `Marked Item ${index + 1} as Complete` : `Reopened Item ${index + 1}`);
            setLoading(false);
        }, 1000);
    }

    const deleteItem = (item, columnId, index, itemId) => {
        setLoading(true);
        setSystemStatus(`Deleting Item ${index + 1}.`);
        const column = props.state.columns[columnId];
        const newItemIds = Array.from(column.itemIds);
        newItemIds.splice(index, 1);

        const items = props.state.items;
        const { [itemId]: oldItem, ...newItems } = items;

        props.setState({
            ...props.state,
            items: {
                ...newItems
            },
            columns: {
                ...props.state.columns,
                [columnId]: {
                    ...column,
                    itemIds: newItemIds
                }
            }
        });
        setTimeout(() => {
            setSystemStatus(`Deleted Item ${index + 1}.`);
            setLoading(false);
        }, 1000);
    }

    const deleteColumn = (columnId, index) => {
        setLoading(true);
        setSystemStatus(`Deleting column.`);
        const columnItems = props.state.columns[columnId].itemIds;

        const finalItems = columnItems.reduce((previousValue, currentValue) => {
            const { [currentValue]: oldItem, ...newItem } = previousValue;
            return newItem;
        }, props.state.items);

        const columns = props.state.columns;
        const { [columnId]: oldColumn, ...newColumns } = columns;

        const newColumnOrder = Array.from(props.state.columnOrder);
        newColumnOrder.splice(index, 1);

        props.setState({
            items: {
                ...finalItems
            },
            columns: {
                ...newColumns
            },
            columnOrder: newColumnOrder
        });

        setTimeout(() => {
            setSystemStatus(`Deleted Column ${newColumnOrder.length + 1}.`);
            setLoading(false);
        }, 1000);
    }

    return (
        <Draggable draggableId={props.column.id} index={props.index}>
            {(provided, snapshot) => (
                <div id={props.column.id} className={`container column list ${snapshot.isDragging ? `dragging` : ``}`} {...provided.draggableProps} ref={provided.innerRef}>
                    <div {...provided.dragHandleProps} style={{ position: `relative` }} id={`name_of_${props.column.id}`} title={`${props.column.title}`} className={`columnTitle flex row iconButton item listTitleButton`}>
                        <div className="itemOrder listOrder" style={{ maxWidth: `fit-content` }}>
                            <i style={{ color: `var(--gameBlue)`, fontSize: 15, padding: `0 9px`, maxWidth: `fit-content` }} className="fas fa-list"></i>
                        </div>
                        <h3 className={`listNameRow nx-tracking-light ${props.column.title.length > 25 ? `longName` : ``}`} id={`list_name_of_${props.column.id}`} style={{ position: `relative` }}>
                            <i className={`listName textOverflow extended`} style={{ fontSize: 13, fontWeight: 600 }}>
                                {props.column.title}
                            </i>
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
                                {props.items.map((item, index) =>
                                    (<Draggable key={item.id} draggableId={item.id} index={index}>
                                        {provided => (
                                            <div id={item.id} className={`item ${item.complete ? `complete` : ``} container`} title={item.content} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                                                <span className="itemOrder">
                                                    <i className="itemIndex">{index + 1}</i>
                                                </span>
                                                <div className="itemContent">
                                                    <span className="itemName textOverflow extended">{item.content}</span>
                                                    {/* {item.created && !item.updated ? (
                                                    <span className="itemDate itemName itemCreated textOverflow extended flex row">
                                                        <i className={`status`}>Created</i> 
                                                        <span className={`itemDateTime`}>{formatDate(new Date(item.created))}</span>
                                                    </span>
                                                    ) : item.updated ? (
                                                    <span className="itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                                                        <i className={`status`}>Updated</i> 
                                                        <span className={`itemDateTime`}>{formatDate(new Date(item.updated))}</span>
                                                    </span>
                                                    ) : null} */}
                                                </div>
                                                <div className="itemButtons customButtons">
                                                    {/* <button title={`Edit Item`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                                                    <button id={`complete_${item.id}`} onClick={() => completeItem(item.id, index, item)} title={`Complete Item`} className={`iconButton deleteButton wordIconButton completeButton`}>
                                                        <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas ${item.complete ? `fa-history` : `fa-check-circle`}`}></i>
                                                    </button>
                                                    <button id={`delete_${item.id}`} onClick={() => deleteItem(item, props.column.id, index, item.id)} title={`Delete Item`} className={`iconButton deleteButton wordIconButton`}>
                                                        <i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>)
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <form title={`Add Item`} id={`add_item_form_${props.column.id}`} className={`flex addItemForm itemButtons unset addForm`} style={{ width: `100%`, flexDirection: `row` }} onSubmit={(e) => addNewItem(e)}>
                        <input placeholder={`Name of Item`} type="text" name="createItem" required />
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

export default List;