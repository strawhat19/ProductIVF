import Board from './board';
import Title from './title';
import React, { useState, useContext, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { capitalizeAllWords, dev, formatDate, generateUniqueID, StateContext } from '../pages/_app';

export enum BoardTypes {
    Kanban = `Kanban`,
    TierList = `Tier List`,
    Spreadsheet = `Spreadsheet`,
}

export enum ColumnTypes {
    Todo = `To Do`,
    Active = `Active`,
    Testing = `Testing`,
    Complete = `Complete`,
    InProgress = `In Progress`,
    CodedNotDeployed = `Coded Not Deployed`,
}

export enum RowTypes {
    Hot = `Hot`,
    Completed = `Completed`,
}

declare global {
    interface Board {
      id: string;
      rows: Row[];
      name: string;
      created: string;
      updated?: string;
      columns: Column[];
      [key: string]: any;
      type: keyof typeof BoardTypes;
    }

    interface Column {
        id: string;
        rows: Row[];
        name: string;
        type: string;
        created: string;
        updated?: string;
        [key: string]: any;
    }

    interface Row {
      id: string;
      content: string;
      created: string;
      updated?: string;
      complete: boolean;
      [key: string]: any;
      type: keyof typeof RowTypes;
    }
}

export const kanBanColumns: Column[] = [
    {
        id: `col-1`,
        name: `To Do`,
        type: ColumnTypes.Todo,
        created: formatDate(new Date()),
        rows: [],
    },
    {
        id: `col-2`,
        name: `In Progress`,
        type: ColumnTypes.Active,
        created: formatDate(new Date()),
        rows: [],
    },
    {
        id: `col-3`,
        name: `Completed`,
        type: ColumnTypes.Complete,
        created: formatDate(new Date()),
        rows: [],
    },
]

export default function Boards(props) {
    let [filterCompletedItems, setFilterCompletedItems] = useState(false);
    let [boardFilters, setBoardFilters] = useState(Object.values(BoardTypes));
    const { boards, setBoards, setLoading, setSystemStatus, IDs, setIDs, devEnv } = useContext<any>(StateContext);

    const getBoardColumns = (boardType) => {
        switch (boardType) {
            case BoardTypes.Kanban:
                return kanBanColumns;
        }
    }

    const addNewBoard = (e) => {
        e.preventDefault();
        setLoading(true);
        let formFields = e.target.children[0].children;
        let boardType = formFields.selectBoardType.value;
        let boardName = capitalizeAllWords(formFields.createBoard.value);
        let newBoardID = `board_${boards.length + 1}_${generateUniqueID(IDs)}`;
        setSystemStatus(`Creating Board ${boardName}.`);

        let newBoard = {
            created: formatDate(new Date()),
            type: boardType,
            name: boardName,
            id: newBoardID,
            columns: getBoardColumns(boardType),
            rows: []
        }

        setBoards([...boards, newBoard]);
        setIDs([...IDs, newBoard.id]);

        if (dev()) {
            // console.log(`addNewBoard Event`, e);
            // console.log(`addNewBoard type`, boardType);
            // console.log(`addNewBoard Boards`, boards);
        }

        e.target.reset();
        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Created Board ${newBoard.name}.`);
        }, 1000);
    }

    const deleteBoard = (e, board) => {
        setLoading(true);
        setSystemStatus(`Deleting Board ${board.name}.`);

        setBoards([...boards.filter(brd => brd.id != board.id)]);

        if (dev()) {
            console.log(`Delete Board`, e, board);
        }

        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Deleted Board ${board.name}.`);
        }, 1000);
    }
  
    const deleteCol = (e, col) => {
        setLoading(true);
        setSystemStatus(`Deleting Column ${col.name}.`);

        // setBoards([...boards.filter(brd => brd.id != col.id)]);

        if (dev()) {
            console.log(`Delete Column`, e, col);
        }

        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Deleted column ${col.name}.`);
        }, 1000);
    }

    const onDragEnd = (e) => {

        if (dev()) {
            console.log(`onDragEnd Event`, e);
            console.log(`onDragEnd Boards`, boards);
        }
    }

    useEffect(() => {

        // setBoardFilters([...Object.values(BoardTypes), `Default`]);

        if (dev()) {
            // IDs.length > 0 && console.log(`IDs`, IDs);
            boards.length > 0 && console.log(`Boards`, boards);
            // boardFilters.length > 0 && console.log(`Board Filters`, boardFilters);
        }

    }, [boards, IDs]);

    return <>
        {devEnv ? <>
            <div className="createList lists extended">
                <div className={`list items addListDiv`}>
                    <div className="formItems items">
                        <div className="addListFormItem">
                            <h2 style={{ fontWeight: 600, fontSize: 22, minWidth: `fit-content` }}>Create Board {boards.length + 1}</h2>
                            <section className={`addListFormItemSection`} style={{ margin: 0 }}>
                                <form onSubmit={(e) => addNewBoard(e)} title={`Add Board`} id={`addListForm`} className={`flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                    <div className={`inputGroup flex row`}>
                                        <input maxLength={35} placeholder={`Name of Board`} type="text" name="createBoard" required />
                                        <select id={`select_board_type`} name={`selectBoardType`}>
                                            <option id={`board_option_default`} value={`Spreadsheet`}>Select Board Type</option>
                                            {Object.values(BoardTypes).map(type => {
                                                return <option key={type} id={`board_option_${type}`} value={type}>{type}</option>
                                            })}
                                        </select>
                                    </div>
                                    <button type={`submit`} title={`Create Board`} className={`iconButton createList`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-list"></i>
                                        <span className={`iconButtonText textOverflow extended`}>
                                            <span style={{ fontSize: 12 }}>Create Board</span><span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                                {boards.length + 1}
                                            </span>
                                        </span>
                                    </button>
                                </form>
                            </section>
                        </div>
                    </div>
                    {/* <div className="filterButtons itemButtons">
                        <button onClick={(e) =>  setFilterCompletedItems(!filterCompletedItems)} id={`filter_completed`} style={{ pointerEvents: `all` }} title={`Filter Completed`} className={`iconButton deleteButton filterButton ${filterCompletedItems ? `filterActive` : `filterInactive`}`}>
                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${filterCompletedItems ? `fa-times-circle` : `fa-filter`}`}></i>
                            <span className={`iconButtonText textOverflow extended`}>Filter Completed</span>
                        </button>
                    </div> */}
                </div>
            </div>
            <div className={`boards`} id={`boards`}>
                <DragDropContext onDragEnd={(e) => onDragEnd(e)}>
                    {boards.filter(board => boardFilters.includes(board.type)).map(board => {
                        // dev() && console.log(`render board`, board);
                        return (
                            <Droppable key={board.id} droppableId={`droppable-${board.id}`} direction="horizontal" type="column">
                                {(provided, snapshot) => {
                                    return <>
                                        <section id={`board`} className={`board columns container ${board.columns.length == 2 ? `clipColumns` : board.columns.length == 3 ? `threeBoard overflowingBoard` : board.columns.length > 3 ? `moreBoard overflowingBoard` : ``}`} {...provided.droppableProps} ref={provided.innerRef} style={props.style}>
                                            <Title id={`title_of_${board.id}`} className={`boardTitle`} left={board.name} right={`${board.columns.length} Columns`} buttonFunction={deleteBoard} itemID={board.id} item={board} middle={board.type} />
                                            <div className={`boardColumns flex row`}>
                                                {board.columns.map(col => {
                                                    return <Title id={`title_of_${col.id}`} className={`colTitle`} left={col.name} buttonFunction={deleteCol} itemID={col.id} item={col} key={col.id} />
                                                })}
                                            </div>
                                        </section>
                                    </>
                                }}
                            </Droppable>
                        )
                    })}
                </DragDropContext>
            </div>
        </> : <>
            {/* Board */}
            <Board />
        </>}
    </>
}