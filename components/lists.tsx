import { useContext } from 'react';
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
        setSystemStatus(`Created List ${newList.name}.`);
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
        setSystemStatus(`Created Item.`);
        setTimeout(() => setLoading(false), 1500);
        // setTimeout(() => setAnimComplete(true), 3500);
        return listItems.scrollTop = listItems.scrollHeight;
    }

    const deleteList = async (e: any, list: List) => {
        e.preventDefault();
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            setLoading(true);
            setSystemStatus(`Deleting List.`);
            let updatedLists = lists.filter((lis: List) => lis.id != list.id);
            localStorage.setItem(`lists`, JSON.stringify(updatedLists));
            await setLists(updatedLists);
            setSystemStatus(`Deleted List ${list.name}.`);
            setTimeout(() => setLoading(false), 1500);
        }
    }

    const deleteItem = async (e: any, item: Item, list: List) => {
        e.preventDefault();
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            setLoading(true);
            setSystemStatus(`Deleting Item.`);
            let updatedItems: Item[] = [...list.items.filter(itm => itm.id != item.id)];
            let updatedLists = lists.map((lis: List, index) => {
                if (lis.id == list.id) {
                    setSystemStatus(`Deleted Item ${item.content}.`);
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

    const setItemComplete = async (e: any, item: Item, list: List) => {
        let isButton = e.target.classList.contains(`iconButton`);
        if (!isButton) {
            setLoading(true);
            setSystemStatus(`Marking Item as Complete.`);
            list.items[list.items.indexOf(item)].complete = !list.items[list.items.indexOf(item)].complete;
            list.items[list.items.indexOf(item)].updated = formatDate(new Date());
            let filteredLists: List[] = lists.filter((lis: any) => lis.id != list.id);
            let updatedLists: List[] = [...filteredLists, list];
            localStorage.setItem(`lists`, JSON.stringify(updatedLists));
            await setLists(updatedLists);
            setTimeout(() => setLoading(false), 1500);
            setSystemStatus(`Marked Item as Complete.`);
        }
    }

    const showAlert = async (alertTitle: any, alertMessage?: any, additionalInfo?:any) => {
        if (alertOpen) return;
        setAlertOpen(true);
        let alertDialog = document.createElement(`div`);
        alertDialog.className = `alert`;
        if ((!alertMessage && !additionalInfo) || (additionalInfo && additionalInfo?.length == 0)) alertDialog.classList.add(`slim`);
        alertDialog.innerHTML = `<h3>${alertTitle}</h3>
        ${alertMessage ? additionalInfo ? `` : alertMessage : ``}
        `;
        if (additionalInfo?.length > 0) {
        additionalInfo?.forEach((info: any, index: any) => {
            let element: any = createXML(`<p>${index+1}. ${alertMessage} ${info}</p>`);
            alertDialog.append(element);
        });
        }
        document.body.appendChild(alertDialog);
        let closeButton = document.createElement(`button`);
        closeButton.classList.add(`iconButton`);
        closeButton.classList.add(`alertButton`);
        closeButton.innerHTML = `X`;
        closeButton.onclick = () => {
        document.body.removeChild(alertDialog);
        setAlertOpen(false);
        };
        alertDialog.appendChild(closeButton);
    }

    const onDragEnd = (result, list) => {
        setLoading(true);
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
              return {...list, items: updatedItemsWithDates, updated: formatDate(new Date())};
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

    return <>
    <div className="createList lists extended">
        <div id={props.id} className={`list items ${props.className}`}>
            <div className="items">
                <div className="addListFormItem">
                <h2 style={{fontWeight: 600, fontSize: 24, minWidth: `fit-content` }}>Create List {lists.length + 1}</h2>
                <section className={`addListFormItemSection`} style={{margin: 0}}>
                    <form title={`Add List`} id={`addListForm`} className={`flex addListForm itemButtons`} style={{width: `100%`, flexDirection: `row`}} onSubmit={(e) => createList(e, lists)}>
                        <input maxLength={15} placeholder={`Name of List`} type="text" name="createItem" required />
                        {/* <input style={{borderRadius: `4px !important;`}} className={`save submit`} type="submit" value={`Add List`} /> */}
                        <button type={`submit`} title={`Create List`} className={`iconButton createList`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-list"></i><span className={`iconButtonText textOverflow extended`}><span style={{fontSize: 12}}>Create List</span><span className={`itemLength`} style={{fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content`}}>{lists.length + 1}</span></span></button>
                    </form>
                </section>
                </div>
            </div>
        </div>
    </div>
    <section className={`lists ${lists.length == 1 ? `oneList` : `multiList`}`} id={`lists`}>
        {lists.map((list, index) => {
            return <DragDropContext onDragEnd={(e) => onDragEnd(e, list)}>
            <Droppable id={list.id} droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  id={list.id}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`list items ${props.className}`}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  <button style={{pointerEvents: `none`, position: `relative`}} id={`manage${list.id}Button`} title={`Manage ${list.name}`}  className={`flex row iconButton item listTitleButton`}>
                      <div className="itemOrder listOrder" style={{maxWidth: `fit-content`}}>
                          <i style={{color: `var(--gameBlue)`, fontSize: 18, padding: `0 15px`, maxWidth: `fit-content`}} className="fas fa-list"></i>
                      </div>
                      <h2 style={{position: `relative`}}><i className={`listName textOverflow extended`} style={{fontSize: 14, fontWeight: 500}}>{list.name}</i></h2>
                      <div className="itemButtons customButtons">
                          {/* <button title={`Edit List`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                          <button style={{pointerEvents: `all`}} onClick={(e) => deleteList(e, list)} title={`Delete List`} className={`iconButton deleteButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i><span className={`iconButtonText textOverflow extended`}>Delete {list.items.length > 0 && <><span className={`itemLength`} style={{fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content`}}>{list.items.length}</span>Item(s)</>}</span></button>
                      </div>
                  </button>
                  <div className="items">
                      {list.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                          <div
                            className={`item ${item.complete ? `complete` : ``}`}
                            onClick={(e) => setItemComplete(e, item, list)}
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
                              {item.created && !item.updated ? <span className="itemName itemDate itemCreated textOverflow extended">Created {formatDate(new Date(item.created))}</span> : item.updated ? <span className="itemName itemDate itemCreated itemUpdated textOverflow extended">Updated {formatDate(new Date(item.updated))}</span> : null}
                              <div className="itemButtons customButtons">
                                  {/* <button title={`Edit Item`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button> */}
                                  <button onClick={(e) => deleteItem(e, item, list)} title={`Delete Item`} className={`iconButton deleteButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i></button>
                              </div>
                          </div>
                          )}
                      </Draggable>
                      ))}
                  </div>
                  <form title={`Add Item`} id={`listForm${list.id}`} className={`flex addItemForm itemButtons unset`} style={{width: `100%`, flexDirection: `row`}} onSubmit={(e) => createItem(e, list)}>
                      <input maxLength={14} placeholder={`Name of Item`} type="text" name="createItem" required />
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