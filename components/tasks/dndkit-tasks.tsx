import React, { useState, useContext, useEffect } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import { capWords, dev, formatDate, generateUniqueID, StateContext } from '../../pages/_app';
import { addBoardScrollBars } from '../boards/board';
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

function reorder(list, oldIndex, newIndex) {
  // dnd-kit gives us "arrayMove" from '@dnd-kit/sortable' which does the splice logic
  return arrayMove(list, oldIndex, newIndex);
}

// A single "sortable" subtask item:
function SortableSubtaskItem({ subtask, index, changeLabel, completeSubtask, deleteSubtask }) {
  // Hook from dnd-kit. Ties this item to the sorting system
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  // The style to apply so the item moves with the pointer
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    // optional: visual feedback when dragging
    opacity: isDragging ? 0.8 : 1,
    // cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* Original markup you had for subtask */}
      <div className={`task_${subtask.id} subTaskItem ${subtask.complete ? 'complete' : 'activeTask'}`}>
        <div className="draggableItem item subtaskHandle">
          <span className="itemOrder taskComponentBG">
            <i className={`itemIndex ${subtask.complete ? 'completedIndex' : 'activeIndex'}`}>
              {index + 1}
            </i>
          </span>

          <div className={`subtaskActions flex row taskComponentBG ${subtask.complete ? 'complete' : 'activeTask'}`}>
            <span
              onBlur={(e) => changeLabel(e, subtask)}
              contentEditable
              suppressContentEditableWarning
              className={`changeLabel taskChangeLabel ${subtask.complete ? 'complete' : 'activeTask'}`}
            >
              {subtask.task}
            </span>

            {/* Timestamps */}
            {subtask.created && !subtask.updated ? (
              <span className="itemDate itemName itemCreated textOverflow extended flex row">
                <i className="status">Cre.</i>
                <span className="itemDateTime">
                  {formatDate(new Date(subtask.created))}
                </span>
              </span>
            ) : subtask.updated ? (
              <span className="itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                <i className="status">Upd.</i>
                <span className="itemDateTime">
                  {formatDate(new Date(subtask.updated))}
                </span>
              </span>
            ) : null}
          </div>

          <div className="itemButtons customButtons taskComponentBG">
            <button
              title="Delete Task"
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => deleteSubtask(e, subtask)}
              className="iconButton deleteButton wordIconButton"
            >
              <i className="fas fa-trash" style={{ color: 'var(--gameBlue)', fontSize: 9 }} />
            </button>
            <input
              className={`taskCheckbox ${subtask.complete ? 'complete' : 'activeTask'}`}
              onChange={(e) => completeSubtask(e, subtask)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              type="checkbox"
              defaultChecked={subtask.complete}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DndKitTasks(props) {
  const { item } = props;
  const { boards, setLoading, setSystemStatus } = useContext<any>(StateContext);

  // If item.subtasks exist, use them; otherwise empty
  const [subtasks, setSubtasks] = useState(item?.subtasks?.length ? item.subtasks : []);
  const [deletedTaskIDs, setDeletedTaskIDs] = useState<string[]>([]);

  // We’ll set up dnd-kit sensors. PointerSensor covers basic mouse/touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // optional: tweak activation constraints, e.g. require drag of 8px
      // activationConstraint: { distance: 8 },
    })
  );

  // Capitalize words
  const capitalizeAllWords = capWords;

  // Called when user edits label
  const changeLabel = (e, taskItem) => {
    let elemValue = e.target.textContent || '';
    const newValue = capitalizeAllWords(elemValue || taskItem.task);
    taskItem.task = newValue;
    taskItem.updated = formatDate(new Date());

    localStorage.setItem('boards', JSON.stringify(boards));
  };

  // Toggle complete
  const completeSubtask = (e, subtask) => {
    setLoading(true);
    setSystemStatus(`Marking Task as ${subtask.complete ? 'Reopened' : 'Complete'}.`);

    subtask.complete = !subtask.complete;
    subtask.updated = formatDate(new Date());
    item.updated = formatDate(new Date());

    localStorage.setItem('boards', JSON.stringify(boards));
    setTimeout(() => {
      setSystemStatus(`Marked Task as ${subtask.complete ? 'Complete' : 'Reopened'}.`);
      setLoading(false);
    }, 1000);
  };

  // Add subtask with rank insertion
  const addSubtask = (e) => {
    e.preventDefault();
    setLoading(true);
    setSystemStatus('Creating Task.');

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
      setSystemStatus('Created Task.');
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

  // Delete subtask
  const deleteSubtask = (e, subtask) => {
    setLoading(true);
    setSystemStatus('Deleting Task.');

    const subtaskIDToDelete = subtask.id;
    setDeletedTaskIDs((prev) => [...prev, subtaskIDToDelete]);

    const updatedTasks = subtasks.filter(
      (tsk) => tsk.id !== subtaskIDToDelete && !deletedTaskIDs.includes(tsk.id)
    );

    setSubtasks(updatedTasks);
    item.subtasks = updatedTasks;
    item.updated = formatDate(new Date());

    localStorage.setItem('boards', JSON.stringify(boards));
    addBoardScrollBars();

    setTimeout(() => {
      setSystemStatus('Deleted Task.');
      setLoading(false);
    }, 1000);
  };

  // dnd-kit onDragEnd
  const handleDragEnd = ({ active, over }) => {
    // If no valid drop target or same position, do nothing
    if (!over || active.id === over.id) return;

    // Find the indexes for the item being dragged and the target
    const oldIndex = subtasks.findIndex((tsk) => tsk.id === active.id);
    const newIndex = subtasks.findIndex((tsk) => tsk.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the array
    const updated = reorder(subtasks, oldIndex, newIndex);
    setSubtasks(updated);

    item.subtasks = updated;
    item.updated = formatDate(new Date());
    localStorage.setItem('boards', JSON.stringify(boards));
    dev() && console.log('Dragged and reordered:', updated);
    addBoardScrollBars();
  };

  // Sync outside changes
  useEffect(() => {
    if (item.subtasks && item.subtasks.length !== subtasks.length) {
      setSubtasks(item.subtasks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.subtasks]);

  return (
    <div id={`${item.id}_subTasks`} className={`rowSubtasks subTasks dndkitTasks`}>
      <div className={`subTaskElement flex ${subtasks.length > 0 ? 'hasTasks' : 'noTasks'}`}>
        {/* The scrollable container for tasks */}
        <div style={{ marginTop: -1 }} className="subTaskItems">
          {/* DndContext wraps the entire area that can be dragged */}
          <DndContext
            sensors={sensors}
            autoScroll={true}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
            // onDragOver={(e) => onDragover(e)}
            modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor, restrictToWindowEdges]}
          >
            {/* SortableContext defines which items we can reorder, and how */}
            <SortableContext
              items={subtasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {subtasks.map((subtask, index) => {
                if (deletedTaskIDs.includes(subtask.id)) return null;

                return (
                  <SortableSubtaskItem
                    index={index}
                    key={subtask.id}
                    subtask={subtask}
                    changeLabel={changeLabel}
                    deleteSubtask={(e) => deleteSubtask(e, subtask)}
                    completeSubtask={(e) => completeSubtask(e, subtask)}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>

        {/* Form to add a new subtask */}
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
            <i style={{ color: 'var(--gameBlue)', fontSize: 10 }} className="fas fa-plus" />
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