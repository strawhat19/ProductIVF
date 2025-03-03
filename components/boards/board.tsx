import Column from './column';
import { toast } from 'react-toastify';
import { getIDParts } from '../../shared/ID';
import { getBoardTitleWidth } from './boards';
import ConfirmAction from '../context-menus/confirm-action';
import React, { useState, useContext, useRef } from 'react';
import { createList, List } from '../../shared/models/List';
import { Board as BoardModel } from '../../shared/models/Board';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { TasksFilterStates, Types } from '../../shared/types/types';
import { capitalizeAllWords, dev, StateContext } from '../../pages/_app';
import { forceFieldBlurOnPressEnter, getRankAndNumber, logToast } from '../../shared/constants';
import { addListToDatabase, deleteBoardFromDatabase, dragItemToNewList, updateDocFieldsWTimeStamp } from '../../firebase';
import { Item } from '../../shared/models/Item';

export const taskFilterStateTransitions = {
    [TasksFilterStates.All_On]: TasksFilterStates.Tasks,
    [TasksFilterStates.Tasks]: TasksFilterStates.All_Off,
    [TasksFilterStates.All_Off]: TasksFilterStates.All_On,
}

export const tasksFilterStateLabels = {
    [TasksFilterStates.All_On]: `Hide Form`,
    [TasksFilterStates.Tasks]: `Hide All`,
    [TasksFilterStates.All_Off]: `Show w/ Form`,
}

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

    let { 
        setLoading, 
        user, users, 
        selectedGrid, 
        setSystemStatus, 
        boards, setBoards, 
        globalUserData, setGlobalUserData,
    } = useContext<any>(StateContext);

    const updateBoardInState = (updatedBoardData: Partial<BoardModel>) => {
        let { date } = getIDParts();
        setBoards(prevBoards =>
          prevBoards.map(prevBrd =>
            prevBrd.id === board?.id ? new BoardModel({ ...prevBrd, ...updatedBoardData, meta: { ...board?.meta, updated: date } }) : new BoardModel(prevBrd)
          )
        )
    }

    const toggleBoardOption = (key: string) => {
        if (board) {
            let optionToggled = board?.options[key];
            let isOptionToggled = !optionToggled;
    
            const brd: BoardModel = new BoardModel({ ...board });
            brd.options[key] = isOptionToggled;
    
            updateBoardInState(brd);
            updateDocFieldsWTimeStamp(board, { [`options.${key}`]: isOptionToggled });
        }
    }

    const onShowSearchClick = (e?: any) => {
        setShowSearch(!showSearch);
        toast.info(`Board Search in Development`);
    }

    const setBoardFocused = () => {
        if (board) toggleBoardOption(`focused`);
    }

    const setBoardHideCompleted = () => {
        if (board) toggleBoardOption(`hideCompleted`);
    }

    const expandCollapseBoard = (e) => {
        if (board) toggleBoardOption(`expanded`);
    }

    const changeLabel = (e) => {
        if (board) {
            let value = e.target.value == `` ? capitalizeAllWords(board.name) : capitalizeAllWords(e.target.value);
            if (value?.toLowerCase() == board?.name?.toLowerCase()) return;

            if (!e.target.value || e.target.value == ``) {
                e.target.value = capitalizeAllWords(board.name);
                return;
            }

            let name = capitalizeAllWords(value);
            let titleWidth = getBoardTitleWidth(name);

            updateBoardInState({ name, A: name, titleWidth, title: `${board?.type} ${board?.rank} ${name}` });
            updateDocFieldsWTimeStamp(board, { name, A: name, titleWidth, title: `${board?.type} ${board?.rank} ${name}` });
        }
    }

    const setBoardTasksFilterState = (e?: any) => {
        if (board) {
            let { tasksFilterState } = board?.options;
            let taskFilterStateToSet = tasksFilterState;

            taskFilterStateToSet = taskFilterStateTransitions[tasksFilterState];

            const brd: BoardModel = new BoardModel({ ...board });
            brd.options.tasksFilterState = taskFilterStateToSet;

            updateBoardInState(brd);
            updateDocFieldsWTimeStamp(board, { [`options.tasksFilterState`]: taskFilterStateToSet });
        }
    }

    const deleteBoard = (e, initialConfirm = true) => {
        if (board) {
            if (showConfirm == true) {
                if (!initialConfirm) {
                    finallyDeleteBoard();
                }
                setShowConfirm(false);
            } else {
                let boardsListsLn = board?.data?.listIDs;
                if (boardsListsLn?.length > 0) {
                    setShowConfirm(true);
                } else {
                    finallyDeleteBoard();
                }
            }
        }
    }

    const deleteBoardNoDB = () => {
        if (board) {
            setBoards(prevBoards => {
                let boardsWithoutDeleted = prevBoards.filter(brd => brd?.id != board?.id);
                if (boardsWithoutDeleted.length == 1) {
                    let expandIfLastBoard = true;
                    boardsWithoutDeleted[0].options.expanded = expandIfLastBoard;
                }
                return boardsWithoutDeleted;
            })
        }
    }

    const finallyDeleteBoard = async (useDB = true) => {
        if (board) {
            if (useDB == true) {
                const deleteBoardToast = toast.info(`Deleting Board ${board?.name}`);
                await deleteBoardFromDatabase(board)?.then(brd => {
                    setTimeout(() => toast.dismiss(deleteBoardToast), 1500);
                    logToast(`Successfully Deleted Board`, brd);
                })?.catch(deleteBrdError => {
                    logToast(`Failed to Delete Board`, deleteBrdError, true);
                });
            } else deleteBoardNoDB();
        }
    }

    const addNewList = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSystemStatus(`Creating List.`);

        let formFields = e.target.children;
        let name = formFields[0].value;

        if (board) {
            const { rank, number } = await getRankAndNumber(Types.List, globalUserData?.lists, board?.data?.listIDs, users, user);
            const newList = createList(number, name, user, rank, selectedGrid?.id, board?.id) as List;

            const addListToast = toast.info(`Adding List`);

            const brd: BoardModel = new BoardModel({ ...board });
            brd.data.listIDs = [...brd.data.listIDs, newList?.id];

            await updateBoardInState(brd);

            await addListToDatabase(newList, board?.id)?.then(lst => {
                if (lst?.type && lst?.type == Types.List) {
                    setTimeout(() => toast.dismiss(addListToast), 1500);
                    logToast(`Successfully Added List`, lst);
                    e.target.reset();
                    let focusInput = false;
                    if (focusInput) {
                        setTimeout(() => {
                            if (document) {
                                let newListFormInput: any = document?.querySelector(`#add_item_form_${newList?.id} input`);
                                if (newListFormInput) newListFormInput.focus();
                            }
                        }, 500);
                    }
                }
            })?.catch(addListError => {
                logToast(`Failed to Add List`, addListError, true);
            });
        }

        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Created List.`);
        }, 1000);
    }

    const onDragEnd = async (dragEndEvent) => {
        const { destination, source, draggableId, type } = dragEndEvent;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

       if (dev()) {
           setLoading(false);
           setSystemStatus(`Rearranged.`);
       }

        if (type == Types.List) {
            const listIDs = board?.data?.listIDs;
            const updatedListIDs = [...listIDs];
            updatedListIDs.splice(source.index, 1);
            updatedListIDs.splice(destination.index, 0, draggableId);

            if (board) {
                const brd: BoardModel = new BoardModel({ ...board });
                brd.data.listIDs = updatedListIDs;
                updateBoardInState(brd);
            }

            await updateDocFieldsWTimeStamp(board, { [`data.listIDs`]: updatedListIDs });
            return;
        } else {
            const thisList = globalUserData?.lists?.find(lst => lst?.id == source?.droppableId);
            const sameListDrop = thisList?.id == destination?.droppableId;

            if (thisList) {
                const sameListItemIDs = thisList?.data?.itemIDs;
                const updatedSameListItemIDs = [...sameListItemIDs];
                const thisItem = globalUserData?.items?.find(itm => itm?.id == draggableId);

                if (sameListDrop) {
                    updatedSameListItemIDs.splice(source.index, 1);
                    updatedSameListItemIDs.splice(destination.index, 0, draggableId);

                    if (thisItem) {
                        setGlobalUserData(prevGlobalUserData => {
                            let globalUserLists = [...prevGlobalUserData.lists];
                            let updatedGlobalUserLists = globalUserLists?.map((lst: List) => {
                                if (lst?.id == thisList?.id) {
                                    return new List({
                                        ...lst,
                                        data: {
                                            ...lst?.data,
                                            itemIDs: updatedSameListItemIDs,
                                        },
                                    })
                                } else return lst;
                            })
                            return {
                                ...prevGlobalUserData,
                                lists: updatedGlobalUserLists,
                            }
                        })
                    }
    
                    await updateDocFieldsWTimeStamp(thisList, { [`data.itemIDs`]: updatedSameListItemIDs });
                    return;
                } else {
                    const newList = globalUserData?.lists?.find(lst => lst?.id == destination?.droppableId);
                    if (newList) {
                        const newListItemIDs = newList?.data?.itemIDs;
                        const updatedNewListItemIDs = [...newListItemIDs];

                        updatedNewListItemIDs.splice(destination.index, 0, draggableId);
        
                        if (thisItem) {
                            setGlobalUserData(prevGlobalUserData => {
                                let globalUserItems = [...prevGlobalUserData.items];
                                let globalUserLists = [...prevGlobalUserData.lists];
                                let updatedGlobalUserItems = globalUserItems?.map((itm: Item) => {
                                    if (itm?.id == thisItem?.id) {
                                        return new Item({
                                            ...itm,
                                            listID: newList?.id,
                                        })
                                    } else return itm;
                                })
                                let updatedGlobalUserLists = globalUserLists?.map((lst: List) => {
                                    if (lst?.id == thisList?.id) {
                                        let prevSourceListItemIDs = [...lst?.data?.itemIDs];
                                        let updatedSourceListItemIDs = prevSourceListItemIDs?.filter(itmID => itmID != thisItem?.id);
                                        return new List({
                                            ...lst,
                                            data: {
                                                ...lst?.data,
                                                itemIDs: updatedSourceListItemIDs,
                                            },
                                        })
                                    } else if (lst?.id == newList?.id) {
                                        return new List({
                                            ...lst,
                                            data: {
                                                ...lst?.data,
                                                itemIDs: updatedNewListItemIDs,
                                            },
                                        })
                                    } else return lst;
                                })
                                return {
                                    ...prevGlobalUserData,
                                    items: updatedGlobalUserItems,
                                    lists: updatedGlobalUserLists,
                                }
                            })
                            await dragItemToNewList(thisItem, thisList, newList, updatedNewListItemIDs);
                            return;
                        }
                    }
                }
            }
        }
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <section className={`boardsTitle boards ${props.index == 0 ? `isFirstBoardSection` : selectedGrid?.data?.boardIDs?.length == props.index - 1 ? `isLastBoardSection` : `isMiddleBoardSection`} ${selectedGrid?.options?.newestBoardsOnTop ? `newestBoardsOnTop` : `newestBoardsOnBottom`}`} style={{ paddingBottom: 0 }}>
                <div className={`board boardInner boardTitle`}>
                    <div {...props.provided.dragHandleProps} className={`boardDetailsRowContainer titleRow flex row`}>
                        <div className={`boardDetailsRow flex row innerRow ${(boards?.length == 1 || board?.options?.expanded == true) ? `expandedBoardDetailsRow` : `collapsedBoardDetailsRow`}`}>
                            <div className={`boardIndexAndTitle flex row left ${(boards?.length == 1 || board?.options?.expanded == true) ? `` : `stretch`}`}>
                                <h3 className={`boardIndexBadge`}>
                                    <span className={`subscript itemOrder slashes`}>
                                        {props.index + 1}
                                    </span>
                                </h3>
                                <h2 className={`boardTitleField ${(boards?.length == 1 || board?.options?.expanded == true) ? `` : `stretch`}`}>
                                    <input 
                                        type={`text`} 
                                        ref={boardNameRef} 
                                        name={`boardName`} 
                                        title={board?.name} 
                                        value={board?.name} 
                                        id={`${board.id}_change_label`} 
                                        onBlur={(e) => changeLabel(e)} 
                                        onChange={(e) => changeLabel(e)}
                                        onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
                                        style={{ width: (boards?.length == 1 || board?.options?.expanded == true) ? (board.titleWidth ? board.titleWidth : `75px`) : `100%` }} 
                                        className={`boardNameField changeLabel textOverflow ${(boards?.length == 1 || board?.options?.expanded == true) ? `expandedBoardChangeLabel` : `stretch collapsedBoardChangeLabel`}`} 
                                    />
                                </h2>
                                {(boards?.length == 1 || board?.options?.expanded == true) && <>
                                    <h3 className={`boardDate`}>
                                        <span className={`subscript rowDate itemDate itemName itemCreated itemUpdated textOverflow extended flex row`}>
                                            <i> - </i>
                                            <i className={`status`}>
                                                {board && board?.meta?.created && !board?.meta?.updated ? `Cre.` : `Upd.` }
                                            </i> 
                                            <i>
                                                <span className={`itemDateTime`}>
                                                    {board?.meta?.updated ?? board?.meta?.created}
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
                                            List(s)
                                        </span>
                                    )}
                                </h3>
                                {board?.data?.listIDs && board?.data?.listIDs?.length > 0 && (
                                    <h3 className={`boardCount boardItemCount`}>
                                        {board?.data?.itemIDs && board?.data?.itemIDs?.length} {(
                                            <span className={`boardCountLabel boardItemCountLabel subscript`}>
                                                Items(s)
                                            </span>
                                        )}
                                    </h3>
                                )}
                            </div>
                            <h3 className={`divSep`}>
                                <span className={`subscript`} style={{color: `var(--gameBlue)`}}>
                                    |
                                </span>
                            </h3>
                            <div className={`boardOptionsRow flex row right ${(boards?.length == 1 || board?.options?.expanded == true) ? `expandedBoardOptionsRow` : `collapsedBoardOptionsRow`}`}>
                                {(boards?.length == 1 || board?.options?.expanded == true) && <>
                                    <h3 className={`boardOptions filtersSubscript`}>
                                        <span className={`boardOptionsLabel subscript`}>
                                            Options   
                                        </span>
                                    </h3>
                                </>}
                                <div className={`filterFormDiv filterButtons itemButtons`} style={{textAlign: `center`, justifyContent: `space-between`, alignItems: `center`}}>
                                    {(boards?.length == 1 || board?.options?.expanded == true) && <>
                                        <button onClick={(e) =>  setBoardTasksFilterState(e)} id={`filter_tasks`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Click to Set Tasks ${tasksFilterStateLabels[board?.options?.tasksFilterState]}`} className={`iconButton deleteButton filterButton ${(board?.options?.tasksFilterState == TasksFilterStates.Tasks || board?.options?.tasksFilterState == TasksFilterStates.All_Off) ? `filterActive` : `filterInactive`}`}>
                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${(board?.options?.tasksFilterState == TasksFilterStates.Tasks) ? `fa-list-ol` : board?.options?.tasksFilterState == TasksFilterStates.All_Off ? `fa-times-circle` : `fa-bars`}`}></i>
                                            <span className={`iconButtonText textOverflow extended`}>
                                                Tasks
                                            </span>
                                        </button>
                                        <button onClick={(e) =>  setBoardHideCompleted()} id={`filter_completed`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Filter Completed`} className={`iconButton deleteButton filterButton ${board?.options?.hideCompleted ? `filterActive` : `filterInactive`}`}>
                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-check-circle`} />
                                            <span className={`iconButtonText textOverflow extended`}>
                                                Completed
                                            </span>
                                        </button>
                                        <button onClick={(e) =>  setBoardFocused()} id={`focus_board`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Focus Board`} disabled={boards?.length == 1} className={`iconButton deleteButton filterButton ${(boards?.length == 1 || board?.options?.focused == true) ? `filterActive` : `filterInactive`} ${boards?.length == 1 ? `disabledField` : ``}`}>
                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${(boards?.length == 1 || board?.options?.focused == true) ? `fas fa-compress-arrows-alt` : `fa-expand-arrows-alt`}`}></i>
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
                                            <form onSubmit={addNewList} title={`Add Column`} id={`addListForm_${board?.id}`} className={`flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
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
                                                <button id={`delete_${board?.id}`} onClick={(e) => deleteBoard(e)} title={`Delete Board`} className={`iconButton deleteButton deleteBoardButton ${showConfirm ? `cancelBtn` : ``}`}>
                                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`mainIcon fas fa-${showConfirm ? `ban` : `trash`}`} />
                                                    <span className={`iconButtonText textOverflow extended`}>
                                                        {showConfirm ? `Cancel` : `Delete`}
                                                    </span>
                                                    {showConfirm && (
                                                        <ConfirmAction onConfirm={(e) => deleteBoard(e, false)} />
                                                    )}
                                                </button>
                                            )}
                                            <button onClick={(e) => expandCollapseBoard(e)} className={`iconButton`}>
                                                <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-chevron-${(boards?.length == 1 || board?.options?.expanded == true) ? `up` : `down`}`} />
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
                <Droppable droppableId={`${board.id}_boardColumns`} direction={`horizontal`} type={Types.List}>
                    {(provided, snapshot) => (
                        <section id={`board_${board.id}`} className={`board lists columns container ${(boards?.length == 1 || board?.options?.expanded == true) ? `expanded` : `collapsed`} ${snapshot.isDraggingOver ? `isDraggingOver` : ``} ${board?.data?.listIDs && (board?.data?.listIDs.length == 2 ? `clipColumns` : board?.data?.listIDs.length == 3 ? `threeBoard overflowingBoard` : board?.data?.listIDs.length > 4 ? `moreBoard overflowingBoard` : ``)}`} ref={provided.innerRef} {...provided.droppableProps} style={props.style}>
                            {board?.data?.listIDs && board?.data?.listIDs.map((listId, listIndex) => {
                                const list = globalUserData?.lists?.find(lst => lst?.id == listId);
                                if (list) {
                                    const items = [];
                                    list?.data?.itemIDs?.forEach(itmID => {
                                        let item = globalUserData?.items?.find(itm => itm?.id == itmID);
                                        if (item) items.push(item);
                                    });
                                    return (
                                        <Column 
                                            items={items} 
                                            board={board} 
                                            column={list} 
                                            key={list?.id} 
                                            index={listIndex}
                                            updateBoardInState={updateBoardInState} 
                                            hideAllTasks={board?.options?.tasksFilterState == TasksFilterStates.All_Off} 
                                        />
                                    );
                                }
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