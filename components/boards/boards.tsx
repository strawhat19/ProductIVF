import Board from './board';
import { useState, useEffect, useContext } from 'react';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import { capWords, dev, formatDate, generateUniqueID, replaceAll, showAlert, StateContext } from '../../pages/_app';

export enum BoardTypes {
    Table = `Table`,
    TierList = `Tier List`,
    ToDoList = `To Do List`,
    Spreadsheet = `Spreadsheet`,
    KanbanBoard = `Kanban Board`,
    SelectBoardType = `Select Board Type`,
}

export default function Boards(props) {
    let [updates, setUpdates] = useState(0);
    const { board, boards, setBoards, router, setLoading, setSystemStatus, IDs, setIDs, devEnv, setRte } = useContext<any>(StateContext);

    const addNewBoard = (e) => {
        e.preventDefault();
        setLoading(true);
        let formFields = e.target.children[0].children;
        // let boardType = formFields.selectBoardType.value;
        let boardName = capWords(formFields.createBoard.value);
        let titleWidth = `${(boardName.length * 8.5) + 80}px`;

        let newBoardID = `board_${boards?.length + 1 ?? 1}_${generateUniqueID(IDs)}`;
        setSystemStatus(`Creating Board ${boardName}.`);

        let newBoard = {
            // rows: [].concat(...getBoardColumnsFromType(boardType).map(col => col.rows)),
            // type: (boardType == BoardTypes.SelectBoardType ? BoardTypes.KanbanBoard : boardType) ?? BoardTypes.KanbanBoard,
            created: formatDate(new Date()),
            name: boardName,
            columnOrder: [],
            id: newBoardID,
            columns: [],
            titleWidth,
            items: [],
        }

        // if (dev()) {
            // console.log(`addNewBoard`, newBoard);
            // console.log(`boards`, boards);
        // }

        setBoards([newBoard, ...boards]);
        // setIDs([...IDs, newBoard.id]);

        e.target.reset();
        // window.requestAnimationFrame(() => {
        //     return boardsSection.scrollTop = boardsSection.scrollHeight;
        // });
        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Created Board ${newBoard.name}.`);
        }, 1000);
    }

    const onDragEnd = (dragEndEvent) => {
        const { destination, source, draggableId, type } = dragEndEvent;

        // if (dev()) {
        //     console.log(`dragEndEvent`, dragEndEvent);
        //     console.log(`dragEndEvent Inner`, {source, destination, draggableId, type});
        // }

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const newBoards = [...boards];
        const [reorderedBoard] = newBoards.splice(source.index, 1);
        newBoards.splice(destination.index, 0, reorderedBoard);
        setBoards(newBoards);

        // setSubtasks(newSubtasks);
        // item.subtasks = newSubtasks;
        // localStorage.setItem(`board`, JSON.stringify(board));

    };

    useEffect(() => {
        setRte(replaceAll(router.route, `/`, `_`));

        if (updates > 0) {
            localStorage.setItem(`boards`, JSON.stringify(boards));
            dev() && console.log(`Updated Boards`, boards);
        }

        // if (dev()) {
        //     console.log(`Updates`, updates);
        //     console.log(`Boards`, boards);
        // }
        
        setUpdates(updates + 1);
        return () => {
            setRte(replaceAll(router.route, `/`, `_`));
        };
    }, [boards]);

    return <>
        {/* {devEnv && <button onClick={(e) => showAlert(`All Boards`, <div>All Boards</div>, `69%`, `69%`)} className="iconButton alertTest" style={{justifyContent: `center`}}>Alert</button>} */}
        <div className="createBoard lists extended">
            <div className={`list items addListDiv`}>
                <div className="formItems items">
                    <div className="addListFormItem">
                        <h2 style={{ fontWeight: 600, fontSize: 22, minWidth: `fit-content` }}>Create Board {boards?.boards && boards?.boards?.length + 1}</h2>
                        <section className={`addBoardFormSection addListFormItemSection`} style={{ margin: 0 }}>
                            <form onSubmit={(e) => addNewBoard(e)} title={`Add Board`} id={`addBoardForm`} className={`addBoardForm flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                <div className={`inputGroup flex row`}>
                                    <input maxLength={35} placeholder={`Name of Board`} type="text" name="createBoard" required />
                                    {devEnv && <select id={`select_board_type`} name={`selectBoardType`}>
                                        <option id={`board_option_default`} value={`Select Board Type`}>Select Board Type</option>
                                        {Object.values(BoardTypes).map(type => {
                                            return <option key={type} id={`board_option_${type}`} value={type}>{type}</option>
                                        })}
                                    </select>}
                                </div>
                                <button type={`submit`} title={`Create Board`} className={`iconButton createList`}>
                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-list"></i>
                                    <span className={`iconButtonText textOverflow extended`}>
                                        <span style={{ fontSize: 12 }}>Create Board</span><span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                            {boards?.boards && boards?.boards?.length + 1}
                                        </span>
                                    </span>
                                </button>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
            <div id={`allBoards`} className={`boards`}>
                <div className={`flex ${boards && boards?.length > 0 ? `hasBoards` : `noBoards`}`}>
                    {boards && boards?.length > 0 && <Droppable droppableId={`all_boards`}>
                        {(provided, snapshot) => (
                            <div className={`all_boards_div ${snapshot.isDraggingOver ? `isDraggingOver` : ``}`} ref={provided.innerRef} {...provided.droppableProps}>
                                {boards && boards?.length > 0 && boards?.map((bord, bordIndex) => {
                                    return (
                                        <Draggable key={`${bordIndex + 1}_${bord.id}_bord_key`} draggableId={`${bordIndex + 1}_${bord.id}_draggable_bord`} index={bordIndex}>
                                            {(provided, snapshot) => (
                                                <div key={bordIndex} className="bord" {...provided.draggableProps} ref={provided.innerRef}>
                                                    <Board board={bord} provided={provided} index={bordIndex} />
                                                </div>
                                            )}
                                        </Draggable>
                                    )
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>}
                </div>
            </div>
        </DragDropContext>
    </>
}