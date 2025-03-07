import { CSS } from '@dnd-kit/utilities';
import { StateContext } from '../../pages/_app';
import React, { useContext, useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

function DraggableItem({ id, name }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {name}
    </div>
  );
}

function DroppableContainer({ id, items }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef}>
      {items.map((item) => (
        <DraggableItem key={item.id} id={item.id} name={item.name} />
      ))}
    </div>
  );
}

export default function List() {
  let { user } = useContext<any>(StateContext);

  const [items, setItems] = useState([
    { id: `item-1`, name: `Item 1` },
    { id: `item-2`, name: `Item 2` },
    { id: `item-3`, name: `Item 3` },
  ]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const activeIndex = items.findIndex(item => item.id === active.id);
      const overIndex = items.findIndex(item => item.id === over.id);
  
      const newItems = [...items];
      const [movedItem] = newItems.splice(activeIndex, 1);
      newItems.splice(overIndex, 0, movedItem);
  
      setItems(newItems);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DroppableContainer id={`IVF_dnd-kit_droppable_${user != null ? user?.id : `gridItems`}`} items={items} />
    </DndContext>
  );
}