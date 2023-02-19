import Column from './Column-2';
import AddColumn from './AddColumn';
// import styled from 'styled-components';
import { getItemStyle, getListStyle } from './lists';
import React, { useState, useEffect, useContext } from 'react';
import { formatDate, generateUniqueID, StateContext } from '../pages/_app';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function Board(props) {
    const { lists, setLists, setLoading, setSystemStatus, IDs, setIDs } = useContext<any>(StateContext);
    const initialData = { tasks: {}, columns: {}, columnOrder: [] };
    const [state, setState] = useState(initialData);

    useEffect(() => {
        fetchBoard().then(board => setState(board));
    }, [props.token]);

    useEffect(() => {
        if (state !== initialData) {
            saveBoard();
        }
    }, [state]);

    async function saveBoard() {
        const response = await fetch("/board", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + props.token
            },
            body: JSON.stringify(state)
        });
        const data = await response.json();
    }

    const setItemComplete = async (e: any, item: Item, list: List, index) => {
        let isButton = e.target.classList.contains(`iconButton`);
        if (!isButton) {
            setLoading(true);
            setSystemStatus(`Marking Item ${index + 1} as Complete.`);
            list.items[list.items.indexOf(item)].complete = !list.items[list.items.indexOf(item)].complete;
            list.items[list.items.indexOf(item)].updated = formatDate(new Date());
            localStorage.setItem(`lists`, JSON.stringify(lists));
            await setLists(lists);
            setTimeout(() => setLoading(false), 1500);
            setSystemStatus(`Marked Item ${index + 1} as Complete.`);
        }
    }

    async function fetchBoard() {
        const response = await fetch('/board', { headers: { "Authorization": "Bearer " + props.token } });
        const data = await response.json();
        return data.board;
    }

    const deleteList = async (e: any, list: List, index) => {
        e.preventDefault();
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            setLoading(true);
            setSystemStatus(`Deleting List.`);
            let updatedLists = lists.filter((lis: List) => lis.id != list.id);
            localStorage.setItem(`lists`, JSON.stringify(updatedLists));
            await setLists(updatedLists);
            setSystemStatus(`Deleted List #${index + 1} - ${list.name}.`);
            setTimeout(() => setLoading(false), 1500);
            // addPaddingForLists();
        }
    }

    const createItem = async (e: any, list: List) => {
        e.preventDefault();
        setLoading(true);
        setSystemStatus(`Creating Item.`);
        let newItemID = `item_${list.items.length + 1}`;
        let listItems = e.target.previousSibling;
        let formFields = e.target.children;
        let newItem: Item = {
            complete: false,
            content: formFields[0].value,
            created: formatDate(new Date()),
            id: `${newItemID}_${generateUniqueID(IDs)}`,
        };
        let updatedItems: Item[] = [...list.items, newItem];
        let updatedLists = lists.map((lis: List) => {
            if (lis.id == list.id) {
                return { ...list, items: updatedItems, updated: formatDate(new Date()) };
            } else {
                return lis;
            }
        });
        setIDs(IDs.concat(updatedLists.concat(...lists.map(lis => lis.items)).map(object => object.id)));
        localStorage.setItem(`lists`, JSON.stringify(updatedLists));
        await setLists(updatedLists);
        e.target.reset();
        setSystemStatus(`Created Item ${list.items.length + 1}.`);
        setTimeout(() => setLoading(false), 1500);
        // addPaddingForLists();
        // setTimeout(() => setAnimComplete(true), 3500);
        return listItems.scrollTop = listItems.scrollHeight;
    }

    const deleteItem = async (e: any, item: Item, list: List, lists: List[], index) => {
        e.preventDefault();
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            setLoading(true);
            setSystemStatus(`Deleting Item.`);
            let updatedItems: Item[] = [...list.items.filter(itm => itm.id != item.id)];
            let updatedLists = lists.map((lis: List, index) => {
                if (lis.id == list.id) {
                    setSystemStatus(`Deleted Item ${index + 1}.`);
                    return { ...list, items: updatedItems, updated: formatDate(new Date()) };
                } else {
                    return lis;
                }
            });
            localStorage.setItem(`lists`, JSON.stringify(updatedLists));
            await setLists(updatedLists);
            setTimeout(() => setLoading(false), 1500);
            // addPaddingForLists();
        }
    }

    function onDragEnd(result) {
        const { destination, source, draggableId, type } = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        if (type === 'column') {
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
            const newTaskIds = Array.from(start.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...start,
                taskIds: newTaskIds,
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

        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStart = {
            ...start,
            taskIds: startTaskIds,
        }

        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinish = {
            ...finish,
            taskIds: finishTaskIds,
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
            <AddColumn state={state} setState={setState} />
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
                {provided => (
                    <section id={`board`} className={`board container ${state.columnOrder.length > 3 ? `overflowingBoard` : ``}`} {...provided.droppableProps} ref={provided.innerRef}>
                        {
                            state.columnOrder.map((columnId, index) => {
                                const column = state.columns[columnId];
                                const tasks = column.taskIds.map(taskId => state.tasks[taskId]);
                                return <Column key={column.id} column={column} tasks={tasks} index={index} state={state} setState={setState} />;
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