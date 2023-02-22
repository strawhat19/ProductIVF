import Board from './board';
import React, { useState, useContext, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { capitalizeAllWords, dev, formatDate, generateUniqueID, StateContext } from '../pages/_app';

export enum BoardTypes {
    Kanban = `Kanban`,
    TierList = `Tier List`,
    Spreadsheet = `Spreadsheet`,
}

export enum ColumnTypes {
    Item = `To Do`,
    Active = `Active`,
    Testing = `Testing`,
    Complete = `Complete`,
    InProgress = `In Progress`,
    CodedNotDeployed = `Coded Not Deployed`,
}

export enum RowTypes {
    Hot = `Hot`,
    Item = `To Do`,
    Active = `Active`,
    Completed = `Completed`,
}

declare global {
    interface Board {
      id: string;
      name: string;
      created: string;
      updated?: string;
      columns: Column[];
      rows: ColumnRow[];
      [key: string]: any;
      type: keyof typeof BoardTypes;
    }

    interface Column {
        id: string;
        name: string;
        type: string;
        created: string;
        updated?: string;
        rows: ColumnRow[];
        [key: string]: any;
    }

    interface ColumnRow {
      id: string;
      type: string;
      content: string;
      created: string;
      updated?: string;
      complete: boolean;
      [key: string]: any;
    }
}

export const kanBanColumns: Column[] = [
    {
        id: `col-1`,
        name: `To Do`,
        type: ColumnTypes.Item,
        created: formatDate(new Date()),
        rows: [
            {
                id: `item_1_2_20_AM_2_21_2023_5vfc49t8p`,
                complete: false,
                type: RowTypes.Item,
                content: `ayooo`,
                created: `2:20 AM 2/21/2023`,
                updated: `2:20 AM 2/21/2023`
            },
            {
                id: `item_7_2_20_AM_2_21_2023_hmhsll51c`,
                complete: true,
                type: RowTypes.Item,
                content: `whaddup`,
                created: `2:20 AM 2/21/2023`,
                updated: `2:20 AM 2/21/2023`
            },
            {
                id: `item_2_2_24_AM_2_21_2023_v7vdvq7xb`,
                complete: false,
                type: RowTypes.Item,
                content: `test item`,
                created: `2:24 AM 2/21/2023`,
                updated: `7:12 PM 2/21/2023`
            },
        ],
    },
    {
        id: `col-2`,
        name: `In Progress`,
        type: ColumnTypes.Active,
        created: formatDate(new Date()),
        rows: [
            {
                id: `item_1_2_47_AM_2_21_2023_ufobm8gds`,
                complete: true,
                type: RowTypes.Active,
                content: `detect categories`,
                created: `2:47 AM 2/21/2023`,
                updated: `7:12 PM 2/21`,
            }
        ],
    },
    {
        id: `col-3`,
        name: `Completed`,
        type: ColumnTypes.Complete,
        created: formatDate(new Date()),
        rows: [
            {
              id: `item_1_1_06_AM_2_21_2023_puvkbf5jt`,
              complete: true,
              type: RowTypes.Completed,
              content: `AdHoc Bug Fixes`,
              created: `1:06 AM 2/21/2023`,
              updated: `2:19 AM 2/21/2023`
            },
            {
              id: `item_2_1_07_AM_2_21_2023_qmpi9w53n`,
              complete: true,
              type: RowTypes.Completed,
              content: `Deploy New Code Changes`,
              created: `1:07 AM 2/21/2023`,
              updated: `1:46 AM 2/21/2023`
            },
            {
              id: `item_2_1_07_AM_2_21_2023_x1qs0ba58`,
              complete: true,
              type: RowTypes.Completed,
              content: `Release 1.5`,
              created: `1:07 AM 2/21/2023`,
              updated: `1:45 AM 2/21/2023`
            },
            {
              id: `item_2_1_07_AM_2_21_2023_cod2k6ysu`,
              complete: true,
              type: RowTypes.Completed,
              content: `Fix Notification Bugs`,
              created: `1:07 AM 2/21/2023`,
              updated: `1:07 AM 2/21/2023`
            },
            {
              id: `item_2_1_08_AM_2_21_2023_cph525xnf`,
              complete: true,
              type: RowTypes.Completed,
              content: `Refine Items In Board`,
              created: `1:08 AM 2/21/2023`,
              updated: `2:20 AM 2/21/2023`
            },
            {
              id: `item_2_1_46_AM_2_21_2023_vqp5ysdv4`,
              complete: true,
              type: RowTypes.Completed,
              content: `Filter Completed`,
              created: `1:46 AM 2/21/2023`,
              updated: `1:46 AM 2/21/2023`
            },
        ],
    },
]

export default function Boards(props) {
    let [filterCompletedItems, setFilterCompletedItems] = useState(false);
    let [boardFilters, setBoardFilters] = useState(Object.values(BoardTypes));
    const { boards, setBoards, setLoading, setSystemStatus, IDs, setIDs, devEnv } = useContext<any>(StateContext);

    const getBoardColumns = (boardType) => {
        switch (boardType) {
            default:
                return [];
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
            columns: getBoardColumns(boardType),
            created: formatDate(new Date()),
            type: boardType,
            name: boardName,
            id: newBoardID,
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
  
    const deleteColumn = (e, col) => {
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
            <div className="createBoard lists extended">
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
            <DragDropContext onDragEnd={(e) => onDragEnd(e)}>
                <Droppable droppableId={`droppable_boards`}>
                    {(provided, snapshot) => {
                        return <section className={`boards ${snapshot.isDraggingOver ? `isDraggingOver` : ``}`} id={`boards`} ref={provided.innerRef} {...provided.droppableProps}>
                        {boards.filter(board => boardFilters.includes(board.type)).map((board, boardIndex) => {
                            return (
                                <Draggable draggableId={`draggable_board_${board.id}`} key={`key_of_${board.id}`} index={boardIndex}>
                                    {(provided, snapshot) => (
                                        <article id={board.id} className={`board ${snapshot.isDragging ? `dragging` : ``}`} {...provided.draggableProps} ref={provided.innerRef}>
                                            <div id={`titleRowOf${board.id}`} className={`titleRow flex row`} {...provided.dragHandleProps}>
                                                <div className="flex row innerRow">
                                                    <div className="flex row left">
                                                        <h2>{board.name}</h2>
                                                    </div>
                                                    <div className="flex row middle" style={{textAlign: `center`}}>
                                                        <h4><i>{board.type}</i></h4>
                                                    </div>
                                                    <div className="flex row right">
                                                        <h3>{board.columns.length} <span className={`subscript`}>Columns</span></h3>
                                                        <div className="itemButtons customButtons">
                                                            <button id={`delete_${board.id}`} onClick={(e) => deleteBoard(e, board)} title={`Delete Board`} className={`iconButton deleteButton`}>
                                                                <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                                                                <span className={`iconButtonText textOverflow extended`}>Delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="createColumn createList lists extended">
                                                <div id={`addColumnFor${board.id}`} className={`list items addListDiv`}>
                                                    <div className="formItems items">
                                                        <div className="addListFormItem">
                                                            <h2 style={{ fontWeight: 600, fontSize: 22, minWidth: `fit-content` }}>Create Column {board.columns.length + 1}</h2>
                                                            <form onSubmit={(e) => addNewBoard(e)} title={`Add Column`} id={`addColumnForm`} className={`flex addListForm itemButtons addForm addColumnForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                                                <div className={`inputGroup flex row`}>
                                                                    <input maxLength={35} placeholder={`Name of Column`} type="text" name="createColumn" required />
                                                                    <select id={`select_column_type`} name={`selectColumnType`}>
                                                                        <option id={`column_option_item`} value={`Active`}>Select Column Type</option>
                                                                        {Object.values(ColumnTypes).map(type => {
                                                                            return <option key={type} id={`column_option_${type}`} value={type}>{type}</option>
                                                                        })}
                                                                    </select>
                                                                </div>
                                                                <button type={`submit`} title={`Create Column`} className={`iconButton createList`}>
                                                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-list"></i>
                                                                    <span className={`iconButtonText textOverflow extended`}>
                                                                        <span style={{ fontSize: 12 }}>Create Column</span><span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                                                            {board.columns.length + 1}
                                                                        </span>
                                                                    </span>
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                    <div className="filterButtons itemButtons">
                                                        <button id={`filter_completed`} style={{ pointerEvents: `all` }} title={`Filter Completed`} className={`iconButton deleteButton filterButton`}>
                                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-filter`}></i>
                                                            <span className={`iconButtonText textOverflow extended`}>Filter Completed</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <Droppable droppableId={`${board.id}_droppable_columns`} direction="horizontal" type="column">
                                                {(provided, snapshot) => {
                                                    return <div className={`boardColumns flex row ${snapshot.isDraggingOver ? `isDraggingOver` : ``}`} ref={provided.innerRef} {...provided.droppableProps}>
                                                    {board.columns.map((column, columnIndex) => {
                                                        return (
                                                            <Draggable draggableId={`draggable_column_figure_${column.id}`} key={`key_of_${columnIndex}`} index={columnIndex}>
                                                                {(provided, snapshot) => (
                                                                    <figure className={`column ${snapshot.isDragging ? `dragging` : ``}`} id={`column_figure_${column.id}`} {...provided.draggableProps} ref={provided.innerRef}>
                                                                        <div id={`title_of_${column.id}`} className={`titleRow flex row`} {...provided.dragHandleProps}>
                                                                            <div className="flex row innerRow">
                                                                                <div className="flex row left">
                                                                                    <h2>{column.name}</h2>
                                                                                </div>
                                                                                <div className="flex row middle" style={{textAlign: `center`}}>
                                                                                    <h4><i>{``}</i></h4>
                                                                                </div>
                                                                                <div className="flex row right">
                                                                                    <h3>{``}</h3>
                                                                                    <div className="itemButtons customButtons">
                                                                                        <button id={`delete_${column.id}`} onClick={(e) => deleteColumn(e, column)} title={`Delete Column`} className={`iconButton deleteButton`}>
                                                                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                                                                                            <span className={`iconButtonText textOverflow extended`}>Delete</span>
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <Droppable droppableId={`${column.id}_droppable_row_items`}>
                                                                        {(provided, snapshot) => {
                                                                            return <div className={`list items ${snapshot.isDraggingOver ? `isDraggingOver` : ``}`} ref={provided.innerRef} {...provided.droppableProps}>
                                                                                {column.rows.map((row, rowIndex) => {
                                                                                    return <div key={rowIndex} id={row.id} className={`item flex row`}>
                                                                                        <div className="inner">
                                                                                            <div className="itemOrder">
                                                                                                <div className="itemIndex">{rowIndex + 1}</div>
                                                                                            </div>
                                                                                            <div className="itemContent">
                                                                                                {row.content}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                })}
                                                                                {provided.placeholder}
                                                                            </div>
                                                                        }}
                                                                        </Droppable>
                                                                    </figure>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    })}
                                                    {provided.placeholder}
                                                </div>
                                                }}
                                            </Droppable>
                                        </article>
                                    )}
                                </Draggable>
                            )
                        })}
                        {provided.placeholder}
                    </section>
                    }}
                </Droppable>
            </DragDropContext>
        </> : <>
            {/* Board */}
            <Board />
        </>}
    </>
}