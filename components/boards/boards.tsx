import { NextSeo } from 'next-seo';
import { toast } from 'react-toastify';
import { User } from '../../shared/models/User';
import Board, { addBoardScrollBars } from './board';
import MultiSelector from '../selector/multi-selector';
import { FeatureIDs } from '../../shared/admin/features';
import IVFSkeleton from '../loaders/skeleton/ivf_skeleton';
import { updateDocFieldsWTimeStamp } from '../../firebase';
import { replaceAll, StateContext } from '../../pages/_app';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthGrids, GridTypes } from '../../shared/types/types';
import { Board as BoardModel } from '../../shared/models/Board';
import { generateArray, withinXTime } from '../../shared/constants';
// import FeatureFlagBadge from '../../shared/admin/feature-flag-badge';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';

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

export const getBoardTitleWidth = (wordOrArrayOfLetters: string | string[]) => {
    let titleWidth = `${(wordOrArrayOfLetters.length * 6.5) + (69 + wordOrArrayOfLetters?.length)}px`;
    return titleWidth;
}

export const getLoadingLabel = (lbl: string, authState, user) => {
    let nonFormAuthStates = [`Next`, `Back`, `Save`];
    return user != null ? `${lbl} Loading` : `${!nonFormAuthStates.includes(authState) ? authState : `Register`} to View ${lbl}`;
}

export const recentlyAuthenticated = (usr: User, interval = 5, timePass = `minutes`) => {
    let isRecentlyAuthenticated = false;
    let userRecentAuth = usr?.auth?.lastAuthenticated;
    let userRecentlyAuthenticated = withinXTime(userRecentAuth, interval, timePass);
    isRecentlyAuthenticated = userRecentlyAuthenticated;
    return isRecentlyAuthenticated;
}

