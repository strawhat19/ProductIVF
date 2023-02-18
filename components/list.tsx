import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { getItemStyle, getListStyle } from "./lists";

export const List = (props) => {

    const onDragEnd = (dragEndResults) => {
        console.log(dragEndResults);
    };

    return <DragDropContext onDragEnd={(e) => onDragEnd(e)}>
        <Droppable id={`list.id-hhkmk`} droppableId={`libhbhbhst.id`}>
            {(provided, snapshot) => (
                <div
                    id={`list.id`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`list items draggableDiv`}
                    style={getListStyle(snapshot.isDraggingOver)}
                >
                    <Draggable draggableId={`item.id`} index={`index`}>
                        {(provided, snapshot) => (
                            <div
                                id={`rtrtrdrdd.id`}
                                className={`item`}
                                {...provided.dragHandleProps}
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                title={`item.content`}
                                style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                )}
                            >
                                <Droppable id={`list.id`} droppableId={`list.id`}>
                                    {(provided, snapshot) => (
                                        <div
                                            id={`list.id`}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`list items draggableDiv`}
                                            style={getListStyle(snapshot.isDraggingOver)}
                                        >
                                            <div style={{ pointerEvents: `none`, position: `relative` }} id={`name_of_`} title={`Title`} className={`flex row iconButton item listTitleButton`}>
                                                <div className="itemOrder listOrder" style={{ maxWidth: `fit-content` }}>
                                                    <i style={{ color: `var(--gameBlue)`, fontSize: 18, padding: `0 15px`, maxWidth: `fit-content` }} className="fas fa-list"></i>
                                                </div>
                                                <h3 className={`listNameRow nx-tracking-light`} id={`list_name_of_`} style={{ position: `relative` }}>
                                                    <i className={`listName textOverflow extended`} style={{ fontSize: 13, fontWeight: 600 }}>
                                                        List Name
                                                    </i>
                                                </h3>
                                                <div className="itemButtons customButtons">
                                                    {/* <button title={`Edit List`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                                                    <button id={`delete_`} style={{ pointerEvents: `all` }} title={`Delete List`} className={`iconButton deleteButton`}>
                                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                                                        <span className={`iconButtonText textOverflow extended`}>Delete
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div id={`items_of_`} className={`items listItems`}>
                                                <Draggable draggableId={`item.id`} index={`index`}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            id={`item.id`}
                                                            className={`item`}
                                                            {...provided.dragHandleProps}
                                                            {...provided.draggableProps}
                                                            ref={provided.innerRef}
                                                            title={`item.content`}
                                                            style={getItemStyle(
                                                                snapshot.isDragging,
                                                                provided.draggableProps.style
                                                            )}
                                                        >
                                                            <span className="itemOrder">
                                                                <i className="itemIndex">{1}</i>
                                                            </span>
                                                            <span className="itemName textOverflow extended">{`item.content`}</span>
                                                            <div className="itemButtons customButtons">
                                                                {/* <button title={`Edit Item`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                                                                <button id={`delete_b`} title={`Delete Item`} className={`iconButton deleteButton wordIconButton`}>
                                                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            </div>
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        )}
                    </Draggable>

                    <Draggable draggableId={`item.id`} index={`index`}>
                        {(provided, snapshot) => (
                            <div
                                id={`rtrtrdrdd.id`}
                                className={`item`}
                                {...provided.dragHandleProps}
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                title={`item.content`}
                                style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                )}
                            >
                                <Droppable id={`list.id`} droppableId={`list.id`}>
                                    {(provided, snapshot) => (
                                        <div
                                            id={`list.id`}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`list items draggableDiv`}
                                            style={getListStyle(snapshot.isDraggingOver)}
                                        >
                                            <div style={{ pointerEvents: `none`, position: `relative` }} id={`name_of_`} title={`Title`} className={`flex row iconButton item listTitleButton`}>
                                                <div className="itemOrder listOrder" style={{ maxWidth: `fit-content` }}>
                                                    <i style={{ color: `var(--gameBlue)`, fontSize: 18, padding: `0 15px`, maxWidth: `fit-content` }} className="fas fa-list"></i>
                                                </div>
                                                <h3 className={`listNameRow nx-tracking-light`} id={`list_name_of_`} style={{ position: `relative` }}>
                                                    <i className={`listName textOverflow extended`} style={{ fontSize: 13, fontWeight: 600 }}>
                                                        List Name
                                                    </i>
                                                </h3>
                                                <div className="itemButtons customButtons">
                                                    {/* <button title={`Edit List`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                                                    <button id={`delete_`} style={{ pointerEvents: `all` }} title={`Delete List`} className={`iconButton deleteButton`}>
                                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                                                        <span className={`iconButtonText textOverflow extended`}>Delete
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div id={`items_of_`} className={`items listItems`}>
                                                <Draggable draggableId={`item.id`} index={`index`}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            id={`item.id`}
                                                            className={`item`}
                                                            {...provided.dragHandleProps}
                                                            {...provided.draggableProps}
                                                            ref={provided.innerRef}
                                                            title={`item.content`}
                                                            style={getItemStyle(
                                                                snapshot.isDragging,
                                                                provided.draggableProps.style
                                                            )}
                                                        >
                                                            <span className="itemOrder">
                                                                <i className="itemIndex">{1}</i>
                                                            </span>
                                                            <span className="itemName textOverflow extended">{`item.content`}</span>
                                                            <div className="itemButtons customButtons">
                                                                {/* <button title={`Edit Item`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                                                                <button id={`delete_b`} title={`Delete Item`} className={`iconButton deleteButton wordIconButton`}>
                                                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            </div>
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        )}
                    </Draggable>
                </div>
            )}
        </Droppable>
    </DragDropContext>
}