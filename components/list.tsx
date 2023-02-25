import React, { useContext } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { showAlert, formatDate, generateUniqueID, StateContext } from '../pages/_app';

function List(props) {
    let count = 0;
    const { setLoading, setSystemStatus, devEnv, completeFiltered, boardCategories } = useContext<any>(StateContext);

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

    const addNewItem = (e) => {
        e.preventDefault();
        let formFields = e.target.children;
        setLoading(true);
        const column = props.state.columns[props.column.id];
        let nextIndex = column.itemIds.length + 1;
        setSystemStatus(`Creating Item ${nextIndex}.`);
        let listItems = e.target.previousSibling;
        let newItemID = `item_${nextIndex}`;
        let itemID = `${newItemID}_${generateUniqueID()}`;
        let content = formFields[0].value;
        let rank = formFields.rank.value;
        if (!rank || rank == ``) rank = nextIndex;
        rank = parseInt(rank);
        rank = rank > nextIndex ? nextIndex : rank; 
        const newItemIds = Array.from(column.itemIds);
        newItemIds.splice(rank - 1,0,itemID);

        const newItem = {
            id: itemID,
            complete: false,
            content: content,
            created: formatDate(new Date()),
        }

        props.setState({
            ...props.state,
            updated: formatDate(new Date()),
            items: {
                ...props.state.items,
                [itemID]: newItem
            },
            columns: {
                ...props.state.columns,
                [column.id]: {
                    ...props.state.columns[column.id],
                    itemIds: newItemIds
                }
            }
        });

        e.target.reset();
        setTimeout(() => {
            setSystemStatus(`Created Item ${rank}.`);
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

    const completeItem = (e, itemId, index, item) => {
        let button = e.target;
        let isButton = button.classList.contains(`iconButton`);
        if (isButton) {
            let completeButton = button.classList.contains(`completeButton`);
            let deleteButton = button.classList.contains(`deleteButton`);
            if (!completeButton && deleteButton) return;
            if (completeButton && deleteButton) {
                completeActions(item, index, itemId, isButton);
            }
        }
        completeActions(item, index, itemId, isButton);
    }

    const completeActions = (item, index, itemId, isButton) => {
        if (count == 0) {
            setLoading(true);
            setSystemStatus(`Marking Item ${index + 1} as Complete.`);

            props.state.items[itemId].updated = formatDate(new Date());
            props.state.items[itemId].complete = !props.state.items[itemId].complete;

            props.setState({
                ...props.state,
                updated: formatDate(new Date()),
                items: {
                    ...props.state.items
                },
            });

            setTimeout(() => {
                setSystemStatus(item.complete ? `Marked Item ${index + 1} as Complete` : `Reopened Item ${index + 1}`);
                setLoading(false);
            }, 1000);
            if (isButton) count = count + 1;
        }
    }

    const deleteItem = (e, item, columnId, index, itemId) => {
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            setLoading(true);
            setSystemStatus(`Deleting Item ${index + 1}.`);
            const column = props.state.columns[columnId];
            const newItemIds = Array.from(column.itemIds);
            newItemIds.splice(index, 1);

            const items = props.state.items;
            const { [itemId]: oldItem, ...newItems } = items;

            props.setState({
                ...props.state,
                updated: formatDate(new Date()),
                items: {
                    ...newItems
                },
                columns: {
                    ...props.state.columns,
                    [columnId]: {
                        ...column,
                        itemIds: newItemIds
                    }
                }
            });
            setTimeout(() => {
                setSystemStatus(`Deleted Item ${index + 1}.`);
                setLoading(false);
            }, 1000);   
        }
    }

    const deleteColumn = (columnId, index) => {
        setLoading(true);
        setSystemStatus(`Deleting column.`);
        const columnItems = props.state.columns[columnId].itemIds;

        const finalItems = columnItems.reduce((previousValue, currentValue) => {
            const { [currentValue]: oldItem, ...newItem } = previousValue;
            return newItem;
        }, props.state.items);

        const columns = props.state.columns;
        const { [columnId]: oldColumn, ...newColumns } = columns;

        const newColumnOrder = Array.from(props.state.columnOrder);
        newColumnOrder.splice(index, 1);

        props.setState(prevBoard => {
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
            setSystemStatus(`Deleted Column ${newColumnOrder.length + 1}.`);
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
                        <h3 className={`listNameRow nx-tracking-light ${props.column.title.length > 25 ? `longName` : ``}`} id={`list_name_of_${props.column.id}`} style={{ position: `relative` }}>
                            <i className={`listName textOverflow extended`} style={{ fontSize: 13, fontWeight: 600 }}>
                                {props.column.title}
                            </i>
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
                                {props.items.filter(itm => itemActiveFilters(itm)).map((item, itemIndex) =>
                                    (<Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                        {provided => (
                                            <div onClick={(e) => completeItem(e, item.id, itemIndex, item)} id={item.id} className={`item ${item.complete ? `complete` : ``} container ${snapshot.isDragging ? `dragging` : ``}`} title={item.content} {...provided.draggableProps} ref={provided.innerRef} {...provided.dragHandleProps}>
                                                <span className="itemOrder">
                                                    <i className={`itemIndex ${item.complete ? `completedIndex` : `activeIndex`}`}>{itemIndex + 1}</i>
                                                </span>
                                                <div className="itemContent">
                                                    <span className="boardItemContent itemName textOverflow extended">{item.content}</span>
                                                    {/* {devEnv && wordInCategories(item) && <span className="itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-hashtag"></i> 
                                                        <span className={`itemDateTime`}>{wordOfCategory(item)}</span>
                                                    </span>} */}
                                                    <hr className={`itemSep`} style={{height: 1, borderColor: `var(--gameBlue)`}} />
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
                                                </div>
                                                <div className="itemButtons customButtons">
                                                    <button id={`complete_${item.id}`} onClick={(e) => completeItem(e, item.id, itemIndex, item)} title={`Complete Item`} className={`iconButton deleteButton wordIconButton completeButton`}>
                                                        <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas ${item.complete ? `fa-history` : `fa-check-circle`}`}></i>
                                                    </button>
                                                    <button id={`delete_${item.id}`} onClick={(e) => deleteItem(e, item, props.column.id, itemIndex, item.id)} title={`Delete Item`} className={`iconButton deleteButton wordIconButton`}>
                                                        <i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>)
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <form title={`Add Item`} id={`add_item_form_${props.column.id}`} className={`flex addItemForm itemButtons unset addForm`} style={{ width: `100%`, flexDirection: `row` }} onSubmit={(e) => addNewItem(e)}>
                        <input placeholder={`Add`} type="text" name="createItem" required />
                        <input name={`rank`} placeholder={props.column.itemIds.length + 1} defaultValue={props.column.itemIds.length + 1} type={`number`} min={1} />
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

export default List;