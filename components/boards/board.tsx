import Column from './column';
import { toast } from 'react-toastify';
import { getBoardTitleWidth } from './boards';
import { Droppable } from '@hello-pangea/dnd';
import { collection, getDocs } from 'firebase/firestore';
import ConfirmAction from '../context-menus/confirm-action';
import React, { useState, useContext, useRef } from 'react';
import { createList, List } from '../../shared/models/List';
import { Board as BoardModel } from '../../shared/models/Board';
import { capitalizeAllWords, StateContext } from '../../pages/_app';
import { GridTypes, TasksFilterStates, Types } from '../../shared/types/types';
import { forceFieldBlurOnPressEnter, getRankAndNumber, logToast } from '../../shared/constants';
import { addListToDatabase, archiveBoardInDatabase, db, deleteBoardFromDatabase, listsTable, updateDocFieldsWTimeStamp } from '../../firebase';

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
    if (boardColumnItems && boardColumnItems?.length > 0) {
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
}

export default function Board(props) {
    let { board, updateBoardInState } = props;
    let boardNameRef = useRef(undefined);
    
    let [showSearch, ] = useState(false);
    let [showConfirm, setShowConfirm] = useState(false);

    let { 
        user, 
        users,
        // width,
        setLoading, 
        selectedGrid, 
        globalUserData,
        setSystemStatus, 
        boards, setBoards, 
    } = useContext<any>(StateContext);

    const toggleBoardOption = (key: string) => {
        if (board) {
            let optionToggled = board?.options[key];
            let isOptionToggled = !optionToggled;
    
            const brd: BoardModel = new BoardModel({ ...board });
            brd.options[key] = isOptionToggled;
    
            updateBoardInState({ ...brd, id: board?.id });
            updateDocFieldsWTimeStamp(board, { [`options.${key}`]: isOptionToggled });
        }
    }

    // const onShowSearchClick = (e?: any) => {
    //     setShowSearch(!showSearch);
    //     toast.info(`Board Search in Development`);
    // }

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

            updateBoardInState({ id: board?.id, name, A: name, titleWidth, title: `${board?.type} ${board?.rank} ${name}` });
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

            updateBoardInState({ ...brd, id: board?.id });
            updateDocFieldsWTimeStamp(board, { [`options.tasksFilterState`]: taskFilterStateToSet });
        }
    }

    const deleteBoard = (e, initialConfirm = true) => {
        let isArch = selectedGrid?.gridType == GridTypes.Archived;
        if (board) {
            if (showConfirm == true) {
                if (!initialConfirm) {
                    finallyDeleteBoard(isArch);
                }
                setShowConfirm(false);
            } else {
                let boardsListsLn = board?.data?.listIDs;
                if (boardsListsLn?.length > 0) {
                    setShowConfirm(true);
                } else {
                    finallyDeleteBoard(isArch);
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

    const finallyDeleteBoard = async (archived = false, useDB = true) => {
        let action = archived ? `Delet` : `Archiv`;
        let fnToExec = archived ? deleteBoardFromDatabase : archiveBoardInDatabase;
        if (board) {
            if (useDB == true) {
                const deleteBoardToast = toast.info(`${action}ing Board ${board?.name}`);
                await fnToExec(user, board)?.then(brd => {
                    brd = brd ? brd : board;
                    setTimeout(() => toast.dismiss(deleteBoardToast), 1500);
                    logToast(`Successfully ${action}ed Board #${brd?.number}`, brd);
                })?.catch(deleteBrdError => {
                    logToast(`Failed to ${action}e Board #${board?.number}`, deleteBrdError, true);
                })?.finally(() => {
                    setTimeout(() => {
                        setLoading(false);
                        setSystemStatus(`${action}ed Board #${board?.number}`);
                    }, 1000);
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
            const listsRef = await collection(db, listsTable);
            const listsSnapshot = await getDocs(listsRef);
            const allDBLists = listsSnapshot.docs.map(doc => doc.data());
            const highestDbListRanks = allDBLists?.map((lst: List) => lst?.rank)?.sort((a, b) => b - a);
            const highestDbListRank = highestDbListRanks[0] + 1;
            const listsCount = listsSnapshot.size;
            const listRank = listsCount + 1;
            const listNumber = Math.max(rank, number, listRank, highestDbListRank);

            const newList = createList(listNumber, name, user, listNumber, selectedGrid?.id, board?.id) as List;

            const addListToast = toast.info(`Adding List`);

            const brd: BoardModel = new BoardModel({ ...board });
            brd.data.listIDs = [...brd.data.listIDs, newList?.id];

            await updateBoardInState({ ...brd, id: board?.id });

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

    const showExpandedBoard = (changeField = true) => {
        let showExpandedBoardOptions = false;
        let onlyOneBoard = boards?.length == 1;
        let boardExpanded = board?.options?.expanded == true;
        let showBoardOptions = onlyOneBoard || boardExpanded;
        showExpandedBoardOptions = showBoardOptions;
        if (changeField) {
            if (window) {
                let windowWidth = window.innerWidth;
                showExpandedBoardOptions = showBoardOptions && windowWidth > 845;
            }
        }
        return showExpandedBoardOptions;
    }

    return (
        <div id={`${board?.id}_dndContext`} className={`boardDragDropContext`}>
            <section className={`boardsTitle boards ${props.index == 0 ? `isFirstBoardSection` : selectedGrid?.data?.boardIDs?.length == props.index - 1 ? `isLastBoardSection` : `isMiddleBoardSection`} ${selectedGrid?.options?.newestBoardsOnTop ? `newestBoardsOnTop` : `newestBoardsOnBottom`} ${selectedGrid?.gridType == GridTypes.Archived ? `archivedBoardTitle` : `unarchivedBoardTitle`}`} style={{ paddingBottom: 0 }}>
                <div className={`board boardInner boardTitle`}>
                    <div {...props.provided.dragHandleProps} className={`boardDetailsRowContainer titleRow flex row`}>
                        <div className={`boardDetailsRow flex row innerRow ${showExpandedBoard() ? `expandedBoardDetailsRow` : `collapsedBoardDetailsRow`}`}>
                            <div className={`boardIndexAndTitle flex row left ${showExpandedBoard() ? `` : `stretch`}`}>
                                <h3 className={`boardIndexBadge`}>
                                    <span className={`subscript itemOrder slashes`}>
                                        {props.index + 1}
                                    </span>
                                </h3>
                                <h2 className={`boardTitleField ${showExpandedBoard() ? `` : `stretch`}`}>
                                    <input 
                                        type={`text`} 
                                        ref={boardNameRef} 
                                        name={`boardName`} 
                                        title={board?.name} 
                                        value={board?.name} 
                                        onBlur={(e) => changeLabel(e)} 
                                        id={`${board.id}_change_label`} 
                                        onChange={(e) => changeLabel(e)}
                                        onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
                                        style={{ width: showExpandedBoard() ? (board.titleWidth ? board.titleWidth : `75px`) : `100%` }} 
                                        className={`boardNameField changeLabel textOverflow ${showExpandedBoard() ? `expandedBoardChangeLabel` : `stretch collapsedBoardChangeLabel`} ${selectedGrid?.gridType == GridTypes.Archived ? `pointerEventsNone` : ``}`} 
                                    />
                                </h2>
                                {showExpandedBoard() && <>
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
                            <div className={`boardOptionsRow flex row right ${showExpandedBoard() ? `expandedBoardOptionsRow` : `collapsedBoardOptionsRow`}`}>
                                {showExpandedBoard() && <>
                                    <h3 className={`boardOptions filtersSubscript`}>
                                        <span className={`boardOptionsLabel subscript`}>
                                            Options   
                                        </span>
                                    </h3>
                                </>}
                                <div className={`filterFormDiv filterButtons itemButtons`} style={{textAlign: `center`, justifyContent: `space-between`, alignItems: `center`}}>
                                    {showExpandedBoard() && <>
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
                                        {selectedGrid?.gridType == GridTypes.Archived ? <></> : <>
                                            {/* <button onClick={(e) =>  onShowSearchClick(e)} id={`search_board`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Search Board`} className={`iconButton searchButton filterButton ${showSearch ? `filterActive` : `filterInactive`}`}>
                                                <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-search`} />
                                                <span className={`iconButtonText textOverflow extended`}>
                                                    Search
                                                </span>
                                            </button> */}
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
                                    </>}
                                    {(boards?.length > 1 || selectedGrid?.gridType == GridTypes.Archived) && (
                                        <div className={`itemButtons customButtons`}>
                                            {user?.uid == board?.ownerUID && (
                                                <button id={`delete_${board?.id}`} onClick={(e) => deleteBoard(e)} title={`${(selectedGrid?.gridType == GridTypes.Archived ? `Delete` : `Archive`)} Board`} className={`iconButton deleteButton deleteBoardButton ${showConfirm ? `cancelBtn` : ``}`}>
                                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`mainIcon fas fa-${showConfirm ? `ban` : (selectedGrid?.gridType == GridTypes.Archived ? `trash` : `folder`)}`} />
                                                    <span className={`iconButtonText textOverflow extended`}>
                                                        {showConfirm ? `Cancel` : (selectedGrid?.gridType == GridTypes.Archived ? `Delete` : `Archive`)}
                                                    </span>
                                                    {showConfirm && (
                                                        <ConfirmAction onConfirm={(e) => deleteBoard(e, false)} />
                                                    )}
                                                </button>
                                            )}
                                            {boards?.length > 1 ? <>
                                                <button onClick={(e) => expandCollapseBoard(e)} className={`iconButton`}>
                                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-chevron-${showExpandedBoard(false) ? `up` : `down`}`} />
                                                </button>
                                            </> : <></>}
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
                        <section id={`board_${board.id}`} className={`board lists columns container ${showExpandedBoard(false) ? `expanded` : `collapsed`} ${snapshot.isDraggingOver ? `isDraggingOver` : ``} ${board?.data?.listIDs && (board?.data?.listIDs.length == 2 ? `clipColumns` : board?.data?.listIDs.length == 3 ? `threeBoard overflowingBoard` : board?.data?.listIDs.length > 4 ? `moreBoard overflowingBoard` : ``)}`} ref={provided.innerRef} {...provided.droppableProps} style={props.style}>
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
        </div>
    )
}