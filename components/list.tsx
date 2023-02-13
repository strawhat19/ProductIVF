import { createXML as createXMLElement, StateContext } from "../pages/_app";
import { useState, useContext } from "react";
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
      complete: boolean;
      [key: string]: any;
    }
    
    interface List {
      id: string;
      name: string;
      itemName: string;
      items: Item[];
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

// Reorder the list items
const reorder = (items, startIndex, endIndex, list, lists, setLists) => {
  const result = Array.from(items);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  let updatedLists = lists.map((lis: List) => {
    if (lis.id == list.id) {
        return {...list, items: result};
    } else {
        return lis;
    }
  });
  setLists(updatedLists);
  localStorage.setItem(`lists`, JSON.stringify(updatedLists));
  return result;
};

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

const List = (props) => {
  const { lists, setLists, alertOpen, setAlertOpen } = useContext<any>(StateContext);
  const [items, setItems] = useState((props.list.items as Item[]));

  const createItem = async (e: any, list: List) => {
    e.preventDefault();
    let listItems = e.target.previousSibling; 
    let formFields = e.target.children;
    let newItem: Item = {
      complete: false, 
      content: formFields[0].value, 
      id: `item-${list.items.length + 1}`, 
    };
    let updatedItems: Item[] = [...list.items, newItem];
    let newList: List = {...list, items: updatedItems};
    let filteredLists: List[] = lists.filter((lis: any) => lis.id != list.id);
    let updatedLists: List[] = [...filteredLists, newList].sort((a,b) => b.items.length - a.items.length);
    localStorage.setItem(`lists`, JSON.stringify(updatedLists));
    await setItems(updatedItems);
    await setLists(updatedLists);
    e.target.reset();
    return listItems.scrollTop = listItems.scrollHeight;
  }

  const deleteItem = async (e: any, item: Item, list: List) => {
    e.preventDefault();
    // await showAlert(`Are you sure you would like to delete this item?`, `Deleting this will remove it.`);
    let updatedItems: Item[] = [...list.items.filter(itm => itm.id != item.id)];
    let newList: List = {...list, items: updatedItems};
    let filteredLists: List[] = lists.filter((lis: any) => lis.id != list.id);
    let updatedLists: List[] = [...filteredLists, newList].sort((a,b) => b.items.length - a.items.length);
    localStorage.setItem(`lists`, JSON.stringify(updatedLists));
    await setItems(updatedItems);
    await setLists(updatedLists);
  }

  const setItemComplete = async (e: any, item: Item, list: List) => {
    list.items[list.items.indexOf(item)].complete = !list.items[list.items.indexOf(item)].complete;
    let filteredLists: List[] = lists.filter((lis: any) => lis.id != list.id);
    let updatedLists: List[] = [...filteredLists, list];
    localStorage.setItem(`lists`, JSON.stringify(updatedLists));
    await setLists(updatedLists);
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
        let element: any = createXMLElement(`<p>${index+1}. ${alertMessage} ${info}</p>`);
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

  const onDragEnd = result => {
    // if item dropped outside the list
    if (!result.destination) {
      return;
    }

    setItems(reorder(items, result.source.index, result.destination.index, props.list, lists, setLists) as any);
  };

  return (
    <>
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            id={props.id}
            ref={provided.innerRef}
            className={props.className}
            {...provided.droppableProps}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            <button id={`manageList#${props.list.id}Button`} title={`Manage ${props.list.name}`}  className={`flex row iconButton`} style={{position: `relative`}}>
                <i style={{color: `var(--gameBlue)`, fontSize: 18}} className="fas fa-list"></i>
                <h2 style={{position: `relative`}}><i className={`textOverflow extended`} style={{fontSize: 16, fontWeight: 500}}>{props.list.name}</i></h2>
                <span style={{fontSize: 18, fontWeight: 700, padding: `0 10px`, color: `var(--gameBlue)`}}>{props.list.items.length}</span>
            </button>
            <div className="items">
                {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                    <div
                        onClick={(e) => setItemComplete(e, item, props.list)}
                        className={`item ${item.complete ? `complete` : ``}`}
                        ref={provided.innerRef}
                        id={`item-${index + 1}`}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                        )}
                    >
                        <span className="itemOrder">
                            <i className="itemIndex">{index + 1}</i>
                        </span>
                        <span className="itemName textOverflow extended">{item.content}</span>
                        <div className="itemButtons customButtons">
                            <button title={`Edit Item`} className={`iconButton editButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-edit"></i></button>
                            <button onClick={(e) => deleteItem(e, item, props.list)} title={`Delete Item`} className={`iconButton deleteButton`}><i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i></button>
                        </div>
                    </div>
                    )}
                </Draggable>
                ))}
            </div>
            <form title={`Add Item`} id={`listForm${props.list.id}`} className={`flex`} style={{width: `100%`, flexDirection: `row`}} onSubmit={(e) => createItem(e, props.list)}>
                <input placeholder={`Add ${`Item` ?? props.list.itemName} ${props.list.items.length + 1}`} type="text" name="createItem" required />
                <input style={{width: `35%`}} className={`save`} type="submit" value={`Add ${`Item` ?? props.list.itemName}`} />
            </form>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
    </>
  );
};

export default List;
