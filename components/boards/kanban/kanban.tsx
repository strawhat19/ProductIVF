import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

// Task Interface
interface Task {
  id: string;
  title: string;
  columnId: string;
}

// Column Interface
interface Column {
  id: string;
  title: string;
  position: number;
}

// Initial Columns
const initialColumns: Column[] = [
  { id: "todo", title: "To Do", position: 1 },
  { id: "inProgress", title: "In Progress", position: 2 },
  { id: "done", title: "Done", position: 3 },
];

// Initial Tasks
const initialTasks: Task[] = [
  { id: "1", title: "Task One", columnId: "todo" },
  { id: "2", title: "Task Two", columnId: "todo" },
  { id: "3", title: "Task Three", columnId: "inProgress" },
  { id: "4", title: "Task Four", columnId: "done" },
];

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === "column") {
      // Handle column reordering
      const newColumns = [...columns];
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);

      // Update positions
      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        position: index + 1,
      }));

      setColumns(updatedColumns);
    } else {
      // Handle task movement
      const taskId = result.draggableId;
      const newColumnId = destination.droppableId;

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, columnId: newColumnId } : task
        )
      );
    }
  };

  return (
    <div className="kanban-board">
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Droppable wrapper for columns */}
        <Droppable droppableId="columns" type="column" direction="horizontal">
          {(provided) => (
            <div className="kanban-columns" ref={provided.innerRef} {...provided.droppableProps}>
              {columns.map((column, index) => (
                <Draggable key={column.id} draggableId={column.id} index={index}>
                  {(provided) => (
                    <div
                      className="kanban-column"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <h3 {...provided.dragHandleProps}>{column.title}</h3>
                      
                      {/* Droppable Area for Tasks */}
                      <Droppable droppableId={column.id} type="task">
                        {(provided) => (
                          <div
                            className="kanban-task-list"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {tasks
                              .filter((task) => task.columnId === column.id)
                              .map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided) => (
                                    <div
                                      className="kanban-item"
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <p>{task.title}</p>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;