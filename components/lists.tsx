// import $ from 'jquery';
import { useContext, useEffect, useRef } from 'react';
// import 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { StateContext, formatDate, getPage, generateUniqueID, dev } from '../pages/_app';
import Grid from './grid';
import Spreadsheet from './spread';

declare global {

    interface Cell {
        value: string;
    }

    interface Row {
        cells: Cell[];
    }

    interface SpreadsheetProps {
        rows: Row[];
    }

    interface User {
      color: any;
      id: string;
      bio: string;
      updated: any; 
      name: string; 
      email: string;
      lists: List[];
      number: number;
      status: string;
      roles: string[];
      lastSignin: any; 
      registered: any; 
      password: string;
      highScore: number;
      [key: string]: any;
    }
  
    interface Item {
      id: string;
      content: string;
      created: string;
      updated?: string;
      complete: boolean;
      [key: string]: any;
    }
    
    interface List {
      id: string;
      name: string;
      items: Item[];
      created: string;
      updated?: string;
      [key: string]: any;
    }
  
    interface Anim extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
      background?: string;
      position?: any;
      src?: string;
      class?: any;
      left?: any;
      right?: any;
      muted?: any;
      speed?: any;
      style?: {
        width?: number;
        height?: number;
        top?: any;
        left?: any;
        bottom?: any;
        right?: any;
      };
      loop?: any;
      autoplay?: any;
      [key: string]: any;
    }
  
    namespace JSX {
      interface IntrinsicElements {
        'lottie-player': Anim,
      }
    }
  }

const grid = 10;

export const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? "var(--bg)" : "var(--menuBackground)",
  ...draggableStyle
});

export const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "var(--gameBlue)" : "var(--gameBlueSoft)",
  padding: grid,
  width: 250
});

