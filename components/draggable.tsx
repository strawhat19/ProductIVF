import { DragDropContext, Droppable } from "react-beautiful-dnd";

export const Draggable = () => {

    const onDragEnd = (dragEndResults) => {
        console.log(dragEndResults);
    };

    return <DragDropContext onDragEnd={(e) => onDragEnd(e)}>
        hello
    </DragDropContext>
}