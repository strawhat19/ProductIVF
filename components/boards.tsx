import Board from './board';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { capitalizeAllWords, dev, formatDate, generateUniqueID, StateContext } from '../pages/_app';

export enum BoardTypes {
    ToDo = `To Do`,
    Kanban = `Kanban`,
    TierList = `Tier List`,
    Spreadsheet = `Spreadsheet`,
    SelectBoardType = `Select Board Type`,
}

export enum ColumnTypes {
    ToDo = `To Do`,
    Active = `Active`,
    Testing = `Testing`,
    Complete = `Complete`,
    InProgress = `In Progress`,
    SelectColumnType = `Select Column Type`,
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
        name: `To Do`,
        type: ColumnTypes.ToDo,
        id: generateUniqueID(false, `column`),
        created: formatDate(new Date()),
        rows: [
            {
                id: `item_1_2_20_AM_2_21_2023_5vfc49t8p`,
                complete: false,
                type: RowTypes.Item,
                content: `Finish Making ProductIVF App`,
                created: `2:20 AM 2/21/2023`,
                updated: `2:20 AM 2/21/2023`
            },
            {
                id: `item_7_2_20_AM_2_21_2023_hmhsll51c`,
                complete: true,
                type: RowTypes.Item,
                content: `Drag This Ticket, since its complete`,
                created: `2:20 AM 2/21/2023`,
                updated: `2:20 AM 2/21/2023`
            },
            {
                id: `item_2_2_24_AM_2_21_2023_v7vdvq7xb`,
                complete: false,
                type: RowTypes.Item,
                content: `Testing Initials RUA`,
                created: `2:24 AM 2/21/2023`,
                updated: `7:12 PM 2/21/2023`
            },
        ],
    },
    {
        name: `In Progress`,
        type: ColumnTypes.Active,
        id: generateUniqueID(false, `column`),
        created: formatDate(new Date()),
        rows: [
            {
                id: `item_1_2_47_AM_2_21_2023_ufobm8gds`,
                complete: true,
                type: RowTypes.Active,
                content: `Detect Categories`,
                created: `2:47 AM 2/21/2023`,
                updated: `7:12 PM 2/21`,
            }
        ],
    },
    {
        name: `Completed`,
        type: ColumnTypes.Complete,
        id: generateUniqueID(false, `column`),
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
    // let boardsColumnRowsRef = useRef<any>(null);
    let [filterCompletedItems, setFilterCompletedItems] = useState(false);
    let [boardFilters, setBoardFilters] = useState(Object.values(BoardTypes));
    const { boards, setBoards, setLoading, setSystemStatus, IDs, setIDs, devEnv } = useContext<any>(StateContext);

    const getBoardColumnsFromType = (boardType) => {
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
        // let boardsSection = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.nextSibling;

        if (boardType == BoardTypes.SelectBoardType) {
            boardType = BoardTypes.ToDo;
            if (boardName.includes(`Spread`)) boardType = BoardTypes.Spreadsheet;
            if (boardName.includes(`Sheet`)) boardType = BoardTypes.Spreadsheet;
            if (boardName.includes(`Tier`)) boardType = BoardTypes.TierList;
            if (boardName.includes(`Kan`)) boardType = BoardTypes.Kanban;
        }

        let newBoardID = `board_${boards.length + 1}_${generateUniqueID(IDs)}`;
        setSystemStatus(`Creating Board ${boardName}.`);

        let newBoard = {
            rows: [].concat(...getBoardColumnsFromType(boardType).map(col => col.rows)),
            columns: getBoardColumnsFromType(boardType),
            created: formatDate(new Date()),
            type: boardType,
            name: boardName,
            id: newBoardID,
        }

        if (dev()) {
            console.log(`addNewBoard Event`, e);
            // console.log(`addNewBoard type`, boardType);
            // console.log(`addNewBoard Boards`, boards);
        }

        setBoards([...boards, newBoard]);
        setIDs([...IDs, newBoard.id]);

        e.target.reset();
        // window.requestAnimationFrame(() => {
        //     return boardsSection.scrollTop = boardsSection.scrollHeight;
        // });
        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Created Board ${newBoard.name}.`);
        }, 1000);
    }

    const addNewColumn = (e, board) => {
        e.preventDefault();
        setLoading(true);
        let formFields = e.target.children[0].children;
        let columnType = formFields.selectColumnType.value;
        let columnName = capitalizeAllWords(formFields.createColumn.value);
        let newColumnID = `column_${board.columns.length + 1}_${generateUniqueID(IDs)}_ofBoard_${board.id}`;
        let boardColumns = e.target.parentElement.parentElement.parentElement.parentElement.nextSibling;

        if (columnType == ColumnTypes.SelectColumnType) {
            columnType = ColumnTypes.ToDo;
        }

        setSystemStatus(`Creating Column ${columnName}.`);

        let newColumn: Column = {
            rows: [].concat(...getBoardColumnsFromType(columnType).map(col => col.rows)),
            created: formatDate(new Date()),
            type: columnType,
            name: columnName,
            id: newColumnID,
        }

        setBoards(previousBoards => {
            return previousBoards.map((bord, bordIndex) => {
                if (bord.id == board.id) {
                    return {
                        ...bord,
                        updated: formatDate(new Date()),
                        columns: [...bord.columns, newColumn]
                    }
                } else {
                    return bord;
                }
            })
        });

        setIDs([...IDs, newColumn.id]);

        e.target.reset();
        window.requestAnimationFrame(() => {
            return boardColumns.scrollLeft = boardColumns.scrollWidth - boardColumns.clientWidth;
        });
        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Created Column ${newColumn.name}.`);
        }, 1000);
    }
    
    const addNewRow = (e, column, nextIndex, board) => {
        e.preventDefault();
        setLoading(true);
        let formFields = e.target.children;
        let rank = formFields.rowInsertIndex.value == `` ? nextIndex - 1 : parseInt(formFields.rowInsertIndex.value) - 1;
        if (rank >= nextIndex) rank = nextIndex;
        let rowContent = capitalizeAllWords(formFields.createRow.value);
        let newRowID = `row_${nextIndex}_${generateUniqueID(IDs)}`;
        setSystemStatus(`Creating Row.`);

        let newRow: ColumnRow = {
            created: formatDate(new Date()),
            content: rowContent,
            type: RowTypes.Item,
            complete: false,
            id: newRowID,
        }

        column.rows.splice(rank,0,newRow);
        localStorage.setItem(`boards`, JSON.stringify(boards));

        // setBoards(boards);
        setIDs([...IDs, newRow.id]);

        if (dev()) {
            // console.log(`addNewRow`, boards);
            // console.log(`addNewRow Event`, e);
            // console.log(`addNewRow type`, boardType);
            // console.log(`addNewRow Boards`, boards);
            // console.log(`addNewRow`, {rowContent, rank, newRow, boards});
        }

        e.target.reset();
        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Created Row.`);
        }, 1000);
    }

    const completeRow = (e, row, rowIndex) => {
        setLoading(true);
        setSystemStatus(`Marking Row ${rowIndex + 1} as Complete.`);

        row.complete = !row.complete;
        localStorage.setItem(`boards`, JSON.stringify(boards));

        // setBoards([...boards.filter(brd => brd.id != col.id)]);

        if (dev()) {
            console.log(`Complete Row`, e, row, boards);
        }

        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Marked Row ${rowIndex + 1} as Complete.`);
        }, 1000);
    }

    const deleteBoard = (e, board) => {
        setLoading(true);
        setSystemStatus(`Deleting Board ${board.name}.`);

        setBoards([...boards.filter(brd => brd.id != board.id)]);

        // if (dev()) {
        //     console.log(`Delete Board`, e, board);
        // }

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

    const deleteRow = (e, row) => {
        setLoading(true);
        setSystemStatus(`Deleting Row ${row.content}.`);

        // setBoards([...boards.filter(brd => brd.id != col.id)]);

        if (dev()) {
            console.log(`Delete Row`, e, row);
        }

        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Deleted Row ${row.content}.`);
        }, 1000);
    }

    const onDragEnd = ({ destination, source, draggableId, type, mode, reason, combine }, e?) => {
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        let newBoards = [...boards];

        if (type == `DEFAULT`) {
            if (draggableId.includes(`draggable_board`)) {
                let [removedBoard] = newBoards.splice(source.index, 1);
                newBoards.splice(destination.index, 0, removedBoard);
            }
        } else if (type == `column`) {
            if (draggableId.includes(`draggable_column_figure`)) {
                console.log(`Column Move`, {draggableId, destination, source, type, mode, reason});
            }
            // let [removedColumn] = newBoards.columns.splice(source.index, 1);
            // console.log(removedColumn);
            // newBoards.splice(destination.index, 0, removedColumn);
        }

        setBoards(newBoards);

        if (dev()) {
            // console.log(`onDragEnd Event`, e);
        }
    }

    useEffect(() => {

        // setBoardFilters([...Object.values(BoardTypes), `Default`]);

        let allRows = document.querySelectorAll(`.rows`);
        allRows.forEach(rowOfItems => {
            // setTimeout(() => {
                if (rowOfItems.scrollHeight > rowOfItems.clientHeight) {
                    rowOfItems.classList.add(`overflowingList`);
                } else {
                    rowOfItems.classList.remove(`overflowingList`);
                }
            // }, 250);
        });

        if (dev()) {
            // IDs.length > 0 && console.log(`IDs`, IDs);
            boards.length > 0 && console.log(`Boards`, boards);
            // boardFilters.length > 0 && console.log(`Board Filters`, boardFilters);
        }

    }, [boards]);

    return <>
        <div className="createBoard lists extended">
            <div className={`list items addListDiv`}>
                <div className="formItems items">
                    <div className="addListFormItem">
                        <h2 style={{ fontWeight: 600, fontSize: 22, minWidth: `fit-content` }}>Create Board {boards.length + 1}</h2>
                        <section className={`addBoardFormSection addListFormItemSection`} style={{ margin: 0 }}>
                            <form onSubmit={(e) => addNewBoard(e)} title={`Add Board`} id={`addBoardForm`} className={`addBoardForm flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                <div className={`inputGroup flex row`}>
                                    <input maxLength={35} placeholder={`Name of Board`} type="text" name="createBoard" required />
                                    <select id={`select_board_type`} name={`selectBoardType`}>
                                        <option id={`board_option_default`} value={`Select Board Type`}>Select Board Type</option>
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
        <DragDropContext onDragEnd={(e) => onDragEnd(e, e)}>
            <Droppable droppableId={`droppable_boards`}>
                {(provided, snapshot) => {
                    return <section className={`boards ${snapshot.isDraggingOver ? `isDraggingOver` : ``}`} id={`boards`} ref={provided.innerRef} {...provided.droppableProps}>
                    {boards.filter(board => boardFilters.includes(board.type)).map((board, boardIndex) => {
                        return (
                            <Draggable draggableId={`draggable_${board.id}`} key={`key_of_${boardIndex}`} index={boardIndex}>
                                {(provided, snapshot) => (
                                    <article id={board.id} className={`board lists ${snapshot.isDragging ? `dragging` : ``}`} {...provided.draggableProps} ref={provided.innerRef}>
                                        <div id={`titleRowOf${board.id}`} className={`titleRow flex row`} {...provided.dragHandleProps}>
                                            <div className="flex row innerRow">
                                                <div className="flex row left">
                                                    <h3><span className="subscript">({boardIndex + 1})</span></h3>
                                                    <h2>{board.name}</h2>
                                                    <h3 className="boardDate">
                                                        <span className="subscript rowDate itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                                                            <i> - </i>
                                                            <i className={`status`}>{board.created && !board.updated ? `Cre.` : `Upd.` }</i> 
                                                            <i><span className={`itemDateTime`}>{board?.updated ?? board?.created}</span></i>
                                                        </span>
                                                    </h3>
                                                </div>
                                                <div className="flex row middle" style={{textAlign: `center`}}>
                                                    <h4><i>{board.type}</i></h4>
                                                </div>
                                                <div className="flex row right">
                                                    <h3>{board.columns.length} <span className={`subscript`}>Column(s)</span></h3>
                                                    <h3>{board.rows.length} <span className={`subscript`}>Row(s)</span></h3>
                                                    <div className="itemButtons customButtons">
                                                        <button id={`delete_${board.id}`} onClick={(e) => deleteBoard(e, board)} title={`Delete Board`} className={`iconButton deleteButton`}>
                                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                                                            <span className={`iconButtonText textOverflow extended`}>Delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div id={`${board.id}_createColumn`} className="createColumn createList lists extended">
                                            <div id={`addColumnFor${board.id}`} className={`list items addListDiv`}>
                                                <div className="formItems items">
                                                    <div className="addColumnFormItem addListFormItem">
                                                        <h3 style={{ fontWeight: 600, fontSize: 20, minWidth: `fit-content` }}>{board.type} Column {board.columns.length + 1}</h3>
                                                        <form onSubmit={(e) => addNewColumn(e, board)} title={`Add Column`} id={`addColumnForm`} className={`flex addListForm itemButtons addForm addColumnForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                                            <div className={`inputGroup flex row`}>
                                                                <input maxLength={35} placeholder={`Name of Column`} type="text" name="createColumn" required />
                                                                <select id={`select_column_type`} name={`selectColumnType`}>
                                                                    <option id={`column_option_item`} value={`Select Column Type`}>Select Column Type</option>
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
                                                {/* <div className="filterButtons itemButtons">
                                                    <button id={`filter_completed`} style={{ pointerEvents: `all` }} title={`Filter Completed`} className={`iconButton deleteButton filterButton`}>
                                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-filter`}></i>
                                                        <span className={`iconButtonText textOverflow extended`}>Filter Completed</span>
                                                    </button>
                                                </div> */}
                                            </div>
                                        </div>
                                        <Droppable droppableId={`${board.id}_droppable_columns`} direction="horizontal" type="column">
                                            {(provided, snapshot) => {
                                                return <div className={`board innerBoardColumns innerBoard boardColumns flex row ${snapshot.isDraggingOver ? `isDraggingOver` : ``} ${board.columns.length == 2 ? `clipColumns` : board.columns.length == 3 ? `threeBoard overflowingBoard` : board.columns.length > 3 ? `moreBoard overflowingBoard` : ``}`} ref={provided.innerRef} {...provided.droppableProps}>
                                                {board.columns.map((column, columnIndex) => {
                                                    return (
                                                        <Draggable draggableId={`draggable_column_figure_${column.id}`} key={`key_of_${columnIndex}`} index={columnIndex}>
                                                            {(provided, snapshot) => (
                                                                <figure className={`column  list ${snapshot.isDragging ? `dragging` : ``}`} id={`column_figure_${column.id}`} {...provided.draggableProps} ref={provided.innerRef}>
                                                                    <div id={`title_of_${column.id}`} className={`titleRow flex row`} {...provided.dragHandleProps}>
                                                                        <div className="flex row innerRow">
                                                                            <div className="itemOrder listOrder" style={{ maxWidth: `fit-content` }}>
                                                                                <i style={{ color: `var(--gameBlue)`, fontSize: 15, padding: `0 9px`, maxWidth: `fit-content` }} className="fas fa-list"></i>
                                                                            </div>
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
                                                                        return <div className={`rows list items ${snapshot.isDraggingOver ? `isDraggingOver` : ``}`} ref={provided.innerRef} {...provided.droppableProps}>
                                                                            {column.rows.map((row, rowIndex) => {
                                                                                return (
                                                                                <Draggable draggableId={`draggable_row_item_${row.id}`} key={`key_of_${rowIndex}`} index={rowIndex}>
                                                                                    {(provided, snapshot) => (
                                                                                        <div id={row.id} className={`boardRow item flex row ${row.complete ? `complete` : ``} ${snapshot.isDragging ? `dragging` : ``}`} {...provided.draggableProps} ref={provided.innerRef} {...provided.dragHandleProps}>
                                                                                            <div className="inner">
                                                                                                <div className="rowOrder itemOrder">
                                                                                                    <div className="rowIndex itemIndex">{rowIndex + 1}</div>
                                                                                                </div>
                                                                                                <div className="rowContent itemContent">
                                                                                                    <span className="colRowContent itemName textOverflow extended">{row.content}</span>
                                                                                                    {/* {devEnv && wordInCategories(item) && <span className="itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                                                                                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-hashtag"></i> 
                                                                                                        <span className={`itemDateTime`}>{wordOfCategory(item)}</span>
                                                                                                    </span>} */}
                                                                                                    {devEnv && row.created && !row.updated ? (
                                                                                                    <span className="rowDate itemDate itemName itemCreated textOverflow extended flex row">
                                                                                                        <i className={`status`}>Cre.</i> 
                                                                                                        <span className={`itemDateTime`}>{formatDate(new Date(row.created))}</span>
                                                                                                    </span>
                                                                                                    ) : devEnv && row.updated ? (
                                                                                                    <span className="rowDate itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                                                                                                        <i className={`status`}>Upd.</i> 
                                                                                                        <span className={`itemDateTime`}>{formatDate(new Date(row.updated))}</span>
                                                                                                    </span>
                                                                                                    ) : null}
                                                                                                </div>
                                                                                                <div className="itemButtons customButtons">
                                                                                                    {/* <button title={`Edit Item`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                                                                                                    <button id={`complete_${row.id}`} onClick={(e) => completeRow(e, row,  rowIndex)} title={`Complete Item`} className={`iconButton deleteButton wordIconButton completeButton`}>
                                                                                                        <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas ${row.complete ? `fa-history` : `fa-check-circle`}`}></i>
                                                                                                    </button>
                                                                                                    <button id={`delete_${row.id}`} onClick={(e) => deleteRow(e, row)} title={`Delete Row`} className={`iconButton deleteButton wordIconButton`}>
                                                                                                        <i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i>
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </Draggable>
                                                                                )
                                                                            })}
                                                                            {provided.placeholder}
                                                                        </div>
                                                                    }}
                                                                    </Droppable>
                                                                    <form title={`Add Item`} id={`add_item_form_${column.id}`} className={`flex addItemForm itemButtons unset addForm`} style={{ width: `100%`, flexDirection: `row` }} onSubmit={(e) => addNewRow(e, column, column.rows.length + 1, board)}>
                                                                        <input placeholder={`Item`} type="text" name="createRow" required />
                                                                        <input name={`rowInsertIndex`} placeholder={column.rows.length + 1} type={`number`} min={1} />
                                                                        <button type={`submit`} title={`Add Item`} className={`iconButton createList wordIconButton`}>
                                                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-plus"></i>
                                                                            <span className={`iconButtonText textOverflow extended`}>
                                                                                <span style={{ fontSize: 12 }}>Add</span>
                                                                                <span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                                                                    {/* {list.items.length + 1} */}
                                                                                </span>
                                                                            </span>
                                                                        </button>
                                                                    </form>
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
    </>
}