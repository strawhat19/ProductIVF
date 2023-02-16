import { useContext, useEffect, useRef } from 'react';
import { StateContext, createXML, formatDate } from '../pages/_app';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

declare global {
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

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? "var(--bg)" : "var(--menuBackground)",
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "var(--gameBlue)" : "var(--gameBlueSoft)",
  padding: grid,
  width: 250
});

export default function Lists(props) {

    let listsRef = useRef<any>(null);
    const { lists, setLists, alertOpen, setAlertOpen, loading, setLoading, systemStatus, setSystemStatus, setAnimComplete } = useContext<any>(StateContext);

    const createList = async (e: any, lists: List[]) => {
        e.preventDefault();
        setLoading(true);
        setSystemStatus(`Creating List.`);
        let newListID = `list-${lists.length + 1}`;
        let formFields = e.target.children;
        let newList: List = {
            id: newListID,
            created: formatDate(new Date()),
            name: formFields[0].value,
            items: [ ]
        };
        let updatedLists: List[] = [...lists, newList];
        localStorage.setItem(`lists`, JSON.stringify(updatedLists));
        await setLists(updatedLists);
        e.target.reset();
        let newListForm: any = document.querySelector(`#${newListID} form input`);
        newListForm.focus();
        setSystemStatus(`Created List #${lists.length + 1} ${newList.name}.`);
        setTimeout(() => setLoading(false), 1500);
        // setTimeout(() => setAnimComplete(true), 3500);
    }

    const createItem = async (e: any, list: List) => {
        e.preventDefault();
        setLoading(true);
        setSystemStatus(`Creating Item.`);
        let listItems = e.target.previousSibling; 
        let formFields = e.target.children;
        let newItem: Item = {
            complete: false, 
            content: formFields[0].value, 
            created: formatDate(new Date()),
            id: `item-${list.items.length + 1}`, 
        };
        let updatedItems: Item[] = [...list.items, newItem];
        let updatedLists = lists.map((lis: List) => {
            if (lis.id == list.id) {
                return {...list, items: updatedItems, updated: formatDate(new Date())};
            } else {
                return lis;
            }
        });
        localStorage.setItem(`lists`, JSON.stringify(updatedLists));
        await setLists(updatedLists);
        e.target.reset();
        setSystemStatus(`Created Item ${list.items.length + 1}.`);
        setTimeout(() => setLoading(false), 1500);
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
        console.log(`Drag`, result);
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

    useEffect(() => {
        if (listsRef.current.children.length > 0) {
            let listItems = listsRef.current.querySelectorAll(`.listItems`);
            listItems.forEach(listOfItems => {
                if (listOfItems.scrollHeight > listOfItems.clientHeight) {
                    listOfItems.classList.add(`overflowingList`);
                }
            })
        }
    }, [lists])

    return <>
    <div className="createList lists extended">
        <div id={props.id} className={`list items addListDiv`}>
            <div className="items">
                <div className="addListFormItem">
                <h2 style={{fontWeight: 600, fontSize: 24, minWidth: `fit-content` }}>Create List {lists.length + 1}</h2>
                <section className={`addListFormItemSection`} style={{margin: 0}}>
                    <form title={`Add List`} id={`addListForm`} className={`flex addListForm itemButtons`} style={{width: `100%`, flexDirection: `row`}} onSubmit={(e) => createList(e, lists)}>
                        <input maxLength={35} placeholder={`Name of List`} type="text" name="createItem" required />
                        {/* <input style={{borderRadius: `4px !important`}} className={`save submit`} type="submit" value={`Add List`} /> */}
                        <button type={`submit`} title={`Create List`} className={`iconButton createList`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-list"></i><span className={`iconButtonText textOverflow extended`}><span style={{fontSize: 12}}>Create List</span><span className={`itemLength`} style={{fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content`}}>{lists.length + 1}</span></span></button>
                    </form>
                </section>
                </div>
            </div>
        </div>
    </div>
    <section ref={listsRef} className={`lists ${lists.length == 1 ? `oneList` : `multiList`}`} id={`lists`}>
        {lists.map((list, listIndex) => {
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
                  <div style={{pointerEvents: `none`, position: `relative`}} id={`manage${list.id}Button`} title={`Manage ${list.name}`}  className={`flex row iconButton item listTitleButton`}>
                      <div className="itemOrder listOrder" style={{maxWidth: `fit-content`}}>
                          <i style={{color: `var(--gameBlue)`, fontSize: 18, padding: `0 15px`, maxWidth: `fit-content`}} className="fas fa-list"></i>
                      </div>
                      <h3 className={`listNameRow nx-tracking-light`} id={list.id} style={{position: `relative`}}>
                        <i className={`listName textOverflow extended`} style={{fontSize: 13, fontWeight: 600}}>
                            {list.name}
                        </i>
                      </h3>
                      <div className="itemButtons customButtons">
                          {/* <button title={`Edit List`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                          <button style={{pointerEvents: `all`}} onClick={(e) => deleteList(e, list, listIndex)} title={`Delete List`} className={`iconButton deleteButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i><span className={`iconButtonText textOverflow extended`}>Delete {list.items.length > 0 && <><span className={`itemLength`} style={{fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content`}}>{list.items.length}</span>Item(s)</>}</span></button>
                      </div>
                  </div>
                  <div className={`items listItems`}>
                      {list.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                          <div
                            className={`item ${item.complete ? `complete` : ``}`}
                            onClick={(e) => setItemComplete(e, item, list, index)}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            id={`item-${index + 1}`}
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
                                  <button onClick={(e) => deleteItem(e, item, list, lists, index)} title={`Delete Item`} className={`iconButton deleteButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i></button>
                              </div>
                          </div>
                          )}
                      </Draggable>
                      ))}
                  </div>
                  <form title={`Add Item`} id={`listForm${list.id}`} className={`flex addItemForm itemButtons unset`} style={{width: `100%`, flexDirection: `row`}} onSubmit={(e) => createItem(e, list)}>
                      <input placeholder={`Name of Item`} type="text" name="createItem" required />
                      <button type={`submit`} title={`Create List`} className={`iconButton createList`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-plus"></i><span className={`iconButtonText textOverflow extended`}><span style={{fontSize: 12}}>Add Item</span><span className={`itemLength`} style={{fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content`}}>{list.items.length + 1}</span></span></button>
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