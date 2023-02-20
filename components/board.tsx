import List from './list';
import React, { useState, useContext } from 'react';
import { generateUniqueID, StateContext } from '../pages/_app';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

function Board(props) {
    const { lists, setLoading, setSystemStatus } = useContext<any>(StateContext);
    const initialData = { items: {}, columns: {}, columnOrder: [] };
    const [state, setState] = useState(initialData);

    const addNewColumn = (e) => {
        e.preventDefault();
        setLoading(true);
        setSystemStatus(`Creating List.`);
        let newListID = `list_${state.columnOrder.length + 1}`;
        let columnID = `${newListID}_${generateUniqueID()}`;
        let formFields = e.target.children;

        const newColumnOrder = Array.from(state.columnOrder);
        newColumnOrder.push(columnID);

        const newColumn = {
            id: columnID,
            title: formFields[0].value,
            itemIds: [],
        };

        setState({
            ...state,
            columnOrder: newColumnOrder,
            columns: {
                ...state.columns,
                [columnID]: newColumn
            }
        });

        e.target.reset();
        setLoading(false);
        setSystemStatus(`Created List ${state.columnOrder.length + 1}.`);
    }

    const onDragEnd = (result) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        if (type === `column`) {
            const newColumnOrder = Array.from(state.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);

            setState({
                ...state,
                columnOrder: newColumnOrder,
            });
            return;
        }

        const start = state.columns[source.droppableId];
        const finish = state.columns[destination.droppableId];

        if (start === finish) {
            const newItemIds = Array.from(start.itemIds);
            newItemIds.splice(source.index, 1);
            newItemIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...start,
                itemIds: newItemIds,
            }

            setState({
                ...state,
                columns: {
                    ...state.columns,
                    [newColumn.id]: newColumn
                }
            });
            return;
        }

        const startItemIds = Array.from(start.itemIds);
        startItemIds.splice(source.index, 1);
        const newStart = {
            ...start,
            itemIds: startItemIds,
        }

        const finishItemIds = Array.from(finish.itemIds);
        finishItemIds.splice(destination.index, 0, draggableId);
        const newFinish = {
            ...finish,
            itemIds: finishItemIds,
        }

        setState({
            ...state,
            columns: {
                ...state.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            }
        });
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="createList lists extended">
                <div id={props.id} className={`list items addListDiv`}>
                    <div className="formItems items">
                        <div className="addListFormItem">
                            <h2 style={{ fontWeight: 600, fontSize: 22, minWidth: `fit-content` }}>Create List {lists.length + 1}</h2>
                            <section className={`addListFormItemSection`} style={{ margin: 0 }}>
                                <form onSubmit={addNewColumn} title={`Add List`} id={`addListForm`} className={`flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                    <input maxLength={35} placeholder={`Name of List`} type="text" name="createItem" required />
                                    <button type={`submit`} title={`Create List`} className={`iconButton createList`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-list"></i>
                                        <span className={`iconButtonText textOverflow extended`}>
                                            <span style={{ fontSize: 12 }}>Create List</span><span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                                {lists.length + 1}
                                            </span>
                                        </span>
                                    </button>
                                </form>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
                {provided => (
                    <section id={`board`} className={`board lists container ${state.columnOrder.length >= 2 ? `clipColumns` : state.columnOrder.length > 3 ? `overflowingBoard` : ``}`} {...provided.droppableProps} ref={provided.innerRef} style={props.style}>
                        {
                            state.columnOrder.map((columnId, index) => {
                                const column = state.columns[columnId];
                                const items = column.itemIds.map(itemId => state.items[itemId]);
                                return <List key={column.id} column={column} items={items} index={index} state={state} setState={setState} />;
                            })
                        }
                        {provided.placeholder}
                    </section>
                )}
            </Droppable>
        </DragDropContext>
    )
}

export default Board;