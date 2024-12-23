
import Column from './column';
import { ItemTypes } from './boards';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { capitalizeAllWords, dev, formatDate, generateUniqueID, StateContext } from '../../pages/_app';

export const addBoardScrollBars = () => {
    let boardColumnItems = document.querySelectorAll(`.boardColumnItems`);
    boardColumnItems.forEach(columnItems => {
        setTimeout(() => {
            if (columnItems.scrollHeight > columnItems.clientHeight) {
                columnItems.classList.add(`overflowingList`);
            } else {
                columnItems.classList.remove(`overflowingList`);
            }
        }, 300);
    });
}

export default function Board(props) {
    const boardNameRef = useRef();
    const [updates, setUpdates] = useState(0);
    const [board, setBoard] = useState(props.board);
    const { setBoards, setLoading, setSystemStatus, completeFiltered, setCompleteFiltered, setPage, tasksFiltered, setTasksFiltered, IDs, setIDs } = useContext<any>(StateContext);

    const filterSubtasks = (e?: any) => {
        setTasksFiltered(!tasksFiltered);
        console.log(`filterSubtasks`, !tasksFiltered);
        localStorage.setItem(`tasksFiltered`, JSON.stringify(!tasksFiltered));
    }

    const deleteBoard = (e, bord) => {
        setBoards(prevBoards => {
            return prevBoards.filter(brd => brd.id != bord.id);
        })
    }

    const onDragStart = (dragStartEvent) => {
        if (dev()) {
            setLoading(true);
            setSystemStatus(`Rearranging...`);
        }
    }

    const expandCollapseBoard = (e, board) => {
        setBoard(prevBoard => {
            return {
                ...prevBoard,
                expanded: !prevBoard.expanded
            }
        });
    }

    const changeLabel = (e, item, setItem) => {
        let value = e.target.value == `` ? capitalizeAllWords(item.name) : capitalizeAllWords(e.target.value);
        if (!e.target.value || e.target.value == ``) {
            e.target.value = capitalizeAllWords(item.name);
            return;
        };
        let titleWidth = `${(value.length * 8.5) + 80}px`;
        e.target.value = capitalizeAllWords(value);
        e.target.style.width = titleWidth;
        if (item.id.includes(`board`)) {
            setItem({ ...item, titleWidth, updated: formatDate(new Date()), name: capitalizeAllWords(value)});
        }
    }

    const addNewColumn = (e) => {
        e.preventDefault();
        setLoading(true);
        setSystemStatus(`Creating Column.`);
        let newListID = `list_${board?.columnOrder.length + 1}`;
        let columnID = `${newListID}_${generateUniqueID(IDs)}`;
        let formFields = e.target.children;

        const newColumnOrder = Array.from(board?.columnOrder);
        newColumnOrder.push(columnID);

        const newColumn = {
            itemIds: [],
            id: columnID,
            itemType: ItemTypes.Task,
            title: formFields[0].value,
        };

        setBoard({
            ...board,
            columnOrder: newColumnOrder,
            updated: formatDate(new Date()),
            columns: {
                ...board?.columns,
                [columnID]: newColumn
            }
        });

        setIDs([...IDs, columnID])

        e.target.reset();
        setTimeout(() => {
            let newListFormInput: any = document.querySelector(`#add_item_form_${newColumn.id} input`);
            if (newListFormInput) newListFormInput.focus();
        }, 500);
        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Created Column.`);
        }, 1000);
    }

    const onDragEnd = (dragEndEvent) => {
        dev() && console.log(`Board Drag`, dragEndEvent);
        const { destination, source, draggableId, type } = dragEndEvent;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

       if (dev()) {
           setLoading(false);
           setSystemStatus(`Rearranged.`);
       }

        if (type === `column`) {
            const newColumnOrder = Array.from(board?.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);

            setBoard({
                ...board,
                columnOrder: newColumnOrder,
            });
            return;
        }

        const start = board?.columns[source.droppableId];
        const finish = board?.columns[destination.droppableId];

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
                    ...board?.columns,
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
            updated: formatDate(new Date()),
            columns: {
                ...board?.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            }
        });
    }

    useEffect(() => {
        if (updates > 0) {
            // dev() && board?.columnOrder &&  board?.columnOrder.length > 0 && console.log(`Updated Board`, board);
            setBoards(prevBoards => {
                return prevBoards.map(brd => {
                    if (brd.id == board.id) {
                        return board;
                    } else {
                        return brd;
                    }
                })
            })
            // localStorage.setItem(`board`, JSON.stringify(board));
            // localStorage.setItem(`boards`, JSON.stringify(boards));
        };

        addBoardScrollBars();

        // let itemContents = document.querySelectorAll(`.boardItemContent`);
        // let arrayOfItemContents = Array.from(itemContents).map(content => content.innerHTML.toLowerCase());

        // console.clear();
        // console.log(arrayOfItemContents);
        // console.log(getCommonWords(arrayOfItemContents));

        // setBoardCategories(getCommonWords(arrayOfItemContents));
        // setCategories(boardCategories.map(cat => cat.word));

        setPage(`Boards`);
        setUpdates(updates + 1);
        // dev() && console.log(`Updates`, updates);
        // dev() && board?.columnOrder &&  board?.columnOrder.length > 0 && console.log(`Board`, board);

    },  [board])

    return (
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <section className={`boardsTitle boards`} style={{paddingBottom: 0}}>
                <div className={`board boardTitle`}>
                    <div {...props.provided.dragHandleProps} id={`titleRowOfBoard`} className={`titleRow flex row`}>
                        <div className={`flex row innerRow`}>
                            <div className={`flex row left`}>
                                <h3><span className={`subscript itemOrder slashes`}>{props.index + 1}</span></h3>
                                <h2><input type={`text`} id={`${board.id}_change_label`} ref={boardNameRef} title={board?.name} onBlur={(e) => changeLabel(e, board, setBoard)} className={`changeLabel textOverflow`} name={`boardName`} defaultValue={board?.name ?? `Board`} style={{width: board.titleWidth ? board.titleWidth : `75px`}} /></h2>
                                <h3 className={`boardDate`}>
                                    <span className={`subscript rowDate itemDate itemName itemCreated itemUpdated textOverflow extended flex row`}>
                                        <i> - </i>
                                        <i className={`status`}>{board && board?.created && !board?.updated ? `Cre.` : `Upd.` }</i> 
                                        <i><span className={`itemDateTime`}>{board?.updated ?? board?.created}</span></i>
                                    </span>
                                </h3>
                            </div>
                            <h3 className={`divSep`}><span className={`subscript`} style={{color: `var(--gameBlue)`}}>|</span></h3>
                            <div className={`flex row middle`}>
                                <h3>{board?.columnOrder && board?.columnOrder?.length} <span className={`subscript`}>Column(s)</span></h3>
                                <h3>{board?.items && Object.entries(board?.items).length} <span className={`subscript`}>Items(s)</span></h3>
                            </div>
                            <h3 className={`divSep`}><span className={`subscript`} style={{color: `var(--gameBlue)`}}>|</span></h3>
                            <div className={`flex row right`}>
                                <h3 className={`filtersSubscript`}>
                                    <span className={`subscript`}>
                                        Filters   
                                    </span>
                                </h3>
                                <div className={`filterFormDiv filterButtons itemButtons`} style={{textAlign: `center`, justifyContent: `space-between`, alignItems: `center`}}>
                                    <button onClick={(e) =>  filterSubtasks(e)} id={`filter_tasks`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Filter Tasks`} className={`iconButton deleteButton filterButton ${tasksFiltered ? `filterActive` : `filterInactive`}`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${tasksFiltered ? `fa-times-circle` : `fa-list-ol`}`}></i>
                                        <span className={`iconButtonText textOverflow extended`}>Tasks</span>
                                    </button>
                                    <button onClick={(e) =>  setCompleteFiltered(!completeFiltered)} id={`filter_completed`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Filter Completed`} className={`iconButton deleteButton filterButton ${completeFiltered ? `filterActive` : `filterInactive`}`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${completeFiltered ? `fa-times-circle` : `fa-check-circle`}`}></i>
                                        <span className={`iconButtonText textOverflow extended`}>Completed</span>
                                    </button>
                                    <button onClick={(e) =>  setBoard({...board, focused: !board?.focused})} id={`focus_board`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Focus Board`} className={`iconButton deleteButton filterButton ${board?.focused ? `filterActive` : `filterInactive`}`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${board?.focused ? `fas fa-compress-arrows-alt` : `fa-expand-arrows-alt`}`}></i>
                                        <span className={`iconButtonText textOverflow extended`}>Focus</span>
                                    </button>
                                    <section className={`addListFormItemSection`} style={{ margin: 0, padding: 0 }}>
                                        <form onSubmit={addNewColumn} title={`Add Column`} id={`addListForm`} className={`flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                            <input maxLength={35} placeholder={`New Column`} type="text" name="createItem" required />
                                            <button type={`submit`} title={`Create Column`} className={`submit iconButton createList`}>
                                                <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-list"></i>
                                                <span className={`iconButtonText textOverflow extended`}>
                                                    <span style={{ fontSize: 12 }}>Create Column</span><span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                                        {board?.columnOrder && board?.columnOrder.length + 1}
                                                    </span>
                                                </span>
                                            </button>
                                        </form>
                                    </section>
                                    <div className="itemButtons customButtons">
                                        <button id={`delete_${board?.id}`} onClick={(e) => deleteBoard(e, board)} title={`Delete Board`} className={`iconButton deleteButton`}>
                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                                            <span className={`iconButtonText textOverflow extended`}>Delete</span>
                                        </button>
                                        <button onClick={(e) => expandCollapseBoard(e, board)} className={`iconButton`}>
                                            {board?.expanded ? <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-chevron-up"></i> : <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-chevron-down"></i>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {board?.columnOrder && board?.columnOrder?.length > 0 && (
                <Droppable droppableId={`${board.id}_boardColumns`} direction="horizontal" type="column">
                    {(provided, snapshot) => (
                        <section id={`board_${board.id}`} className={`board lists columns container ${board?.expanded ? `expanded` : `collapsed`} ${snapshot.isDraggingOver ? `isDraggingOver` : ``} ${board?.columnOrder && (board?.columnOrder.length == 2 ? `clipColumns` : board?.columnOrder.length == 3 ? `threeBoard overflowingBoard` : board?.columnOrder.length > 3 ? `moreBoard overflowingBoard` : ``)}`} ref={provided.innerRef} {...provided.droppableProps} style={props.style}>
                            {board?.columnOrder && board?.columnOrder.map((columnId, index) => {
                                const column = board?.columns[columnId];
                                const items = column.itemIds.map(itemId => board?.items[itemId]);
                                if (!column.itemType) column.itemType = ItemTypes.Item;
                                return <Column key={column?.id} column={column} items={items} index={index} board={board} setBoard={setBoard} />;
                            })}
                            {provided.placeholder}
                        </section>
                    )}
                </Droppable>
                )
            }
        </DragDropContext>
    )
}