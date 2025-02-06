import Board from './board';
import { toast } from 'react-toastify';
import { useState, useEffect, useContext } from 'react';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import { capWords, dev, formatDate, generateUniqueID, replaceAll, StateContext } from '../../pages/_app';

export enum ItemTypes {
    Task = `Task`,
    Item = `Item`,
    Image = `Image`,
    // Video = `Video`,
}

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
    const { rte, boards, setBoards, router, setLoading, setSystemStatus, IDs, setIDs, setRte } = useContext<any>(StateContext);

    const addNewBoard = (e) => {
        e.preventDefault();
        setLoading(true);
        let formFields = e.target.children[0].children;
        // let boardType = formFields.selectBoardType.value;
        let boardName = capWords(formFields.createBoard.value);
        let titleWidth = `${(boardName.length * 8.5) + 80}px`;

        let boardIDX = boards?.length + 1 ? boards?.length + 1 : 1;
        let newBoardID = `board_${boardIDX}_${generateUniqueID(IDs)}`;
        setSystemStatus(`Creating Board ${boardName}.`);
        let newColumn1ID = `column_1_${generateUniqueID(IDs)}`;
        let newColumn2ID = `column_2_${generateUniqueID(IDs)}`;

        let newBoard = {
            // rows: [].concat(...getBoardColumnsFromType(boardType).map(col => col.rows)),
            // type: (boardType == BoardTypes.SelectBoardType ? BoardTypes.KanbanBoard : boardType) ?? BoardTypes.KanbanBoard,
            created: formatDate(new Date()),
            expanded: true,
            name: boardName,
            columnOrder: [
                newColumn1ID,
                newColumn2ID,
            ],
            columns: {
                [newColumn1ID]: {
                    id: newColumn1ID,
                    title: `active`,
                    itemIds: []
                },
                [newColumn2ID]: {
                    id: newColumn2ID,
                    title: `complete`,
                    itemIds: []
                }
            },
            id: newBoardID,
            titleWidth,
            items: [],
        }

        // if (dev()) {
            // console.log(`addNewBoard`, newBoard);
            // console.log(`boards`, boards);
        // }

        setBoards([newBoard, ...boards]);
        setIDs([...IDs, newBoard.id, newColumn1ID, newColumn2ID]);

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
        dev() && console.log(`Boards Drag`, dragEndEvent);
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
    }, [boards, rte]);

    return <>
        {/* {devEnv && <button onClick={(e) => showAlert(`All Boards`, <div>All Boards</div>, `69%`, `69%`)} className="iconButton alertTest" style={{justifyContent: `center`}}>Alert</button>} */}
        <div className={`createBoard lists extended`}>
            <div className={`list items addListDiv`}>
                <div className={`formItems items`}>
                    <div className={`addListFormItem`}>
                        <h2 style={{ fontWeight: 600, fontSize: 22, minWidth: `fit-content` }}>
                            Create Board {boards?.boards && boards?.boards?.length + 1}
                        </h2>
                        <section className={`addBoardFormSection addListFormItemSection`} style={{ margin: 0, position: `relative`, overflowY: `hidden` }}>
                            <div title={`Change Board Type`} onClick={(e) => toast.info(`Board Types are In Development`)} className={`typeIcon changeBoardTypeIcon hoverGlowButton`}>
                                +
                            </div>
                            <form onSubmit={(e) => addNewBoard(e)} title={`Add Board`} id={`addBoardForm`} className={`addBoardForm flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                <div className={`inputGroup flex row`}>
                                    <input autoComplete={`off`} maxLength={35} placeholder={`Create Board +`} type="text" name="createBoard" required />
                                    {/* {devEnv && <div className={`selectBoardTypeWrapper`}>
                                        <select title={`Select Board Type`} name={`selectBoardType`} id={`select_board_type`}>
                                            <option id={`board_option_default`} value={`Select Board Type`}>Select Board Type</option>
                                            {Object.values(BoardTypes).map(type => {
                                                return <option key={type} id={`board_option_${type}`} value={type}>{type}</option>
                                            })}
                                        </select>    
                                    </div>} */}
                                </div>
                                <button type={`submit`} title={`Create Board`} className={`iconButton createList createBoardButton`}>
                                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-list"></i>
                                    <span className={`iconButtonText textOverflow extended`}>
                                        <span style={{ fontSize: 12 }}>
                                            Create Board
                                        </span>
                                        <span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
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
                <div className={`flex ${boards && boards?.length > 0 ? `hasBoards` : `noBoards`} ${boards && boards?.length == 1 ? `oneBoard` : ``}`}>
                    {boards && boards?.length > 0 && <Droppable droppableId={`all_boards`}>
                        {(provided, snapshot) => (
                            <div className={`all_boards_div ${snapshot.isDraggingOver ? `isDraggingOver` : ``}`} ref={provided.innerRef} {...provided.droppableProps}>
                                {boards && boards?.length > 0 && boards?.map((bord, bordIndex) => {
                                    if (bord.expanded == null || bord.expanded == undefined) bord.expanded = true;
                                    return (
                                        <Draggable key={`${bordIndex + 1}_${bord.id}_bord_key`} draggableId={`${bordIndex + 1}_${bord.id}_draggable_bord`} index={bordIndex}>
                                            {(provided, snapshot) => (
                                                <div id={`bord_${bord?.id}`} key={bordIndex} className={`draggableDroppableBoard bord ${bord?.focused ? `focusBoard` : `unfocusedBoard`} ${bordIndex == 0 ? `firstBoard` : ``}`} {...provided.draggableProps} ref={provided.innerRef}>
                                                    <Board board={bord} provided={provided} index={bordIndex} drag={onDragEnd} />
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