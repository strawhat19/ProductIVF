import SubTasks from './subtasks';
import React, { useContext } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { showAlert, formatDate, generateUniqueID, StateContext, dev, capitalizeAllWords } from '../../pages/_app';
import ItemDetail from './itemdetail';

export default function Column(props) {
    let count = 0;
    const { boards, setBoards, setLoading, setSystemStatus, devEnv, completeFiltered, boardCategories, tasksFiltered } = useContext<any>(StateContext);

    const itemActiveFilters = (itm) => {
        if (completeFiltered) {
            if (!itm.complete) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    const kmpSearch = (pattern, text) => {
        if (pattern.length == 0) return false; // Immediate match
      
        // Compute longest suffix-prefix table
        var lsp = [0]; // Base case
        for (var i = 1; i < pattern.length; i++) {
          var j = lsp[i - 1]; // Start by assuming we're extending the previous LSP
          while (j > 0 && pattern[i] !== pattern[j])
            j = lsp[j - 1];
          if (pattern[i] === pattern[j])
            j++;
          lsp.push(j);
        }
      
        // Walk through text string
        var j = 0; // Number of chars matched in pattern
        for (var i = 0; i < text.length; i++) {
          while (j > 0 && text[i] != pattern[j])
            j = lsp[j - 1]; // Fall back in the pattern
          if (text[i]  == pattern[j]) {
            j++; // Next char matched, increment position
            if (j == pattern.length)
              return i - (j - 1) ? true : false;
          }
        }
        return false; // Not found
      }

    const matchCriteria = (itm) => {
        let text = itm.content;
        boardCategories.map(cat => cat.word).forEach(pattern => {
            if (pattern.length == 0) return 0; // Immediate match
        
            // Compute longest suffix-prefix table
            let lsp = [0]; // Base case
            for (let i = 1; i < pattern.length; i++) {
                let j = lsp[i - 1]; // Start by assuming we're extending the previous LSP
                while (j > 0 && pattern[i] !== pattern[j])
                j = lsp[j - 1];
                if (pattern[i] === pattern[j])
                j++;
                lsp.push(j);
            }
            
            // Walk through text string
            let j = 0; // Number of chars matched in pattern
            for (let i = 0; i < text.length; i++) {
                while (j > 0 && text[i] != pattern[j])
                j = lsp[j - 1]; // Fall back in the pattern
                if (text[i]  == pattern[j]) {
                j++; // Next char matched, increment position
                if (j == pattern.length)
                    return i - (j - 1);
                }
            }
            return -1; // Not found
        })
    }

    const wordInCategories = itm => {
        // console.log(matchCriteria(itm));
        // boardCategories.forEach(cat => {
        //     return kmpSearch(cat.word, itm.content);
        // });
        let condition =  boardCategories.map(cat => cat.word).includes(itm.content.toLowerCase().slice(0,3))
        || boardCategories.map(cat => cat.word).includes(itm.content.toLowerCase().slice(0,4)) || boardCategories.map(cat => cat.word).includes(itm.content.toLowerCase().slice(5));
        // console.log(itm.content, condition);
        return (
            condition
        );
        // itm.content.toLowerCase().split(` `).forEach(wrd => {
        //    boardCategories.map(cat => cat.word).includes(wrd);
        // })
        // boardCategories.map(cat => {
        //     console.log(cat.word);
        //     console.log(itm.content.toLowerCase().split(` `));
        //     console.log(itm.content.toLowerCase().split(` `).includes(cat.word));
        //     return itm.content.toLowerCase().split(` `).includes(cat.word);
        // });
    }

    const wordOfCategory = itm => {
        return itm.content.slice(0,4);
    }

    const copyItem = (e, item) => {
        navigator.clipboard.writeText(item.content);
        // Highlight Target Text
        let parentItemElement = e.target.parentElement.parentElement;
        let itemContentElement = parentItemElement.querySelector(`.itemContent`);
        let selection = window.getSelection();
        let range = document.createRange();
        range.selectNodeContents(itemContentElement);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    const addNewItem = (e) => {
        e.preventDefault();
        let formFields = e.target.children;
        setLoading(true);
        const column = props.board.columns[props.column.id];
        let nextIndex = column.itemIds.length + 1;
        setSystemStatus(`Creating Item.`);
        let listItems = e.target.previousSibling;
        let newItemID = `item_${nextIndex}`;
        let itemID = `${newItemID}_${generateUniqueID()}`;
        let content = formFields[0].value;
        let rank = formFields.rank.value;
        if (!rank || rank == ``) rank = nextIndex;
        rank = parseInt(rank);
        rank = rank > nextIndex ? nextIndex : rank; 
        let image = formFields.itemImage.value ?? ``;
        const newItemIds = Array.from(column.itemIds);
        newItemIds.splice(rank - 1,0,itemID);

        const newItem = {
            image,
            id: itemID,
            subtasks: [],
            complete: false,
            created: formatDate(new Date()),
            content: capitalizeAllWords(content),
        }

        props.setBoard({
            ...props.board,
            updated: formatDate(new Date()),
            items: {
                ...props.board.items,
                [itemID]: newItem
            },
            columns: {
                ...props.board.columns,
                [column.id]: {
                    ...props.board.columns[column.id],
                    itemIds: newItemIds
                }
            }
        });

        e.target.reset();
        e.target.children[0].focus();
        setTimeout(() => {
            setSystemStatus(`Created Item.`);
            setLoading(false);
        }, 1000);
        window.requestAnimationFrame(() => {
            if (rank <= 5) {
                return listItems.scrollTop = 0;
            } else {
                return listItems.scrollTop = listItems.scrollHeight;
            }
        });
    }

    const manageItem = (e, item) => {
        showAlert(item?.content, <ItemDetail item={item} boards={boards} setBoards={setBoards} />, `95%`, `95%`);
    }

    const changeLabel = (e, item) => {
        let elemValue = e.target.textContent;
        let value = elemValue == `` ? capitalizeAllWords(item.task) : capitalizeAllWords(elemValue);
        if (!elemValue || elemValue == ``) {
            elemValue = capitalizeAllWords(item.task);
            return;
        };
        elemValue = capitalizeAllWords(value);
        item.updated = formatDate(new Date());
        item.content = capitalizeAllWords(value);
        localStorage.setItem(`boards`, JSON.stringify(boards));
    }

    const changeColumnLabel = (e, item) => {
        let elemValue = e.target.textContent;
        let value = elemValue == `` ? capitalizeAllWords(item.task) : capitalizeAllWords(elemValue);
        if (!elemValue || elemValue == ``) {
            elemValue = capitalizeAllWords(item.task);
            return;
        };
        elemValue = capitalizeAllWords(value);
        item.updated = formatDate(new Date());
        item.title = capitalizeAllWords(value);
        localStorage.setItem(`boards`, JSON.stringify(boards));
    }

    const completeItem = (e, itemId, index, item) => {
        let button = e.target;
        let isButton = button.classList.contains(`iconButton`);
        if (isButton) {
            let completeButton = button.classList.contains(`completeButton`);
            if (!completeButton) return;
        }
        if (!e.target.classList.contains(`changeLabel`)) {
            completeActions(item, index, itemId, isButton);
        }
    }

    const completeActions = (item, index, itemId, isButton) => {
        if (count == 0) {
            setLoading(true);
            setSystemStatus(`Marking Item as Complete.`);

            props.board.items[itemId].updated = formatDate(new Date());
            props.board.items[itemId].complete = !props.board.items[itemId].complete;

            props.setBoard({
                ...props.board,
                updated: formatDate(new Date()),
                items: {
                    ...props.board.items
                },
            });

            setTimeout(() => {
                setSystemStatus(item.complete ? `Marked Item as Complete.` : `Reopened Item.`);
                setLoading(false);
            }, 1000);
            if (isButton) count = count + 1;
        }
    }

    const deleteItem = (e, item, columnId, index, itemId) => {
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            setLoading(true);
            setSystemStatus(`Deleting Item.`);
            const column = props.board.columns[columnId];
            const newItemIds = Array.from(column.itemIds);
            newItemIds.splice(index, 1);

            const items = props.board.items;
            const { [itemId]: oldItem, ...newItems } = items;

            props.setBoard({
                ...props.board,
                updated: formatDate(new Date()),
                items: {
                    ...newItems
                },
                columns: {
                    ...props.board.columns,
                    updated: formatDate(new Date()),
                    [columnId]: {
                        ...column,
                        itemIds: newItemIds
                    }
                }
            });
            setTimeout(() => {
                setSystemStatus(`Deleted Item ${item.content}.`);
                setLoading(false);
            }, 1000);   
        }
    }

    const getSubTaskPercentage = (subtasks) => {
        let subtasksProgress = 0;
        let completeTasks = subtasks.filter(task => task.complete);
        subtasksProgress = parseFloat(((completeTasks.length / subtasks.length) * 100).toFixed(1));
        return subtasksProgress;
    }

    const deleteColumn = (columnId, index) => {
        setLoading(true);
        setSystemStatus(`Deleting Column.`);
        const columnItems = props.board.columns[columnId].itemIds;

        const finalItems = columnItems.reduce((previousValue, currentValue) => {
            const { [currentValue]: oldItem, ...newItem } = previousValue;
            return newItem;
        }, props.board.items);

        const columns = props.board.columns;
        const { [columnId]: oldColumn, ...newColumns } = columns;

        const newColumnOrder = Array.from(props.board.columnOrder);
        newColumnOrder.splice(index, 1);

        props.setBoard(prevBoard => {
            return {
                ...prevBoard,
                updated: formatDate(new Date()),
                items: {
                    ...finalItems
                },
                columns: {
                    ...newColumns
                },
                columnOrder: newColumnOrder
            }
        });

        setTimeout(() => {
            setSystemStatus(`Deleted Column.`);
            setLoading(false);
        }, 1000);
    }

    return (
        <Draggable draggableId={props.column.id} index={props.index}>
            {(provided, snapshot) => (
                <div id={props.column.id} className={`container column list ${snapshot.isDragging ? `dragging` : ``}`} {...provided.draggableProps} ref={provided.innerRef}>
                    <div style={{ position: `relative` }} id={`name_of_${props.column.id}`} title={`${props.column.title}`} className={`columnTitle flex row iconButton item listTitleButton`} {...provided.dragHandleProps}>
                        <div className="itemOrder listOrder" style={{ maxWidth: `fit-content` }}>
                            <i style={{ color: `var(--gameBlue)`, fontSize: 15, padding: `0 9px`, maxWidth: `fit-content` }} className="fas fa-list"></i>
                        </div>
                        <h3 className={`listNameRow nx-tracking-light ${props.column.title.length > 25 ? `longName` : ``}`} id={`list_name_of_${props.column.id}`} style={{ position: `relative`, fontStyle: `italic` }}>
                            <div className={`listName textOverflow extended flex row`} style={{ fontSize: 13, fontWeight: 600 }}>
                                <div onBlur={(e) => changeColumnLabel(e, props.column)} className="columnName changeLabel" contentEditable suppressContentEditableWarning>
                                    {props.column.title}    
                                </div>
                                <div className="columnStats flex row end">
                                    <span className="subscript" style={{display: `contents`,}}><span className="slashes">{props.items.filter(itm => itemActiveFilters(itm) && itm?.complete).length}</span> Done <div className="slashes" style={{display: `contents`}}> // </div> <span className="slashes">{props.items.filter(itm => itemActiveFilters(itm)).length}</span> Items</span><span className="subscript" style={{display: `contents`,}}> - <span className="slashes">{[].concat(...props.items.filter(itm => itemActiveFilters(itm)).map(itm => itm?.subtasks)).filter(itm => itm?.complete).length}</span> Done <div className="slashes" style={{display: `contents`}}> // </div> <span className="slashes">{[].concat(...props.items.filter(itm => itemActiveFilters(itm)).map(itm => itm?.subtasks)).length}</span> Tasks</span>
                                </div>
                            </div>
                        </h3>
                        <div className="itemButtons customButtons">
                            {/* <button title={`Edit List`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                            <button id={`delete_${props.column.id}`} style={{ pointerEvents: `all` }} onClick={(e) => deleteColumn(props.column.id, props.index)} title={`Delete List`} className={`iconButton deleteButton`}>
                                <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-trash"></i>
                                <span className={`iconButtonText textOverflow extended`}>Delete</span>
                            </button>
                        </div>
                    </div>
                    <Droppable droppableId={props.column.id} type="task">
                        {provided => (
                            <div id={`items_of_${props.column.id}`} className={`items boardColumnItems listItems`} {...provided.droppableProps} ref={provided.innerRef}>
                                {props.items.filter(itm => itemActiveFilters(itm)).map((item, itemIndex) => {
                                    if (!item.subtasks) item.subtasks = [];
                                    return (
                                    <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                        {provided => (
                                            <div id={item.id} className={`item completeItem ${item.complete ? `complete` : ``} container ${snapshot.isDragging ? `dragging` : ``}`} title={item.content} {...provided.draggableProps} ref={provided.innerRef}>
                                                <div onClick={(e) => completeItem(e, item.id, itemIndex, item)} {...provided.dragHandleProps} className={`itemRow flex row ${item?.complete ? `completed` : `incomplete`} ${item.subtasks.length > 0 ? `hasTasksRow` : `noTasksRow`}`}>
                                                    <span className="itemOrder rowIndexOrder">
                                                        <i className={`itemIndex ${item.complete ? `completedIndex` : `activeIndex`}`}>{itemIndex + 1}</i>
                                                    </span>
                                                    {item?.image && <img className={`itemImage`} style={{maxWidth: 175, maxHeight: 350, width: `auto`, marginLeft: -13}} src={item?.image} alt={item?.content} />}
                                                    <div className="itemContents">
                                                        <span className="flex row itemContent boardItemContent itemName textOverflow extended">
                                                            {/* <textarea onBlur={(e) => changeLabel(e, item)} className={`changeLabel`} defaultValue={item.content} /> */}
                                                            <span onBlur={(e) => changeLabel(e, item)} contentEditable suppressContentEditableWarning className={`changeLabel`}>{item.content}</span>
                                                            {/* {item.subtasks.length > 0 && (
                                                                <div className="progress">
                                                                    <div className="progressBar" style={{clipPath: `polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)`}}></div>
                                                                </div>
                                                            )} */}
                                                        </span>
                                                        {/* {devEnv && wordInCategories(item) && <span className="itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                                                            <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-hashtag"></i> 
                                                            <span className={`itemDateTime`}>{wordOfCategory(item)}</span>
                                                        </span>} */}
                                                        <hr className={`itemSep`} style={{height: 1, borderColor: `var(--gameBlue)`}} />
                                                        <div className="itemFooter flex row">
                                                            {item.created && !item.updated ? (
                                                            <span className="itemDate itemName itemCreated textOverflow extended flex row">
                                                                <i className={`status`}>Cre.</i> 
                                                                <span className={`itemDateTime`}>{formatDate(new Date(item.created))}</span>
                                                            </span>
                                                            ) : item.updated ? (
                                                            <span className="itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                                                                <i className={`status`}>Upd.</i> 
                                                                <span className={`itemDateTime`}>{formatDate(new Date(item.updated))}</span>
                                                            </span>
                                                            ) : null}
                                                            {!tasksFiltered && item.subtasks && item.subtasks.length > 0 && <>
                                                                <span className={`subtaskIndex subscript flex row`}><span className={`slashes`}>???</span> {item.subtasks.filter(subtask => subtask.complete).length} <span className="slashes">//</span> {item.subtasks.length}</span>
                                                            </>}
                                                        </div>
                                                    </div>
                                                    {!tasksFiltered && item.subtasks.length > 0 && <div className={`progress`}>
                                                        <CircularProgressbar value={getSubTaskPercentage(item.subtasks)} text={`${getSubTaskPercentage(item.subtasks)}%`} styles={buildStyles({
                                                            // Rotation of path and trail, in number of turns (0-1)
                                                            rotation: 0.5,

                                                            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                                                            strokeLinecap: 'butt',

                                                            // Text size
                                                            textSize: '24px',

                                                            // How long animation takes to go from one percentage to another, in seconds
                                                            pathTransitionDuration: 0.5,

                                                            // Can specify path transition in more detail, or remove it entirely
                                                            // pathTransition: 'none',

                                                            // Colors
                                                            pathColor: getSubTaskPercentage(item.subtasks) < 100 ? `rgba(0, 194, 255, ${getSubTaskPercentage(item.subtasks) / 100})` : `#00b900`,
                                                            trailColor: 'rgba(0, 194, 255, 0.2)',
                                                            backgroundColor: '#3e98c7',
                                                            textColor: '#fff',
                                                        })} />
                                                    </div>}
                                                    <div className="itemButtons customButtons">
                                                        {/* <button id={`copy_${item.id}`} onClick={(e) => copyItem(e, item)} title={`Copy Item`} className={`iconButton ${ItemActions.Copy} copyButton wordIconButton`}>
                                                            <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas fa-copy`}></i>
                                                        </button> */}
                                                        <button id={`delete_${item.id}`} onClick={(e) => deleteItem(e, item, props.column.id, itemIndex, item.id)} title={`Delete Item`} className={`iconButton deleteButton wordIconButton`}>
                                                            <i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i>
                                                        </button>
                                                        <button id={`complete_${item.id}`} onClick={(e) => completeItem(e, item.id, itemIndex, item)} title={`Complete Item`} className={`iconButton wordIconButton completeButton`}>
                                                            <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas ${item.complete ? `fa-history` : `fa-check-circle`}`}></i>
                                                        </button>
                                                        <button id={`manage_${item.id}`} onClick={(e) => manageItem(e, item)} title={`Manage Item`} className={`iconButton wordIconButton manageButton`}>
                                                            <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas fa-bars`}></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                {!tasksFiltered && item.subtasks && <SubTasks item={item} />}
                                            </div>
                                        )}
                                    </Draggable>
                                    )}
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <form title={`Add Item`} id={`add_item_form_${props.column.id}`} className={`flex addItemForm itemButtons unset addForm`} style={{ width: `100%`, flexDirection: `row` }} onSubmit={(e) => addNewItem(e)}>
                        <input placeholder={`Add`} type="text" name="createItem" required />
                        <input style={{padding: `10px 0px 10px 15px`, minWidth: `75px`, maxWidth: `75px`}} placeholder={`Img`} type="text" name="itemImage" />
                        <input name={`rank`} placeholder={props.items.filter(itm => itemActiveFilters(itm)).length + 1} defaultValue={props.items.filter(itm => itemActiveFilters(itm)).length + 1} type={`number`} min={1} />
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
                </div>
            )}
        </Draggable>
    )
}