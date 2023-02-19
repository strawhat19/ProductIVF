import React from 'react';
import Task from './Task-2';
import AddTask from './AddTask';
import { Droppable, Draggable } from 'react-beautiful-dnd';

function Column(props) {

    function deleteColumn(columnId, index) {
        const columnTasks = props.state.columns[columnId].taskIds;

        const finalTasks = columnTasks.reduce((previousValue, currentValue) => {
            const { [currentValue]: oldTask, ...newTasks } = previousValue;
            return newTasks;
        }, props.state.tasks);

        const columns = props.state.columns;
        const { [columnId]: oldColumn, ...newColumns } = columns;

        const newColumnOrder = Array.from(props.state.columnOrder);
        newColumnOrder.splice(index, 1);

        props.setState({
            tasks: {
                ...finalTasks
            },
            columns: {
                ...newColumns
            },
            columnOrder: newColumnOrder
        });
    }

    return (
        <Draggable draggableId={props.column.id} index={props.index}>
            {provided => (
                <div className={`container column list`} style={{
                    margin: 8, border: `1px solid lightgrey`,
                    borderRadius: 2,
                    width: 200,
                    display: `flex`,
                    flexDirection: `column`,
                    alignItems: `center`,
                    paddingBottom: 10, }} {...provided.draggableProps} ref={provided.innerRef}>
                    <div {...provided.dragHandleProps} style={{ position: `relative` }} id={`name_of_${props.column.id}`} title={`${props.column.title}`} className={`columnTitle flex row iconButton item listTitleButton`}>
                        <div className="itemOrder listOrder" style={{ maxWidth: `fit-content` }}>
                            <i style={{ color: `var(--gameBlue)`, fontSize: 18, padding: `0 15px`, maxWidth: `fit-content` }} className="fas fa-list"></i>
                        </div>
                        <h3 className={`listNameRow ${props.column.title.length > 25 ? `longName` : ``} nx-tracking-light`} id={`list_name_of_${props.column.id}`} style={{ position: `relative` }}>
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
                            <div className={`items`} style={{ padding: 8 }} {...provided.droppableProps} ref={provided.innerRef}>
                                {
                                    props.tasks.map((task, index) =>
                                        (<Task key={task.id} task={task} index={index} columnId={props.column.id} state={props.state} setState={props.setState} />)
                                    )
                                }
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <AddTask columnId={props.column.id} state={props.state} setState={props.setState} />
                </div>
            )}
        </Draggable>
    )
}

export default Column;