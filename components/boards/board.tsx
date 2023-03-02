
import Column from './column';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, onDragStart } from 'react-beautiful-dnd';
import { capitalizeAllWords, dev, formatDate, generateUniqueID, StateContext } from '../../pages/_app';

function Board(props) {
    const boardNameRef = useRef();
    const [updates, setUpdates] = useState(0);
    const { board, setBoard, setLoading, setSystemStatus, devEnv, completeFiltered, setCompleteFiltered, boardCategories, setBoardCategories, setCategories, setRearranging, setPage, tasksFiltered, setTasksFiltered } = useContext<any>(StateContext);

    const addNewColumn = (e) => {
        e.preventDefault();
        setLoading(true);
        setSystemStatus(`Creating Column.`);
        let newListID = `list_${board?.columnOrder.length + 1}`;
        let columnID = `${newListID}_${generateUniqueID()}`;
        let formFields = e.target.children;

        const newColumnOrder = Array.from(board?.columnOrder);
        newColumnOrder.push(columnID);

        const newColumn = {
            id: columnID,
            title: formFields[0].value,
            itemIds: [],
        };

        setBoard({
            ...board,
            columnOrder: newColumnOrder,
            updated: formatDate(new Date()),
            columns: {
                ...board?.columns,
                [columnID]: newColumn
            }
        });

        e.target.reset();
        setTimeout(() => {
            let newListFormInput: any = document.querySelector(`#add_item_form_${newColumn.id} input`);
            if (newListFormInput) newListFormInput.focus();
        }, 500);
        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Created Column.`);
        }, 1000);
    }

    const getCommonWords = (arrayOfSentences) => {
        // Join all sentences into a single string
        const text = arrayOfSentences.join(' ');
        
        // Split the text into an array of words
        const words = text.split(/\W+/);
        
        // Count the frequency of each word
        const wordCounts = {};

        for (const word of words) {
            if (word.slice(0,word.length) in wordCounts) {
              wordCounts[word.slice(0,word.length)] += 1;
            } else {
              wordCounts[word.slice(0,word.length)] = 1;
            }
        }

        for (const word of words) {
            if (word.slice(0,word.length - 1) in wordCounts) {
              wordCounts[word.slice(0,word.length - 1)] += 1;
            } else {
              wordCounts[word.slice(0,word.length - 1)] = 1;
            }
        }

        for (const word of words) {
          if (word.slice(0,word.length - 2) in wordCounts) {
            wordCounts[word.slice(0,word.length - 2)] += 1;
          } else {
            wordCounts[word.slice(0,word.length - 2)] = 1;
          }
        }
        
        // Convert the word counts to an array of {value, occurrences} objects
        const commonWords = [];
        for (const [word, count] of Object.entries(wordCounts)) {
          commonWords.push({ word: word, occurences: count });
        }
        
        // Sort the common words array in descending order by occurrences
        commonWords.sort((a, b) => b.occurrences - a.occurrences);
        
        return commonWords.filter(word => word.word != `` && word.word.length > 2 && word.occurences > 1);
    }

    // const filterCompleted = (e) => {

        // let completedItems = document.querySelectorAll(`.complete`);
        // let boardItems = document.querySelectorAll(`.boardColumnItems`);

        // if (!filtered) {
        //     completedItems.forEach((completedItem: any) => {
        //         completedItem.style.display = `none`;
        //     });
        //     boardItems.forEach(listOfItems => {
        //         listOfItems.querySelectorAll(`.activeIndex`).forEach((itemIndex: any, index) => {
        //             itemIndex.innerHTML = index + 1;
        //         })
        //     });
        // } else {
        //     completedItems.forEach((completedItem: any) => {
        //         completedItem.style.display = `flex`;
        //     });
        //     boardItems.forEach(listOfItems => {
        //         listOfItems.querySelectorAll(`.itemIndex`).forEach((itemIndex: any, index) => {
        //             itemIndex.innerHTML = index + 1;
        //         })
        //     });
        // }
    // }

    // let dragCount = 0;
    const onDragStart = (dragStartEvent) => {
        if (dev()) {
            setLoading(true);
            setSystemStatus(`Rearranging...`);
        }
    }

    const onDragEnd = (dragEndEvent) => {
        const { destination, source, draggableId, type } = dragEndEvent;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

       if (dev()) {
           setLoading(false);
           setSystemStatus(`Rearranged.`);
       }

        if (type === `column`) {
            const newColumnOrder = Array.from(board?.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);

            setBoard({
                ...board,
                columnOrder: newColumnOrder,
            });
            return;
        }

        const start = board?.columns[source.droppableId];
        const finish = board?.columns[destination.droppableId];

        if (start === finish) {
            const newItemIds = Array.from(start.itemIds);
            newItemIds.splice(source.index, 1);
            newItemIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...start,
                itemIds: newItemIds,
            }

            setBoard({
                ...board,
                columns: {
                    ...board?.columns,
                    [newColumn.id]: newColumn
                }
            });
            return;
        }

        const thisItem = board?.items[draggableId];
        thisItem.updated = formatDate(new Date());


        const startItemIds = Array.from(start.itemIds);
        startItemIds.splice(source.index, 1);
        const newStart = {
            ...start,
            itemIds: startItemIds,
        }

        const finishItemIds = Array.from(finish.itemIds);
        finishItemIds.splice(destination.index, 0, draggableId);
        const newFinish = {
            ...finish,
            itemIds: finishItemIds,
        }

        setBoard({
            ...board,
            updated: formatDate(new Date()),
            columns: {
                ...board?.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            }
        });
    }

    const changeLabel = (e, item, setItem) => {
        let value = e.target.value == `` ? capitalizeAllWords(item.name) : capitalizeAllWords(e.target.value);
        if (!e.target.value || e.target.value == ``) {
            e.target.value = capitalizeAllWords(item.name);
            return;
        };
        let titleWidth = `${(value.length * 8.5) + 65}px`;
        e.target.value = capitalizeAllWords(value);
        e.target.style.width = titleWidth;
        if (item.id.includes(`board`)) {
            setItem({ ...item, titleWidth, updated: formatDate(new Date()), name: capitalizeAllWords(value)});
        }
    }

    useEffect(() => {
        if (updates > 0) {
            dev() && board?.columnOrder &&  board?.columnOrder.length > 0 && console.log(`Updated Board`, board);
            localStorage.setItem(`board`, JSON.stringify(board));
        };

        let boardColumnItems = document.querySelectorAll(`.boardColumnItems`);
        boardColumnItems.forEach(columnItems => {
            setTimeout(() => {
                if (columnItems.scrollHeight > columnItems.clientHeight) {
                    columnItems.classList.add(`overflowingList`);
                } else {
                    columnItems.classList.remove(`overflowingList`);
                }
            }, 250);
        });

        let itemContents = document.querySelectorAll(`.boardItemContent`);
        let arrayOfItemContents = Array.from(itemContents).map(content => content.innerHTML.toLowerCase());

        // console.clear();
        // console.log(arrayOfItemContents);
        // console.log(getCommonWords(arrayOfItemContents));

        setBoardCategories(getCommonWords(arrayOfItemContents));
        setCategories(boardCategories.map(cat => cat.word));

        setPage(`Boards`);
        setUpdates(updates + 1);
        // dev() && console.log(`Updates`, updates);
        // dev() && board?.columnOrder &&  board?.columnOrder.length > 0 && console.log(`Board`, board);

    },  [board])

    return (
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <section className="boardsTitle boards" style={{paddingBottom: 0}}>
                <div className="board boardTitle">
                    <div id={`titleRowOfBoard`} className={`titleRow flex row`}>
                        <div className="flex row innerRow">
                            <div className="flex row left">
                                {devEnv && <h3><span className="subscript">(1)</span></h3>}
                                <h2><input type={`text`} id={`${board.id}_change_label`} ref={boardNameRef} title={board?.name} onBlur={(e) => changeLabel(e, board, setBoard)} className={`changeLabel textOverflow`} name={`boardName`} defaultValue={board?.name ?? `Board`} style={{width: board.titleWidth ? board.titleWidth : `75px`}} /></h2>
                                <h3 className="boardDate">
                                    <span className="subscript rowDate itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                                        <i> - </i>
                                        <i className={`status`}>{board && board?.created && !board?.updated ? `Cre.` : `Upd.` }</i> 
                                        <i><span className={`itemDateTime`}>{board?.updated ?? board?.created}</span></i>
                                    </span>
                                </h3>
                            </div>
                            <h3 className={`divSep`}><span className="subscript" style={{color: `var(--gameBlue)`}}>|</span></h3>
                            <div className="flex row middle">
                                <h3>{board?.columnOrder && board?.columnOrder?.length} <span className={`subscript`}>Column(s)</span></h3>
                                <h3>{board?.items && Object.entries(board?.items).length} <span className={`subscript`}>Items(s)</span></h3>
                            </div>
                            <h3 className={`divSep`}><span className="subscript" style={{color: `var(--gameBlue)`}}>|</span></h3>
                            <div className="flex row right">
                                <h3 className="filtersSubscript"><span className="subscript">Filters</span></h3>
                                <div className="filterFormDiv filterButtons itemButtons" style={{textAlign: `center`, justifyContent: `space-between`, alignItems: `center`}}>
                                    <button onClick={(e) =>  setCompleteFiltered(!completeFiltered)} id={`filter_completed`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Filter Completed`} className={`iconButton deleteButton filterButton ${completeFiltered ? `filterActive` : `filterInactive`}`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${completeFiltered ? `fa-times-circle` : `fa-check-circle`}`}></i>
                                        <span className={`iconButtonText textOverflow extended`}>Completed</span>
                                    </button>
                                    <button onClick={(e) =>  setTasksFiltered(!tasksFiltered)} id={`filter_tasks`} style={{ pointerEvents: `all`, width: `8%`, minWidth: 33, maxWidth: 33 }} title={`Filter Tasks`} className={`iconButton deleteButton filterButton ${tasksFiltered ? `filterActive` : `filterInactive`}`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className={`fas ${tasksFiltered ? `fa-times-circle` : `fa-list-ol`}`}></i>
                                        <span className={`iconButtonText textOverflow extended`}>Tasks</span>
                                    </button>
                                    <section className={`addListFormItemSection`} style={{ margin: 0, padding: 0 }}>
                                        <form onSubmit={addNewColumn} title={`Add Column`} id={`addListForm`} className={`flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                            <input maxLength={35} placeholder={`New Column`} type="text" name="createItem" required />
                                            <button type={`submit`} title={`Create Column`} className={`submit iconButton createList`}>
                                                <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-list"></i>
                                                <span className={`iconButtonText textOverflow extended`}>
                                                    <span style={{ fontSize: 12 }}>Create Column</span><span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                                        {board?.columnOrder && board?.columnOrder.length + 1}
                                                    </span>
                                                </span>
                                            </button>
                                        </form>
                                    </section>
                                    {devEnv && <div className="itemButtons customButtons">
                                        <button id={`delete_${board?.id}`} onClick={(e) => console.log(e, board)} title={`Delete Board`} className={`iconButton deleteButton`}>
                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                                            <span className={`iconButtonText textOverflow extended`}>Delete</span>
                                        </button>
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {board?.columnOrder && (
                <Droppable droppableId={`${board.id}_boardColumns`} direction="horizontal" type="column">
                    {(provided, snapshot) => (
                        <section id={`board`} className={`board lists container ${snapshot.isDraggingOver ? `isDraggingOver` : ``} ${board?.columnOrder && (board?.columnOrder.length == 2 ? `clipColumns` : board?.columnOrder.length == 3 ? `threeBoard overflowingBoard` : board?.columnOrder.length > 3 ? `moreBoard overflowingBoard` : ``)}`} ref={provided.innerRef} {...provided.droppableProps} style={props.style}>
                            {board?.columnOrder && board?.columnOrder.map((columnId, index) => {
                                const column = board?.columns[columnId];
                                const items = column.itemIds.map(itemId => board?.items[itemId]);
                                return <Column key={column?.id} column={column} items={items} index={index} board={board} setBoard={setBoard} />;
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

export default Board;