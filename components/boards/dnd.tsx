import { addBoardScrollBars } from './board';
import React, { useState, useContext, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { capWords, dev, formatDate, generateUniqueID, StateContext } from '../../pages/_app';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default function Dnd(props) {
  const { item } = props;
  const { boards, setLoading, setSystemStatus } = useContext<any>(StateContext);

  const startingSubTasks = item?.subtasks && item?.subtasks.length > 0 ? item?.subtasks : [];

  const [subtasks, setSubtasks] = useState(startingSubTasks);
  const [deletedTaskIDs, setDeletedTaskIDs] = useState<string[]>([]);

  // --- Logic copied/adapted from your original SwapyTasks ---

  // Capitalize words
  const capitalizeAllWords = capWords;

  // Called when user edits the text label
  const changeLabel = (e, taskItem) => {
    let elemValue = e.target.textContent || '';
    const newValue = capitalizeAllWords(elemValue || taskItem.task);
    taskItem.task = newValue;
    taskItem.updated = formatDate(new Date());

    localStorage.setItem('boards', JSON.stringify(boards));
  };

  // Mark a subtask as complete or reopened
  const completeSubtask = (e, subtask) => {
    setLoading(true);
    setSystemStatus(`Marking Task as ${subtask?.complete ? `Reopened` : `Complete`}.`);

    subtask.complete = !subtask.complete;
    subtask.updated = formatDate(new Date());
    item.updated = formatDate(new Date());

    localStorage.setItem('boards', JSON.stringify(boards));
    setTimeout(() => {
      setSystemStatus(`Marked Task as ${subtask?.complete ? `Complete` : `Reopened`}.`);
      setLoading(false);
    }, 1000);
  };

  // Add a new subtask (with rank insertion)
  const addSubtask = (e) => {
    e.preventDefault();
    setLoading(true);
    setSystemStatus(`Creating Task.`);

    const formFields = e.target.children;
    const newTaskText = formFields[0].value.trim();
    let rank = formFields.rank.value;

    const nextIndex = subtasks.length + 1;
    if (!rank) rank = nextIndex;
    rank = Math.min(parseInt(rank, 10), nextIndex);

    const subtaskID = `subtask_${nextIndex}_${generateUniqueID()}`;
    const newSubtask = {
      id: subtaskID,
      complete: false,
      task: capitalizeAllWords(newTaskText),
      created: formatDate(new Date()),
    };

    // Insert new subtask at "rank - 1"
    const updatedTasks = [
      ...subtasks.slice(0, rank - 1),
      newSubtask,
      ...subtasks.slice(rank - 1),
    ];

    setSubtasks(updatedTasks);
    item.subtasks = updatedTasks;
    item.updated = formatDate(new Date());

    localStorage.setItem('boards', JSON.stringify(boards));
    addBoardScrollBars();

    // Reset form
    e.target.reset();
    formFields[0].focus();

    setTimeout(() => {
      setSystemStatus(`Created Task.`);
      setLoading(false);
    }, 1000);

    // Scroll new subtask into view
    const subtasksList = e.target.previousSibling;
    window.requestAnimationFrame(() => {
      if (rank <= 5) {
        subtasksList.scrollTop = 0;
      } else {
        subtasksList.scrollTop = subtasksList.scrollHeight;
      }
    });
  };

  // Delete a subtask
  const deleteSubtask = (e, subtask) => {
    setLoading(true);
    setSystemStatus(`Deleting Task.`);

    const subtaskIDToDelete = subtask.id;
    setDeletedTaskIDs((prev) => [...prev, subtaskIDToDelete]);

    // Filter out the subtask to delete
    const updatedTasks = subtasks.filter(
      (tsk) => tsk.id !== subtaskIDToDelete && !deletedTaskIDs.includes(tsk.id)
    );

    setSubtasks(updatedTasks);
    item.subtasks = updatedTasks;
    item.updated = formatDate(new Date());

    localStorage.setItem('boards', JSON.stringify(boards));
    addBoardScrollBars();

    setTimeout(() => {
      setSystemStatus(`Deleted Task.`);
      setLoading(false);
    }, 1000);
  };

  // --- DnD: reorder tasks on drag end ---
  const handleOnDragEnd = (result) => {
    if (!result.destination) return; // dropped outside the list

    const newSubtasks = reorder(
      subtasks,
      result.source.index,
      result.destination.index
    );

    setSubtasks(newSubtasks);
    item.subtasks = newSubtasks; // Keep the parent data in sync
    item.updated = formatDate(new Date());

    localStorage.setItem('boards', JSON.stringify(boards));
    dev() && console.log('Dragged and reordered:', newSubtasks);
    addBoardScrollBars();
  };

//   const getItemStyle = (isDragging) => ({
//     userSelect: 'none',
//     // marginBottom: 8,
//     // background: isDragging ? 'lightgreen' : 'white',
//     // etc.
//   });

  // Whenever item.subtasks changes outside, sync local state (if needed).
  // This ensures we pick up changes if the parent modifies `item.subtasks` directly:
  useEffect(() => {
    if (item.subtasks && item.subtasks.length !== subtasks.length) {
      setSubtasks(item.subtasks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.subtasks]);

  return (
    <div id={`${item.id}_subTasks`} className="rowSubtasks subTasks">
      <div className={`subTaskElement flex ${subtasks.length > 0 ? 'hasTasks' : 'noTasks'}`}>
        
        {/* -- The scrollable container for tasks -- */}
        <div style={{ marginTop: -1 }} className="subTaskItems">
          {/* react-beautiful-dnd context */}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId={`${item.id}_droppableSubtasks`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="droppableSubtasksArea"
                >
                  {subtasks.map((subtask, taskIndex) => {
                    // If it's in deletedTaskIDs, skip rendering
                    if (deletedTaskIDs.includes(subtask.id)) return null;

                    return (
                      <Draggable
                        key={subtask.id}
                        draggableId={subtask.id}
                        index={taskIndex}
                      >
                        {(providedDraggable, snapshot) => {
                            const draggableStyle = {
                                ...providedDraggable.draggableProps.style,
                                // optional custom overrides
                            };
                            return (
                                <div
                                    style={draggableStyle}
                                    ref={providedDraggable.innerRef}
                                    {...providedDraggable.draggableProps}
                                    {...providedDraggable.dragHandleProps}
                                >
                                    <div className={`task_${subtask.id} subTaskItem ${subtask.complete ? 'complete' : 'activeTask'}`}>
                                        <div className="draggableItem item subtaskHandle">
                                            {/* Order/Index */}
                                            <span className="itemOrder taskComponentBG">
                                                <i
                                                className={`itemIndex ${
                                                    subtask.complete ? 'completedIndex' : 'activeIndex'
                                                }`}
                                                >
                                                {taskIndex + 1}
                                                </i>
                                            </span>

                                            {/* Subtask text / label */}
                                            <div
                                                className={`subtaskActions flex row taskComponentBG ${
                                                subtask.complete ? 'complete' : 'activeTask'
                                                }`}
                                            >
                                                <span
                                                onBlur={(e) => changeLabel(e, subtask)}
                                                contentEditable
                                                suppressContentEditableWarning
                                                className={`changeLabel taskChangeLabel ${
                                                    subtask.complete ? 'complete' : 'activeTask'
                                                }`}
                                                >
                                                {subtask.task}
                                                </span>

                                                {/* Creation/Update timestamps */}
                                                {subtask?.created && !subtask?.updated ? (
                                                <span className="itemDate itemName itemCreated textOverflow extended flex row">
                                                    <i className="status">Cre.</i>
                                                    <span className="itemDateTime">
                                                    {formatDate(new Date(subtask.created))}
                                                    </span>
                                                </span>
                                                ) : subtask?.updated ? (
                                                <span className="itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                                                    <i className="status">Upd.</i>
                                                    <span className="itemDateTime">
                                                    {formatDate(new Date(subtask.updated))}
                                                    </span>
                                                </span>
                                                ) : null}
                                            </div>

                                            {/* Buttons: Delete + Complete */}
                                            <div className="itemButtons customButtons taskComponentBG">
                                                <button
                                                title="Delete Task"
                                                onClick={(e) => deleteSubtask(e, subtask)}
                                                className="iconButton deleteButton wordIconButton"
                                                >
                                                <i
                                                    className="fas fa-trash"
                                                    style={{ color: 'var(--gameBlue)', fontSize: 9 }}
                                                />
                                                </button>
                                                <input
                                                className={`taskCheckbox ${
                                                    subtask.complete ? 'complete' : 'activeTask'
                                                }`}
                                                onChange={(e) => completeSubtask(e, subtask)}
                                                type="checkbox"
                                                defaultChecked={subtask.complete}
                                                autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }}
                      </Draggable>
                    );
                  })}
                  <div style={{ position: `relative`, top: -350 }}>
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* -- Form to add a new subtask -- */}
        <form onSubmit={addSubtask} className="subtaskAddForm addForm flex row">
          <input
            type="text"
            id={`${item.id}_createSubtask`}
            name="createSubtask changeLabel"
            placeholder="Create Subtask +"
            autoComplete="off"
            required
          />
          <input
            type="number"
            id={`${item.id}_createSubtask_rank`}
            name="rank"
            autoComplete="off"
            defaultValue={subtasks.length + 1}
          />
          <button
            type="submit"
            title="Add Task"
            className="iconButton createList wordIconButton"
          >
            <i
              style={{ color: 'var(--gameBlue)', fontSize: 10 }}
              className="fas fa-plus"
            />
            <span className="iconButtonText textOverflow extended">
              <span>Add</span>
              <span
                className="itemLength index"
                style={{ padding: '0 5px', color: 'var(--gameBlue)', maxWidth: 'fit-content' }}
              />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}