export default function Lists(props) {

    let listsRef = useRef<any>(null);
    const { lists, setLists, devEnv, alertOpen, setAlertOpen, loading, setLoading, systemStatus, setSystemStatus, setAnimComplete, setPage, IDs, setIDs } = useContext<any>(StateContext);

    const createList = async (e: any, lists: List[]) => {
        e.preventDefault();
        setLoading(true);
        setSystemStatus(`Creating List.`);
        let newListID = `list_${lists.length + 1}`;
        let formFields = e.target.children;
        let newList: List = {
            id: `${newListID}_${generateUniqueID(IDs)}`,
            created: formatDate(new Date()),
            name: formFields[0].value,
            items: [ ]
        };
        let updatedLists: any[] = [...lists, newList];
        setIDs(IDs.concat(updatedLists.concat(...updatedLists.map(lis => lis.items)).map(object => object.id)));
        localStorage.setItem(`lists`, JSON.stringify(updatedLists));
        await setLists(updatedLists);
        e.target.reset();
        setSystemStatus(`Created List #${lists.length + 1} ${newList.name}.`);
        setTimeout(() => setLoading(false), 1500);
        let newListForm: any = document.querySelector(`#${newList.id} form input`);
        // addPaddingForLists();
        if (newListForm) newListForm.focus();
        // setTimeout(() => setAnimComplete(true), 3500);
    }

    const createItem = async (e: any, list: List) => {
        e.preventDefault();
        setLoading(true);
        setSystemStatus(`Creating Item.`);
        let newItemID = `item_${list.items.length + 1}`;
        let listItems = e.target.previousSibling; 
        let formFields = e.target.children;
        let newItem: Item = {
            complete: false, 
            content: formFields[0].value, 
            created: formatDate(new Date()),
            id: `${newItemID}_${generateUniqueID(IDs)}`, 
        };
        let updatedItems: Item[] = [...list.items, newItem];
        let updatedLists = lists.map((lis: List) => {
            if (lis.id == list.id) {
                return {...list, items: updatedItems, updated: formatDate(new Date())};
            } else {
                return lis;
            }
        });
        setIDs(IDs.concat(updatedLists.concat(...lists.map(lis => lis.items)).map(object => object.id)));
        localStorage.setItem(`lists`, JSON.stringify(updatedLists));
        await setLists(updatedLists);
        e.target.reset();
        setSystemStatus(`Created Item ${list.items.length + 1}.`);
        setTimeout(() => setLoading(false), 1500);
        // addPaddingForLists();
        // setTimeout(() => setAnimComplete(true), 3500);
        return listItems.scrollTop = listItems.scrollHeight;
    }

    const deleteList = async (e: any, list: List, index) => {
        e.preventDefault();
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            setLoading(true);
            setSystemStatus(`Deleting List.`);
            let updatedLists = lists.filter((lis: List) => lis.id != list.id);
            localStorage.setItem(`lists`, JSON.stringify(updatedLists));
            await setLists(updatedLists);
            setSystemStatus(`Deleted List #${index + 1} - ${list.name}.`);
            setTimeout(() => setLoading(false), 1500);
            // addPaddingForLists();
        }
    }

    const deleteItem = async (e: any, item: Item, list: List, lists: List[], index) => {
        e.preventDefault();
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            setLoading(true);
            setSystemStatus(`Deleting Item.`);
            let updatedItems: Item[] = [...list.items.filter(itm => itm.id != item.id)];
            let updatedLists = lists.map((lis: List, index) => {
                if (lis.id == list.id) {
                    setSystemStatus(`Deleted Item ${index + 1}.`);
                    return {...list, items: updatedItems, updated: formatDate(new Date())};
                } else {
                    return lis;
                }
            });
            localStorage.setItem(`lists`, JSON.stringify(updatedLists));
            await setLists(updatedLists);
            setTimeout(() => setLoading(false), 1500);
            // addPaddingForLists();
        }
    }

    const setItemComplete = async (e: any, item: Item, list: List, index) => {
        let isButton = e.target.classList.contains(`iconButton`);
        if (!isButton) {
            setLoading(true);
            setSystemStatus(`Marking Item ${index + 1} as Complete.`);
            list.items[list.items.indexOf(item)].complete = !list.items[list.items.indexOf(item)].complete;
            list.items[list.items.indexOf(item)].updated = formatDate(new Date());
            localStorage.setItem(`lists`, JSON.stringify(lists));
            await setLists(lists);
            setTimeout(() => setLoading(false), 1500);
            setSystemStatus(`Marked Item ${index + 1} as Complete.`);
        }
    }

    const onDragEnd = (result, list) => {
        setLoading(true);
        // console.log(`Drag`, result);
        setSystemStatus(`Rearranging Items.`);
        // if item dropped outside the list
        if (!result.destination) {
        return;
        }
        const updatedItems = Array.from(list.items);
        const [removed] = updatedItems.splice(result.source.index, 1);
        updatedItems.splice(result.destination.index, 0, removed);
        let updatedItemsWithDates = updatedItems.map((itm: Item, index) => {
            if (index == result.destination.index) {
                return {
                    ...itm,
                    id: itm.id,
                    updated: formatDate(new Date())
                }
            } else {
                return itm;
            }
        })
        let updatedLists = lists.map((lis: List) => {
          if (lis.id == list.id) {
              return {
                ...list, 
                items: updatedItemsWithDates, 
                updated: formatDate(new Date())
            };
          } else {
              return lis;
          }
        });
        localStorage.setItem(`lists`, JSON.stringify(updatedLists));
        setLists(updatedLists);
        setLoading(false);
        setSystemStatus(`Moved Item ${result.source.index + 1} to ${result.destination.index + 1}.`);
        setTimeout(() => setLoading(false), 1500);
        return result;
    };

    const addPaddingForLists = () => {
        if (listsRef.current.children.length > 0) {
            let listItems = listsRef.current.querySelectorAll(`.listItems`);
            listItems.forEach(listOfItems => {
                if (listOfItems.scrollHeight > listOfItems.clientHeight) {
                    listOfItems.classList.add(`overflowingList`);
                }
            })
        }
    }

    useEffect(() => {

        setPage(getPage());

        setIDs(IDs.concat(lists.concat(...lists.map(lis => lis.items)).map(object => object.id)));

        // localStorage.setItem(`backup lists`, JSON.stringify(lists));

        addPaddingForLists();

        // ($(`.draggableDiv`) as any).sortable();
        // $(`.draggableDiv`).each(function() {
        //     let any: any = $(this);
        //     any.sortable();
        // })
    
    }, [lists])

    const cell1: Cell = {
        value: `item`
    }

    const cell2: Cell = {
        value: `item2`
    }

    const row1: Row = {
        cells: [cell2, cell1],
    };

    const row2: Row = {
        cells: [cell1, cell2],
    };

    const rows: SpreadsheetProps = {
        rows: [row1, row2]
    };

    return <>
    {devEnv && < Grid columns={lists} rows={rows} />}
    <div className="createList lists extended">
        <div id={props.id} className={`list items addListDiv`}>
            <div className="formItems items">
                <div className="addListFormItem">
                <h2 style={{fontWeight: 600, fontSize: 22, minWidth: `fit-content` }}>Create List {lists.length + 1}</h2>
                <section className={`addListFormItemSection`} style={{margin: 0}}>
                    <form title={`Add List`} id={`addListForm`} className={`flex addListForm itemButtons addForm`} style={{width: `100%`, flexDirection: `row`}} onSubmit={(e) => createList(e, lists)}>
                        <input maxLength={35} placeholder={`Name of List`} type="text" name="createItem" required />
                        {/* <input style={{borderRadius: `4px !important`}} className={`save submit`} type="submit" value={`Add List`} /> */}
                        <button type={`submit`} title={`Create List`} className={`iconButton createList`}>
                            <i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-list"></i>
                            <span className={`iconButtonText textOverflow extended`}>
                                <span style={{fontSize: 12}}>Create List</span><span className={`itemLength index`} style={{fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content`}}>
                                    {lists.length + 1}
                                </span>
                            </span>
                        </button>
                    </form>
                </section>
                </div>
            </div>
        </div>
    </div>
    <section ref={listsRef} className={`lists ${lists.length == 1 ? `oneList` : `multiList`}`} id={`lists`}>
        {lists.map((list, listIndex) => {
            // list.id = generateUniqueID(IDs, `list_${listIndex + 1}`);
            return <DragDropContext key={list.id} onDragEnd={(e) => onDragEnd(e, list)}>
            <Droppable id={list.id} droppableId={list.id}>
              {(provided, snapshot) => (
                <div
                  id={list.id}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`list items draggableDiv`}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  <div style={{pointerEvents: `none`, position: `relative`}} id={`name_of_${list.id}`} title={`${list.name}`}  className={`flex row iconButton item listTitleButton`}>
                      <div className="itemOrder listOrder" style={{maxWidth: `fit-content`}}>
                          <i style={{color: `var(--gameBlue)`, fontSize: 18, padding: `0 15px`, maxWidth: `fit-content`}} className="fas fa-list"></i>
                      </div>
                      <h3 className={`listNameRow ${list.name.length > 25 ? `longName` : ``} nx-tracking-light`} id={`list_name_of_${list.id}`} style={{position: `relative`}}>
                        <i className={`listName textOverflow extended`} style={{fontSize: 13, fontWeight: 600}}>
                            {list.name}
                        </i>
                      </h3>
                      <div className="itemButtons customButtons">
                          {/* <button title={`Edit List`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                          <button id={`delete_${list.id}`} style={{pointerEvents: `all`}} onClick={(e) => deleteList(e, list, listIndex)} title={`Delete List`} className={`iconButton deleteButton`}>
                            <i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i>
                            <span className={`iconButtonText textOverflow extended`}>Delete {list.items.length > 0 && <>
                            <span className={`itemLength index`} style={{fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content`}}>
                                {list.items.length}
                            </span>Item(s)</>}
                            </span>
                        </button>
                      </div>
                  </div>
                  <div id={`items_of_${list.id}`} className={`items listItems`}>
                      {list.items.map((item, index) => {
                        // item.id = generateUniqueID(IDs, `item_${index + 1}`);
                        return (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                <div
                                id={item.id}  
                                className={`item ${item.complete ? `complete` : ``}`}
                                  onClick={(e) => setItemComplete(e, item, list, index)}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  ref={provided.innerRef}
                                  title={item.content}
                                  style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                  )}
                                >
                                    <span className="itemOrder">
                                        <i className="itemIndex">{index + 1}</i>
                                    </span>
                                    <span className="itemName textOverflow extended">{item.content}</span>
                                    {item.created && !item.updated ? (
                                      <span className="itemDate itemName itemCreated textOverflow extended flex row">
                                          <i className={`status`}>Created</i> 
                                          <span className={`itemDateTime`}>{formatDate(new Date(item.created))}</span>
                                      </span>
                                    ) : item.updated ? (
                                      <span className="itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                                          <i className={`status`}>Updated</i> 
                                          <span className={`itemDateTime`}>{formatDate(new Date(item.updated))}</span>
                                      </span>
                                    ) : null}
                                    <div className="itemButtons customButtons">
                                        {/* <button title={`Edit Item`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                                        <button id={`delete_${item.id}`} onClick={(e) => deleteItem(e, item, list, lists, index)} title={`Delete Item`} className={`iconButton deleteButton wordIconButton`}>
                                          <i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                </div>
                                )}
                            </Draggable>
                          )
                      })}
                  </div>
                  <form title={`Add Item`} id={`add_item_form_${list.id}`} className={`flex addItemForm itemButtons unset addForm`} style={{width: `100%`, flexDirection: `row`}} onSubmit={(e) => createItem(e, list)}>
                    {/* <div className="itemOrder" style={{maxWidth: `fit-content`, height: `100%`}}>
                        <i style={{color: `var(--gameBlue)`, fontSize: 12, padding: `0 15px`, maxWidth: `fit-content`, height: `100%`, background: `white`}} className="fas fa-plus"></i>
                    </div> */}
                    <input placeholder={`Name of Item`} type="text" name="createItem" required />
                    <button type={`submit`} title={`Add Item`} className={`iconButton createList wordIconButton`}>
                        <i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-plus"></i>
                        <span className={`iconButtonText textOverflow extended`}>
                            <span style={{fontSize: 12}}>Add Item</span>
                            <span className={`itemLength index`} style={{fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content`}}>
                                {list.items.length + 1}
                            </span>
                        </span>
                    </button>
                    {/* <input style={{width: `35%`}} className={`save submit`} type="submit" value={`Add Item`} /> */}
                  </form>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        })}
    </section>
</>
}