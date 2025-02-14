import Board from './board';
import { toast } from 'react-toastify';
import { Skeleton } from '@mui/material';
import { createBoard } from '../../shared/database';
import MultiSelector from '../selector/multi-selector';
import { useState, useEffect, useContext } from 'react';
import { findHighestNumberInArrayByKey, generateArray } from '../../shared/constants';
import { capWords, dev, replaceAll, StateContext } from '../../pages/_app';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import IVFSkeleton from '../loaders/skeleton/ivf_skeleton';

export enum ItemTypes {
    Item = `Item`,
    Image = `Image`,
}

export enum BoardTypes {
    Table = `Table`,
    Kanban = `Kanban`,
    TierList = `Tier List`,
    ToDoList = `To Do List`,
    Spreadsheet = `Spreadsheet`,
}

export default function Boards({  }) {
    let [updates, setUpdates] = useState(0);
    let [searchingGrid, setSearchingGrid] = useState(false);
    let [useSingleSelect, setUseSingleSelect] = useState(true);

    let { 
        user, 
        authState,
        setLoading, 
        IDs, setIDs, 
        getGridsBoards,
        setSystemStatus, 
        rte, router, setRte, 
        boards, userBoards, setBoards, boardsLoading,
        grids, gridsLoading, selectedGrids, setSelectedGrids, 
    } = useContext<any>(StateContext);

    const createBoardComponent = () => (
        <div className={`createBoard lists extended`}>
            <div className={`list items addListDiv`}>
                <div className={`formItems items`}>
                    <div className={`addListFormItem`}>
                        <h2 style={{ fontWeight: 600, fontSize: 22, minWidth: `fit-content` }}>
                            Create Board {boards && boards?.length + 1}
                        </h2>
                        <section className={`addBoardFormSection addListFormItemSection`} style={{ margin: 0, position: `relative`, overflowY: `hidden` }}>
                            <div title={`Change Board Type`} onClick={(e) => toast.info(`Board Types are In Development`)} className={`typeIcon changeBoardTypeIcon`}>
                                +
                            </div>
                            <form onSubmit={(e) => addNewBoard(e)} title={`Add Board`} id={`addBoardForm`} className={`addBoardForm flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                <div className={`inputGroup flex row`}>
                                    <input autoComplete={`off`} maxLength={35} placeholder={`Create Board +`} type="text" name="createBoard" required />
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
    )

    const updateSelectedGrids = (updatedSelectedGrids) => {
        setSelectedGrids(updatedSelectedGrids);
        let gridBoards = getGridsBoards(updatedSelectedGrids, userBoards);
        setBoards(gridBoards);
    }

    const addNewBoard = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        let formFields = e.target.children[0].children;
        let boardName = capWords(formFields.createBoard.value);
        let titleWidth = `${(boardName.length * 8.5) + 80}px`;

        let boardLn = boards?.length;
        let boardRank = await findHighestNumberInArrayByKey(boards, `rank`);
        let boardIDX = boardRank > boardLn ? boardRank : boardLn;
        let rank = boardIDX + 1;
        
        setSystemStatus(`Creating Board ${boardName}.`);

        let newBoard = createBoard(rank, boardName, user, titleWidth);

        dev() && console.log(`New Board`, newBoard);

        // Add to Firestore Boards Here Later

        setBoards([newBoard, ...boards]);
        setIDs([...IDs, newBoard.id]);

        e.target.reset();
        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Created Board ${newBoard.name}.`);
        }, 1000);
    }

    const onDragEnd = (dragEndEvent) => {
        const { destination, source } = dragEndEvent;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const updatedBoards = [...boards];
        const [reorderedBoard] = updatedBoards.splice(source.index, 1);
        updatedBoards.splice(destination.index, 0, reorderedBoard);

        let updatedBoardsPositions = updatedBoards.map((brd, brdIndex) => ({ ...brd, position: brdIndex + 1 }));
        setBoards(updatedBoardsPositions);

        // dev() && console.log(`Boards Drag`, updatedBoardsPositions);
    };

    useEffect(() => {
        setRte(replaceAll(router.route, `/`, `_`));
        
        setUpdates(updates + 1);
        return () => {
            setRte(replaceAll(router.route, `/`, `_`));
        }
    }, [rte]);

    const getLoadingLabel = (lbl: string) => {
        let nonFormAuthStates = [`Next`, `Back`, `Save`];
        return user != null ? `${lbl} Loading` : `${!nonFormAuthStates.includes(authState) ? authState : `Register`} to View ${lbl}`;
    }

    return <>
        <div className={`boardsTitleRow flex row _projects_boards`}>
            <div className={`row gridRow ${gridsLoading ? `gridsAreLoading` : ``} ${(gridsLoading || grids?.length > 1) ? `hasGridSelector ${useSingleSelect ? `withSingleSelect` : ``}` : ``}`} style={{ padding: 0, paddingBottom: 7 }}>
                <div className={`flex row left`} style={{ height: `var(--buttonSize)` }}>
                    <h1 className={`nx-mt-2 nx-text-4xl nx-font-bold nx-tracking-tight nx-text-slate-900 dark:nx-text-slate-100`} style={{ maxWidth: `unset` }}>
                        {user != null ? user?.name + `s ` : ``}{selectedGrids.length == 1 ? selectedGrids[0]?.name : `Grids`}
                    </h1>
                </div>
                <div className={`flex row middle`} style={{ textAlign: `center`, height: `var(--buttonSize)` }}>
                    {gridsLoading ? <></> : <>
                        <button style={{ background: `white`, pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33, justifyContent: `center`, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} title={`${searchingGrid ? `Search` : `Create`} Grid`} className={`gridTypeIconButton iconButton filterButton hoverGlow ${searchingGrid ? `filerActive searchButton` : `filterInactive createGridButton`}`} onClick={() => setSearchingGrid(!searchingGrid)}>
                            {searchingGrid ? <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-search`} /> : `+`}
                        </button>
                        {searchingGrid ? (
                            <input autoComplete={`off`} placeholder={`Search Grid...`} type={`search`} name={`searchGrid`} className={`gridInputField searchGrid`} />
                        ) : (
                            <input autoComplete={`off`} placeholder={`Create Grid +`} type={`text`} name={`createGrid`} className={`gridInputField createGridField`} />
                        )}
                    </>}
                </div>
                <div className={`flex row right`} style={{ height: `var(--buttonSize)` }}>
                    {gridsLoading ? (
                        <IVFSkeleton 
                            labelSize={14}
                            showLoading={true}
                            style={{ minWidth: 300 }} 
                            label={getLoadingLabel(`Grids`)} 
                            className={`gridsItemsSkeleton`} 
                        />
                    ) : grids?.length > 1 && (
                        <MultiSelector 
                            id={`select_grid_type`}
                            single={useSingleSelect}
                            defaultValue={selectedGrids} 
                            showClearAll={!useSingleSelect}
                            inputDisabled={useSingleSelect}
                            placeholder={`Search Grids to View`}
                            hostClass={`gridsMultiSelectorContainer`}
                            onChange={(val) => updateSelectedGrids(val)} 
                            options={grids.map(gr => ({ ...gr, id: gr?.ID, value: gr?.ID, label: gr?.name }))} 
                        />
                    )}
                </div>
            </div>
        </div>

        <hr className={`lineSep`} style={{ marginBottom: 10 }} />

        {boardsLoading ? <></> : createBoardComponent()}

        <DragDropContext onDragEnd={onDragEnd}>
            <div id={`allBoards`} className={`boards`}>
                <div className={`flex ${boards && boards?.length > 0 ? `hasBoards` : `noBoards`} ${boards && boards?.length == 1 ? `oneBoard` : ``}`}>
                    {boardsLoading ? <>
                        <div className={`flex isColumn`} style={{ paddingTop: 5 }}>
                            {generateArray(10, getLoadingLabel(`Boards`)).map((lbl, lblIndex) => (
                                <IVFSkeleton 
                                    height={65} 
                                    label={lbl} 
                                    key={lblIndex}
                                    showLoading={true}
                                    className={`boardsSkeleton`} 
                                    style={{ margin: `5px 0`, }}
                                />
                            ))}
                        </div>
                    </> : (
                        boards && boards?.length > 0 ? (
                            <Droppable droppableId={`all_boards`}>
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
                            </Droppable>
                        ) : <>
                            <div className={`boardsZeroState`}>
                                0 Boards
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DragDropContext>

        {/* {boardsLoading ? <></> : createBoardComponent()} */}
    </>
}