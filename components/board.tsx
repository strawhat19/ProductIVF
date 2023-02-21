import List from './list';
import React, { useState, useContext, useEffect } from 'react';
import { dev, generateUniqueID, StateContext } from '../pages/_app';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

function Board(props) {
    const [updates, setUpdates] = useState(0);
    // const initialData = { items: {}, columns: {}, columnOrder: [] };
    // const [board, setBoard] = useState(initialData);
    const { board, setBoard, setLoading, setSystemStatus, devEnv } = useContext<any>(StateContext);

    const addNewColumn = (e) => {
        e.preventDefault();
        setLoading(true);
        setSystemStatus(`Creating Column.`);
        let newListID = `list_${board.columnOrder.length + 1}`;
        let columnID = `${newListID}_${generateUniqueID()}`;
        let formFields = e.target.children;

        const newColumnOrder = Array.from(board.columnOrder);
        newColumnOrder.push(columnID);

        const newColumn = {
            id: columnID,
            title: formFields[0].value,
            itemIds: [],
        };

        setBoard({
            ...board,
            columnOrder: newColumnOrder,
            columns: {
                ...board.columns,
                [columnID]: newColumn
            }
        });

        e.target.reset();
        setTimeout(() => {
            let newListFormInput: any = document.querySelector(`#add_item_form_${newColumn.id} input`);
            if (newListFormInput) newListFormInput.focus();
        }, 500);
        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Created Column ${board.columnOrder.length + 1}.`);
        }, 1000);
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
            const newColumnOrder = Array.from(board.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);

            setBoard({
                ...board,
                columnOrder: newColumnOrder,
            });
            return;
        }

        const start = board.columns[source.droppableId];
        const finish = board.columns[destination.droppableId];

        if (start === finish) {
            const newItemIds = Array.from(start.itemIds);
            newItemIds.splice(source.index, 1);
            newItemIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...start,
                itemIds: newItemIds,
            }

            setBoard({
                ...board,
                columns: {
                    ...board.columns,
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

        setBoard({
            ...board,
            columns: {
                ...board.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            }
        });
    }

    const filterCompleted = (e) => {
        dev() && console.log(`filterCompleted`, e, board);
        // dev() && console.log(Object.entries(board.items));
    }

    useEffect(() => {
        if (updates > 1 && board.columnOrder.length > 0) localStorage.setItem(`board`, JSON.stringify(board));

        let boardColumnItems = document.querySelectorAll(`.boardColumnItems`);
        boardColumnItems.forEach(columnItems => {
            setTimeout(() => {
                if (columnItems.scrollHeight > columnItems.clientHeight) {
                    columnItems.classList.add(`overflowingList`);
                } else {
                    columnItems.classList.remove(`overflowingList`);
                }
            }, 250);
        });

        setUpdates(updates + 1);
        // dev() && console.log(`Updates`, updates);
        dev() && board.columnOrder.length > 0 && console.log(`Board`, board);

    },  [board])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="createList lists extended">
                <div id={props.id} className={`list items addListDiv`}>
                    <div className="formItems items">
                        <div className="addListFormItem">
                            <h2 style={{ fontWeight: 600, fontSize: 22, minWidth: `fit-content` }}>Create Column {board.columnOrder.length + 1}</h2>
                            <section className={`addListFormItemSection`} style={{ margin: 0 }}>
                                <form onSubmit={addNewColumn} title={`Add Column`} id={`addListForm`} className={`flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                    <input maxLength={35} placeholder={`Name of Column`} type="text" name="createItem" required />
                                    <button type={`submit`} title={`Create Column`} className={`iconButton createList`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-list"></i>
                                        <span className={`iconButtonText textOverflow extended`}>
                                            <span style={{ fontSize: 12 }}>Create List</span><span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                                {board.columnOrder.length + 1}
                                            </span>
                                        </span>
                                    </button>
                                </form>
                            </section>
                        </div>
                    </div>
                    {devEnv && <div className="filterButtons itemButtons">
                        <button onClick={(e) => filterCompleted(e)} id={`filter_completed`} style={{ pointerEvents: `all` }} title={`Filter Completed`} className={`iconButton deleteButton filterButton`}>
                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-filter"></i>
                            <span className={`iconButtonText textOverflow extended`}>Filter Completed</span>
                        </button>
                    </div>}
                </div>
            </div>
            <Droppable droppableId={`all-columns`} direction="horizontal" type="column">
                {provided => (
                    <section id={`board`} className={`board lists container ${board.columnOrder.length == 2 ? `clipColumns` : board.columnOrder.length >= 3 ? `overflowingBoard` : ``}`} {...provided.droppableProps} ref={provided.innerRef} style={props.style}>
                        {
                            board.columnOrder.map((columnId, index) => {
                                const column = board.columns[columnId];
                                const items = column.itemIds.map(itemId => board.items[itemId]);
                                return <List key={column.id} column={column} items={items} index={index} state={board} setState={setBoard} />;
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