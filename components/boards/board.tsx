import Column from './column';
import { toast } from 'react-toastify';
import { getBoardTitleWidth, ItemTypes } from './boards';
import ConfirmAction from '../context-menus/confirm-action';
import React, { useState, useContext, useRef } from 'react';
import { TasksFilterStates } from '../../shared/types/types';
import { Board as BoardModel } from '../../shared/models/Board';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { forceFieldBlurOnPressEnter, logToast } from '../../shared/constants';
import { deleteBoardFromDatabase, updateDocFieldsWTimeStamp } from '../../firebase';
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
    let { board } = props;
    let boardNameRef = useRef();
    
    let [showSearch, setShowSearch] = useState(false);
    let [showConfirm, setShowConfirm] = useState(false);
    let [boardName, setBoardName] = useState(board?.name ?? `Board`);

    // let [isExpanded, setIsExpanded] = useState(board?.options?.expanded);
    // let [tasksFilterState, setTasksFilterState] = useState(board?.options?.tasksFilterState);

    let { 
        user, 
        setLoading, 
        IDs, setIDs, 
        selectedGrid, 
        setSystemStatus, 
        completeFiltered, 
        boards, setBoards, 
        setCompleteFiltered, 
    } = useContext<any>(StateContext);

    const setBoardFocused = () => {
        // Empty
    }

    const filterSubtasks = (e?: any) => {
        if (board) {
            let { tasksFilterState } = board?.options;
            if (tasksFilterState == TasksFilterStates.All_On) {
                // setTasksFilterState(TasksFilterStates.Tasks);
                updateDocFieldsWTimeStamp(board, { [`options.tasksFilterState`]: TasksFilterStates.Tasks });
            }
            if (tasksFilterState == TasksFilterStates.Tasks) {
                // setTasksFilterState(TasksFilterStates.All_Off);
                updateDocFieldsWTimeStamp(board, { [`options.tasksFilterState`]: TasksFilterStates.All_Off });
            }
            if (tasksFilterState == TasksFilterStates.All_Off) {
                // setTasksFilterState(TasksFilterStates.All_On);
                updateDocFieldsWTimeStamp(board, { [`options.tasksFilterState`]: TasksFilterStates.All_On });
            }
        }
    }

    const deleteBoard = (e, bord: BoardModel, initialConfirm = true) => {
        if (showConfirm == true) {
            if (!initialConfirm) {
                finallyDeleteBoard(bord);
            }
            setShowConfirm(false);
        } else {
            let boardsListsLn = bord?.data?.listIDs;
            if (boardsListsLn?.length > 0) {
                setShowConfirm(true);
            } else {
                finallyDeleteBoard(bord);
            }
        }
    }

    const deleteBoardNoDB = (bord: BoardModel) => {
        setBoards(prevBoards => {
            let boardsWithoutDeleted = prevBoards.filter(brd => brd?.id != bord?.id);
            if (boardsWithoutDeleted.length == 1) {
                let expandIfLastBoard = true;
                boardsWithoutDeleted[0].options.expanded = expandIfLastBoard;
            }
            return boardsWithoutDeleted;
        })
    }

    const finallyDeleteBoard = async (bord: BoardModel, useDB = true) => {
        if (useDB == true) {
            const deleteBoardToast = toast.info(`Deleting Board ${bord?.name}`);
            await deleteBoardFromDatabase(bord)?.then(brd => {
                toast.dismiss(deleteBoardToast);
                logToast(`Successfully Deleted Board`, brd);
            })?.catch(deleteBrdError => {
                logToast(`Failed to Delete Board`, deleteBrdError, true);
            });
        } else {
            deleteBoardNoDB(bord);
        }
    }

    const onShowSearchClick = (e?: any) => {
        setShowSearch(!showSearch);
        toast.info(`Board Search in Development`);
    }

    const expandCollapseBoard = (e, bord: BoardModel) => {
        // setIsExpanded(!isExpanded);
        // updateDocFieldsWTimeStamp(bord, { [`options.expanded`]: !isExpanded });
        updateDocFieldsWTimeStamp(bord, { [`options.expanded`]: !bord?.options?.expanded });
    }

    const changeLabel = (e, bord: BoardModel) => {
        let value = e.target.value == `` ? capitalizeAllWords(bord.name) : capitalizeAllWords(e.target.value);
        if (value?.toLowerCase() == bord?.name?.toLowerCase()) return;

        if (!e.target.value || e.target.value == ``) {
            e.target.value = capitalizeAllWords(bord.name);
            return;
        }

        let newTitle = capitalizeAllWords(value);
        let titleWidth = getBoardTitleWidth(newTitle);

        updateDocFieldsWTimeStamp(bord, { titleWidth, name: newTitle, A: newTitle, title: `${bord?.type} ${bord?.rank} ${newTitle}` });
    }

    const addNewColumn = (e) => {
        e.preventDefault();
        setLoading(true);
        setSystemStatus(`Creating Column.`);
        let newListID = `list_${board?.data?.listIDs.length + 1}`;
        let columnID = `${newListID}_${generateUniqueID(IDs)}`;
        let formFields = e.target.children;

        const newColumnOrder = Array.from(board?.data?.listIDs);
        newColumnOrder.push(columnID);

        const newColumn = {
            itemIds: [],
            id: columnID,
            boardID: board?.id,
            itemType: ItemTypes.Item,
            title: formFields[0].value,
            created: formatDate(new Date()),
            updated: formatDate(new Date()),
            ...(user != null && {
                creator: {
                    id: user?.id,
                    uid: user?.uid,
                    name: user?.name,
                    email: user?.email,
                }
            }),
        };

        // setBoard({
        //     ...board,
        //     columnOrder: newColumnOrder,
        //     updated: formatDate(new Date()),
        //     columns: {
        //         ...board?.columns,
        //         [columnID]: newColumn
        //     }
        // });

        setIDs([...IDs, columnID]);

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
        const { destination, source, draggableId, type } = dragEndEvent;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

       if (dev()) {
           setLoading(false);
           setSystemStatus(`Rearranged.`);
       }

        if (type === `column`) {
            const newColumnOrder = Array.from(board?.data?.listIDs);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);

            // setBoard({
            //     ...board,
            //     data: {
            //         ...board.data,
            //         listIDs: newColumnOrder,
            //     }
            // });
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

            // setBoard({
            //     ...board,
            //     columns: {
            //         ...board?.columns,
            //         [newColumn.id]: newColumn
            //     }
            // });
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

        // setBoard({
        //     ...board,
        //     updated: formatDate(new Date()),
        //     columns: {
        //         ...board?.columns,
        //         [newStart.id]: newStart,
        //         [newFinish.id]: newFinish,
        //     }
        // });
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <section className={`boardsTitle boards ${props.index == 0 ? `isFirstBoardSection` : selectedGrid?.data?.boardIDs?.length == props.index - 1 ? `isLastBoardSection` : `isMiddleBoardSection`} ${selectedGrid?.options?.newestBoardsOnTop ? `newestBoardsOnTop` : `newestBoardsOnBottom`}`} style={{ paddingBottom: 0 }}>
                <div className={`board boardInner boardTitle`}>
                    <div {...props.provided.dragHandleProps} className={`boardDetailsRowContainer titleRow flex row`}>
                        <div className={`boardDetailsRow flex row innerRow ${board?.options?.expanded == true ? `expandedBoardDetailsRow` : `collapsedBoardDetailsRow`}`}>
                            <div className={`boardIndexAndTitle flex row left ${board?.options?.expanded == true ? `` : `stretch`}`}>
                                <h3 className={`boardIndexBadge`}>
                                    <span className={`subscript itemOrder slashes`}>
                                        {props.index + 1}
                                    </span>
                                </h3>
                                <h2 className={`boardTitleField ${board?.options?.expanded == true ? `` : `stretch`}`}>
                                    <input 
                                        type={`text`} 
                                        value={boardName} 
                                        ref={boardNameRef} 
                                        name={`boardName`} 
                                        title={board?.name} 
                                        id={`${board.id}_change_label`} 
                                        onBlur={(e) => changeLabel(e, board)} 
                                        onChange={(e) => changeLabel(e, board)}
                                        onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
                                        style={{ width: board?.options?.expanded == true ? (board.titleWidth ? board.titleWidth : `75px`) : `100%` }} 
                                        className={`boardNameField changeLabel textOverflow ${board?.options?.expanded == true ? `expandedBoardChangeLabel` : `stretch collapsedBoardChangeLabel`}`} 
                                    />
                                </h2>
                                {board?.options?.expanded == true && <>
                                    <h3 className={`boardDate`}>
                                        <span className={`subscript rowDate itemDate itemName itemCreated itemUpdated textOverflow extended flex row`}>
                                            <i> - </i>
                                            <i className={`status`}>
                                                {board && board?.created && !board?.updated ? `Cre.` : `Upd.` }
                                            </i> 
                                            <i>
                                                <span className={`itemDateTime`}>
                                                    {board?.updated ?? board?.created}
                                                </span>
                                            </i>
                                        </span>
                                    </h3>
                                </>}
                            </div>
                            <h3 className={`divSep`}>
                                <span className={`subscript`} style={{color: `var(--gameBlue)`}}>
                                    |
                                </span>
                            </h3>
                            <div className={`boardMetaData flex row middle`}>
                                <h3 className={`boardCount boardColumnCount`}>
                                    {board?.data?.listIDs && board?.data?.listIDs?.length} {(
                                        <span className={`boardCountLabel boardColumnCountLabel subscript`}>
                                            Column(s)
                                        </span>
                                    )}
                                </h3>
                                <h3 className={`boardCount boardItemCount`}>
                                    {board?.data?.itemIDs && board?.data?.itemIDs?.length} {(
                                        <span className={`boardCountLabel boardItemCountLabel subscript`}>
                                            Items(s)
                                        </span>
                                    )}
                                </h3>
                            </div>
                            <h3 className={`divSep`}>
                                <span className={`subscript`} style={{color: `var(--gameBlue)`}}>
                                    |
                                </span>
                            </h3>
                            <div className={`boardOptionsRow flex row right ${board?.options?.expanded == true ? `expandedBoardOptionsRow` : `collapsedBoardOptionsRow`}`}>
                                {board?.options?.expanded == true && <>
                                    <h3 className={`boardOptions filtersSubscript`}>
                                        <span className={`boardOptionsLabel subscript`}>
                                            Options   
                                        </span>
                                    </h3>
                                </>}
                                <div className={`filterFormDiv filterButtons itemButtons`} style={{textAlign: `center`, justifyContent: `space-between`, alignItems: `center`}}>
                                    {board?.options?.expanded == true && <>
                                        <button onClick={(e) =>  filterSubtasks(e)} id={`filter_tasks`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Filter Tasks`} className={`iconButton deleteButton filterButton ${(board?.options?.tasksFilterState == TasksFilterStates.Tasks || board?.options?.tasksFilterState == TasksFilterStates.All_Off) ? `filterActive` : `filterInactive`}`}>
                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${(board?.options?.tasksFilterState == TasksFilterStates.Tasks) ? `fa-times-circle` : board?.options?.tasksFilterState == TasksFilterStates.All_Off ? `fa-list-ol` : `fa-bars`}`}></i>
                                            <span className={`iconButtonText textOverflow extended`}>
                                                Tasks
                                            </span>
                                        </button>
                                        <button onClick={(e) =>  setCompleteFiltered(!completeFiltered)} id={`filter_completed`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Filter Completed`} className={`iconButton deleteButton filterButton ${completeFiltered ? `filterActive` : `filterInactive`}`}>
                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${completeFiltered ? `fa-times-circle` : `fa-check-circle`}`}></i>
                                            <span className={`iconButtonText textOverflow extended`}>
                                                Completed
                                            </span>
                                        </button>
                                        <button onClick={(e) =>  setBoardFocused()} id={`focus_board`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Focus Board`} className={`iconButton deleteButton filterButton ${board?.focused ? `filterActive` : `filterInactive`}`}>
                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${board?.focused ? `fas fa-compress-arrows-alt` : `fa-expand-arrows-alt`}`}></i>
                                            <span className={`iconButtonText textOverflow extended`}>
                                                Focus
                                            </span>
                                        </button>
                                        <button onClick={(e) =>  onShowSearchClick(e)} id={`search_board`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Search Board`} className={`iconButton searchButton filterButton ${showSearch ? `filterActive` : `filterInactive`}`}>
                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-search`} />
                                            <span className={`iconButtonText textOverflow extended`}>
                                                Search
                                            </span>
                                        </button>
                                        <section className={`addListFormItemSection`} style={{ margin: 0, padding: 0, position: `relative` }}>
                                            <div title={`Change Column Type`} onClick={(e) => toast.info(`Column Types are In Development`)} className={`typeIcon changeColumnTypeIcon ${showSearch ? `disabledIconBtn` : ``}`}>
                                                {showSearch ? <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-search`} /> : `+`}
                                            </div>
                                            <form onSubmit={addNewColumn} title={`Add Column`} id={`addListForm_${board?.id}`} className={`flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                                {showSearch && (
                                                    <input autoComplete={`off`} placeholder={`Search Board...`} type={`search`} name={`searchBoard`} />
                                                )}
                                                {!showSearch && (
                                                    <input autoComplete={`off`} maxLength={35} placeholder={`Create List +, Press "Enter" to Create New List`} type={`text`} name={`createItem`} required />
                                                )}
                                                <button type={`submit`} title={`Create Column`} className={`submit iconButton createList createColumnButton`}>
                                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-list"></i>
                                                    <span className={`iconButtonText textOverflow extended`}>
                                                        <span style={{ fontSize: 12 }}>
                                                            Create List
                                                        </span>
                                                        <span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                                            {board?.data?.listIDs && board?.data?.listIDs.length + 1}
                                                        </span>
                                                    </span>
                                                </button>
                                            </form>
                                        </section>
                                    </>}
                                    {boards?.length > 1 && (
                                        <div className={`itemButtons customButtons`}>
                                            {user?.uid == board?.ownerUID && (
                                                <button id={`delete_${board?.id}`} onClick={(e) => deleteBoard(e, board)} title={`Delete Board`} className={`iconButton deleteButton deleteBoardButton ${showConfirm ? `cancelBtn` : ``}`}>
                                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`mainIcon fas fa-${showConfirm ? `ban` : `trash`}`} />
                                                    <span className={`iconButtonText textOverflow extended`}>
                                                        {showConfirm ? `Cancel` : `Delete`}
                                                    </span>
                                                    {showConfirm && (
                                                        <ConfirmAction onConfirm={(e) => deleteBoard(e, board, false)} />
                                                    )}
                                                </button>
                                            )}
                                            <button onClick={(e) => expandCollapseBoard(e, board)} className={`iconButton`}>
                                                <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-chevron-${board?.options?.expanded == true ? `up` : `down`}`} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {board?.data?.listIDs && board?.data?.listIDs?.length > 0 && (
                <Droppable droppableId={`${board.id}_boardColumns`} direction="horizontal" type="column">
                    {(provided, snapshot) => (
                        <section id={`board_${board.id}`} className={`board lists columns container ${board?.options?.expanded == true ? `expanded` : `collapsed`} ${snapshot.isDraggingOver ? `isDraggingOver` : ``} ${board?.data?.listIDs && (board?.data?.listIDs.length == 2 ? `clipColumns` : board?.data?.listIDs.length == 3 ? `threeBoard overflowingBoard` : board?.data?.listIDs.length > 3 ? `moreBoard overflowingBoard` : ``)}`} ref={provided.innerRef} {...provided.droppableProps} style={props.style}>
                            {board?.data?.listIDs && board?.data?.listIDs.map((columnId, index) => {
                                const column = board?.columns[columnId];
                                const items = column.itemIds.map(itemId => board?.items[itemId]);
                                if (!column.itemType) column.itemType = ItemTypes.Item;
                                return (
                                    <Column 
                                        items={items} 
                                        index={index} 
                                        board={board} 
                                        column={column} 
                                        key={column?.id} 
                                        hideAllTasks={board?.options?.tasksFilterState == TasksFilterStates.All_Off} 
                                    />
                                );
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