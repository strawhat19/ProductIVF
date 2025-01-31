import { CSS } from '@dnd-kit/utilities';
import { addBoardScrollBars } from './board';
import React, { useState, useContext, useEffect } from 'react';
import { capWords, dev, formatDate, generateUniqueID, StateContext } from '../../pages/_app';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { forceFieldBlurOnPressEnter, nameFields, removeExtraSpacesFromString, setMaxLengthOnField } from '../../shared/constants';

function reorder(list, oldIndex, newIndex) {
  return arrayMove(list, oldIndex, newIndex);
}

function SortableSubtaskItem({ item, subtask, isLast, column, index, changeLabel, completeSubtask, deleteSubtask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  const style = {
    transition,
    opacity: isDragging ? 0.8 : 1,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`boardTaskDraggableWrap`}>
      <div className={`task_${subtask.id} boardTask subTaskItem ${(item?.complete || subtask?.complete) ? 'complete' : 'activeTask'} ${isLast ? `dndLast` : ``}`}>
        <div className={`boardTaskHandle cursorGrab draggableItem item subtaskHandle ${(item?.complete || subtask?.complete) ? 'complete' : 'activeTask'}`}>
          <span className={`itemOrder taskComponentBG`}>
            <i className={`itemIndex ${(item?.complete || subtask?.complete) ? 'completedIndex' : 'activeIndex'}`}>
              {index + 1}
            </i>
          </span>

          <div className={`subtaskActions flex row taskComponentBG ${(item?.complete || subtask?.complete) ? 'complete' : 'activeTask'}`}>

            <span
              contentEditable
              spellCheck={false}
              suppressContentEditableWarning
              onBlur={(e) => changeLabel(e, subtask)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
              onInput={(e) => setMaxLengthOnField(e, nameFields.task.max)}
              className={`changeLabel taskChangeLabel stretchEditable ${(item?.complete || subtask?.complete) ? 'complete' : 'activeTask'}`}
            >
              {subtask.task}
            </span>

            {column?.details && column?.details == true ? (
              subtask.created && !subtask.updated ? (
                <span className={`itemDate ${(item?.complete || subtask?.complete) ? `taskCompleteDate` : `taskActiveDate`} itemName itemCreated textOverflow extended flex row`}>
                  <i className={`status`}>
                    Cre.
                  </i>
                  <span className={`itemDateTime`}>
                    {formatDate(new Date(subtask.created))}
                  </span>
                </span>
              ) : subtask.updated ? (
                <span className={`itemDate ${(item?.complete || subtask?.complete) ? `taskCompleteDate` : `taskActiveDate`} itemName itemCreated itemUpdated textOverflow extended flex row`}>
                  <i className={`status`}>
                    Upd.
                  </i>
                  <span className={`itemDateTime`}>
                    {formatDate(new Date(subtask.updated))}
                  </span>
                </span>
              ) : null
            ) : <></>}

          </div>

          <div className="itemButtons customButtons taskComponentBG taskButtons">
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
              type="checkbox"
              autoComplete="off"
              data-checkbox="true"
              disabled={item?.complete}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => completeSubtask(e, subtask)}
              checked={item?.complete || subtask?.complete}
              // defaultChecked={item?.complete || subtask?.complete}
              className={`task_check_box taskCheckbox ${(item?.complete || subtask?.complete) ? 'complete' : 'activeTask'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tasks(props) {
  const { item, column } = props;
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
    let elemValue = e.target.textContent || ``;
    const newValue = capitalizeAllWords(elemValue || taskItem.task);
    const cleanedValue = removeExtraSpacesFromString(newValue);
    
    e.target.innerHTML = cleanedValue;
    taskItem.task = cleanedValue;
    taskItem.updated = formatDate(new Date());

    localStorage.setItem(`boards`, JSON.stringify(boards));
  };

  // Toggle complete
  const completeSubtask = (e, subtask) => {
    setLoading(true);
    setSystemStatus(`Marking Task as ${subtask?.complete ? 'Reopened' : 'Complete'}.`);

    subtask.complete = !subtask?.complete;
    subtask.updated = formatDate(new Date());
    item.updated = formatDate(new Date());

    localStorage.setItem('boards', JSON.stringify(boards));
    setTimeout(() => {
      setSystemStatus(`Marked Task as ${subtask?.complete ? 'Complete' : 'Reopened'}.`);
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

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = subtasks.findIndex((tsk) => tsk.id === active.id);
    const newIndex = subtasks.findIndex((tsk) => tsk.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const updated = reorder(subtasks, oldIndex, newIndex);
    setSubtasks(updated);

    item.subtasks = updated;
    item.updated = formatDate(new Date());
    localStorage.setItem('boards', JSON.stringify(boards));
    dev() && console.log('Dragged and reordered:', updated);
    addBoardScrollBars();
  };

  useEffect(() => {
    if (item.subtasks && item.subtasks.length !== subtasks.length) {
      setSubtasks(item.subtasks);
    }
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
                let isLast = index == subtasks.length - 1; 

                return (
                  <SortableSubtaskItem
                    item={item}
                    index={index}
                    isLast={isLast}
                    column={column}
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