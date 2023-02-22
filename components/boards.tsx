import React, { useState, useContext, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { dev, formatDate, generateUniqueID, StateContext } from '../pages/_app';
import Board from './board';

export enum BoardTypes {
    Spreadsheet = `Spreadsheet`,
    Kanban = `Kanban`,
}

export enum ColumnTypes {
    Todo = `To Do`,
    Active = `Active`,
    In_Progress = `In Progress`,
    Coded_Not_Deployed = `Coded Not Deployed`,
    Testing = `Testing`,
    Complete = `Complete`,
}

export enum RowTypes {
    Hot = `Hot`,
    Completed = `Completed`,
}

declare global {
    interface Board {
      id: string;
      rows: Row[];
      created: string;
      updated?: string;
      columns: Column[];
      [key: string]: any;
      type: keyof typeof BoardTypes;
    }

    interface Column {
        id: string;
        name: string;
        rows: Row[];
        created: string;
        updated?: string;
        [key: string]: any;
        type: keyof typeof ColumnTypes;
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

export default function Boards(props) {
    let [filterCompletedItems, setFilterCompletedItems] = useState(false);
    let [boardFilters, setBoardFilters] = useState(Object.values(BoardTypes));
    const { boards, setBoards, setLoading, setSystemStatus, IDs, setIDs, devEnv } = useContext<any>(StateContext);

    const addNewBoard = (e) => {
        e.preventDefault();
        setLoading(true);
        let formFields = e.target.children;
        let boardName = formFields.createBoard.value;
        let newBoardID = `board_${boards.length + 1}_${generateUniqueID(IDs)}`;
        setSystemStatus(`Creating Board ${boardName}.`);

        let newBoard = {
            created: formatDate(new Date()),
            type: BoardTypes.Spreadsheet,
            id: newBoardID,
            columns: [],
            rows: []
        }

        setBoards([...boards, newBoard]);

        if (dev()) {
            // console.log(`addNewBoard Event`, e);
            // console.log(`addNewBoard Boards`, boards);
        }

        e.target.reset();
    }

    const onDragEnd = (e) => {

        if (dev()) {
            console.log(`onDragEnd Event`, e);
            console.log(`onDragEnd Boards`, boards);
        }
    }

    useEffect(() => {

        if (dev()) {
            IDs.length > 0 && console.log(`IDs`, IDs);
            boards.length > 0 && console.log(`Boards`, boards);
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
                                    <input maxLength={35} placeholder={`Name of Board`} type="text" name="createBoard" required />
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
                    <div className="filterButtons itemButtons">
                        <button onClick={(e) =>  setFilterCompletedItems(!filterCompletedItems)} id={`filter_completed`} style={{ pointerEvents: `all` }} title={`Filter Completed`} className={`iconButton deleteButton filterButton ${filterCompletedItems ? `filterActive` : `filterInactive`}`}>
                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${filterCompletedItems ? `fa-times-circle` : `fa-filter`}`}></i>
                            <span className={`iconButtonText textOverflow extended`}>Filter Completed</span>
                        </button>
                    </div>
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
                                            {board.columns}
                                            {provided.placeholder}
                                        </section>
                                    </>
                                }}
                            </Droppable>
                        )
                    })}
                </DragDropContext>
            </div>
        </> : <>
            <Board />
        </>}
    </>
}