export default function Boards(props: any) {
    let { 
        user, 
        authState,
        addNewBoard,
        globalUserData,
        setActiveOptions,
        isFeatureEnabled,
        switchSelectedGrid,
        rte, router, setRte,
        openAuthenticationForm,
        userRecentlyAuthenticated,
        boards, setBoards, boardsLoading,
        gridSearchTerm, setGridSearchTerm,
        grids, gridsLoading, selectedGrids, selectedGrid, 
    } = useContext<any>(StateContext);

    const gridFormRef = useRef(null);
    const multiSelectorRef = useRef(null);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    let [updates, setUpdates] = useState(0);
    let [useSingleSelect, ] = useState(true);
    let [useGridSearchCreate, ] = useState(true);
    let [useSearchInputGridCreate, ] = useState(false);
    let [searchingGrid, setSearchingGrid] = useState(true);

    useEffect(() => {
        setRte(replaceAll(router.route, `/`, `_`));
        setUpdates(updates + 1);
        return () => {
            setRte(replaceAll(router.route, `/`, `_`));
        }
    }, [rte]);

    const onGridFormSubmit = (gridFromSubmitEvent) => {
        gridFromSubmitEvent?.preventDefault();
    }

    const onClearSearch = (e) => {
        e.preventDefault();
        setGridSearchTerm(``);
        const gridSearchField = gridFormRef.current?.querySelector(`.gridSearchField`);
        if (gridSearchField) gridSearchField.value = ``;
        addBoardScrollBars();
    }

    const onGridFormChange = (gridFromChangeEvent) => {
        gridFromChangeEvent?.preventDefault();
        const gridFormField = gridFromChangeEvent?.target;
        const gridFormFieldValue = gridFormField?.value; 
        setGridSearchTerm(gridFormFieldValue);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => addBoardScrollBars(), 300);
    }

    const updateSelectedGrids = async (updatedSelectedGrids) => {
        let thisGrid = updatedSelectedGrids[0];
        if (AuthGrids?.includes(thisGrid?.gridType)) {
            if (userRecentlyAuthenticated) {
                switchSelectedGrid(user, thisGrid);
            } else {
                setActiveOptions([selectedGrid]);
                openAuthenticationForm(thisGrid);
            }
        } else switchSelectedGrid(user, thisGrid);
    }

    const getBoardsInCurrentSearchFilters = (bords: BoardModel[]) => {
        let boardsInCurrentSearchFilters = bords;
        if (gridSearchTerm != ``) {
            let expandedBoards = bords?.filter(brd => brd?.options?.expanded);
            if (expandedBoards?.length == 0) {
                boardsInCurrentSearchFilters = bords?.filter(brd => brd?.name?.toLowerCase()?.includes(gridSearchTerm?.toLowerCase()?.trim()));
            }
        }
        return boardsInCurrentSearchFilters;
    }

    const onDragEnd = (dragEndEvent) => {
        const { destination, source } = dragEndEvent;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const updatedBoards = [...boards];
        const [reorderedBoard] = updatedBoards.splice(source.index, 1);
        updatedBoards.splice(destination.index, 0, reorderedBoard);

        let updatedBoardsPositions = updatedBoards.map((brd, brdIndex) => new BoardModel({ ...brd, position: brdIndex + 1 }));
        let updatedBoardIDs = updatedBoardsPositions?.map(brd => brd?.id);
        
        setBoards(updatedBoardsPositions);
        updateDocFieldsWTimeStamp(selectedGrid, { [`data.boardIDs`]: updatedBoardIDs });
    }

    const gridRowComponent = () => <>
        <div className={`boardsTitleRow flex row _projects_boards`}>
            <div className={`row gridRow ${gridsLoading ? `gridsAreLoading` : `gridsLoaded`} ${(gridsLoading || (selectedGrid == null || (grids?.length == 0 || globalUserData?.grids?.length == 0)) || (grids?.length > 1 || globalUserData?.grids?.length > 1)) ? `hasGridSelector ${useSingleSelect ? `withSingleSelect` : ``}` : ``}`} style={{ padding: 0, paddingBottom: 7 }}>
                <div className={`flex row left`} style={{ height: `var(--buttonSize)` }}>
                    <h1 className={`nx-mt-2 nx-text-4xl nx-font-bold nx-tracking-tight nx-text-slate-900 dark:nx-text-slate-100`} style={{ maxWidth: `unset` }}>
                        {selectedGrid?.options?.nameLabel == true ? selectedGrid?.name : <>
                            {user != null ? user?.name + `s ` : ``}{(!gridsLoading && selectedGrids.length == 1) ? selectedGrids[0]?.name + (!useGridSearchCreate ? ` Grid` : ``) : `Grids`}
                        </>}
                    </h1>
                </div>
                <div className={`flex row middle`} style={{ textAlign: `center`, height: `var(--buttonSize)` }}>
                    {(gridsLoading || (selectedGrid == null && (grids?.length == 0 || globalUserData?.grids?.length == 0)) || !useGridSearchCreate) ? <></> : <>
                        {globalUserData?.boards?.length > 0 && globalUserData?.lists?.length > 0 && globalUserData?.items?.length > 0 && <>
                            {isFeatureEnabled(FeatureIDs.Search_Grid) && <>
                                <form ref={gridFormRef} className={`gridForm w100 searchCreateGridForm`} onInput={(e) => onGridFormChange(e)} onSubmit={(e) => onGridFormSubmit(e)} style={{ position: `relative` }}>
                                    {/* <FeatureFlagBadge featureID={FeatureIDs.Search_Grid} /> */}
                                    <button style={{ background: `white`, pointerEvents: useSearchInputGridCreate ? `all` : `none`, width: `8%`, minWidth: 33, maxWidth: 33, justifyContent: `center`, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} title={`${searchingGrid ? `Search` : `Create`} Grid`} className={`gridTypeIconButton iconButton filterButton hoverGlow ${searchingGrid ? `filerActive searchButton` : `filterInactive createGridButton`}`} onClick={() => setSearchingGrid(!searchingGrid)}>
                                        {searchingGrid ? <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-search`} /> : `+`}
                                    </button>
                                    {searchingGrid ? (
                                        <input autoComplete={`off`} placeholder={`Search Grid...`} type={`search`} name={`searchGrid`} className={`gridInputField gridSearchField searchGrid`} />
                                    ) : (
                                        <input autoComplete={`off`} placeholder={`Create Grid +`} type={`text`} name={`createGrid`} className={`gridInputField createGridField`} />
                                    )}
                                    {(searchingGrid && gridSearchTerm != ``) && (
                                        <button style={{ background: `white`, width: `8%`, minWidth: 33, maxWidth: 33, justifyContent: `center`, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} title={`Clear Search`} className={`clearSearchButton gridTypeIconButton iconButton filterButton hoverGlow`} onClick={(e) => onClearSearch(e)}>
                                            <i style={{ color: `var(--gameBlue)`, fontSize: 16 }} className={`fas fa-times`} />
                                        </button>
                                    )}
                                </form>
                            </>}
                        </>}
                    </>}
                </div>
                <div className={`flex row right`} style={{ height: `var(--buttonSize)` }}>
                    {(!user || (gridsLoading || (selectedGrid == null && (grids?.length == 0 || globalUserData?.grids?.length == 0)))) ? (
                        <IVFSkeleton 
                            labelSize={14}
                            showLoading={true}
                            label={getLoadingLabel(`Grids`, authState, user)} 
                            className={`gridsItemsSkeleton gridSelectorSkeleton`} 
                            style={{ minWidth: 300, [`--animation-delay`]: `${0.15}s` }} 
                        />
                    ) : (
                        <MultiSelector 
                            ref={multiSelectorRef}
                            id={`select_grid_type`}
                            single={useSingleSelect}
                            showClearAll={!useSingleSelect}
                            inputDisabled={useSingleSelect}
                            placeholder={`Search Grids to View`}
                            hostClass={`gridsMultiSelectorContainer`}
                            onChange={(val) => updateSelectedGrids(val)} 
                            options={grids?.length > 1 ? grids : globalUserData?.grids} 
                        />
                    )}
                </div>
            </div>
        </div>

        <hr className={`lineSep`} style={{ marginBottom: 10 }} />
    </>
    
    const createBoardComponent = () => (
        (boardsLoading || selectedGrid?.gridType == GridTypes.Archived) ? <></> : (
            <div className={`createBoard lists extended transition ${AuthGrids?.includes(selectedGrid?.gridType) && !userRecentlyAuthenticated ? `blurred pointerEventsNone` : ``}`}>
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
                                        <input autoComplete={`off`} maxLength={35} placeholder={`Create Board +`} type={`text`} name={`createBoard`} required />
                                    </div>
                                    <button type={`submit`} title={`Create Board`} className={`iconButton createList createBoardButton`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas fa-list`}></i>
                                        <span className={`iconButtonText textOverflow extended`}>
                                            <span style={{ fontSize: 12 }}>
                                                Create Board
                                            </span>
                                            <span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                                {boards && boards?.length + 1}
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
    )

    return <>
        <NextSeo title={(selectedGrid?.name ?? ``) + ` Grid`} />

        {gridRowComponent()}

        {selectedGrid?.options?.newestBoardsOnTop ? ((boardsLoading || user?.uid != selectedGrid?.ownerUID) ? <></> : createBoardComponent()) : <></>}

        <DragDropContext onDragEnd={onDragEnd}>
            <div id={`allBoards`} className={`boards transition ${AuthGrids?.includes(selectedGrid?.gridType) && !userRecentlyAuthenticated ? `blurred pointerEventsNone` : ``}`}>
                <div className={`flex ${boards && boards?.length > 0 ? `hasBoards` : `noBoards`} ${boards && boards?.length == 1 ? `oneBoard` : ``}`}>
                    {(boardsLoading || selectedGrid == null) ? <>
                        <div className={`flex isColumn`} style={{ paddingTop: 5 }}>
                            {generateArray(9, getLoadingLabel(`Boards`, authState, user)).map((lbl, lblIndex) => (
                                <IVFSkeleton 
                                    height={65} 
                                    label={lbl} 
                                    key={lblIndex}
                                    showLoading={true}
                                    className={`boardsSkeleton`} 
                                    style={{ margin: `5px 0`, [`--animation-delay`]: `${(lblIndex + 1) * 0.15}s` }}
                                />
                            ))}
                        </div>
                    </> : (
                        boards && boards?.length > 0 && getBoardsInCurrentSearchFilters(boards)?.length > 0 ? (
                            <Droppable droppableId={`all_boards`}>
                                {(provided, snapshot) => (
                                    <div className={`all_boards_div ${snapshot.isDraggingOver ? `isDraggingOver` : ``}`} ref={provided.innerRef} {...provided.droppableProps}>
                                        {boards && boards?.length > 0 && getBoardsInCurrentSearchFilters(boards)?.map((bord, bordIndex) => {
                                            if (bord?.id) {
                                                return (
                                                    <Draggable key={`${bordIndex + 1}_${bord?.id}_bord_key`} draggableId={`${bordIndex + 1}_${bord?.id}_draggable_bord`} index={bordIndex} isDragDisabled={gridSearchTerm != ``}>
                                                        {(provided, snapshot) => (
                                                            <div id={`bord_${bord?.id}`} key={bordIndex} className={`draggableDroppableBoard bord ${bord?.options?.focused == true ? `focusBoard` : `unfocusedBoard`} ${bordIndex == 0 ? `firstBoard` : ``}`} {...provided.draggableProps} ref={provided.innerRef}>
                                                                <Board board={bord} provided={provided} index={bordIndex} drag={onDragEnd} />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                )
                                            }
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ) : <>
                            <div className={`zeroState boardsZeroState skeletonZeroState`}>
                                <IVFSkeleton 
                                    height={45} 
                                    showLoading={true}
                                    style={{ margin: `5px 0` }}
                                    className={`boardsSkeleton`} 
                                    label={gridSearchTerm != `` ? `0 Boards for "${gridSearchTerm}"` : `No Boards Yet`} 
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DragDropContext>

        {selectedGrid?.options?.newestBoardsOnTop ? <></> : ((boardsLoading || user?.uid != selectedGrid?.ownerUID) ? <></> : createBoardComponent())}
    </>
}