import { CSS } from '@dnd-kit/utilities';
import React, { useState, useContext, useEffect } from 'react';
import { capWords, formatDate, StateContext } from '../../pages/_app';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { forceFieldBlurOnPressEnter, getRankAndNumber, nameFields, removeExtraSpacesFromString, setMaxLengthOnField } from '../../shared/constants';
import { Types } from '../../shared/types/types';
import { createTask, Task } from '../../shared/models/Task';
import { addBoardScrollBars } from './board';
import { addTaskToDatabase } from '../../firebase';

const reorder = (list, oldIndex, newIndex) => arrayMove(list, oldIndex, newIndex);

const SortableSubtaskItem = ({ item, subtask, isLast, column, index, changeLabel, completeSubtask, deleteSubtask }) => {
  let { listeners, transform, attributes, setNodeRef, transition, isDragging } = useSortable({ id: subtask.id });

  const style = {
    transition,
    opacity: isDragging ? 1 : 1,
    zIndex: isDragging ? 1000 : 1,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`boardTaskDraggableWrap`}>
      <div className={`task_${subtask?.id} boardTask subTaskItem ${(item?.options?.complete || subtask?.options?.complete) ? `complete` : `activeTask`} ${isLast ? `dndLast` : ``}`}>
        <div className={`boardTaskHandle cursorGrab draggableItem item subtaskHandle ${(item?.options?.complete || subtask?.options?.complete) ? `complete` : `activeTask`}`}>
          <span className={`itemOrder taskComponentBG`}>
            <i className={`itemIndex ${(item?.options?.complete || subtask?.options?.complete) ? `completedIndex` : `activeIndex`}`}>
              {index + 1}
            </i>
          </span>

          <div className={`subtaskActions flex row taskComponentBG ${(item?.options?.complete || subtask?.options?.complete) ? `complete` : `activeTask`}`}>
            <span
              contentEditable
              spellCheck={false}
              suppressContentEditableWarning
              onBlur={(e) => changeLabel(e, subtask)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
              onInput={(e) => setMaxLengthOnField(e, nameFields.task.max)}
              className={`changeLabel taskChangeLabel stretchEditable ${(item?.options?.complete || subtask?.options?.complete) ? `complete` : `activeTask`}`}
            >
              {subtask.name}
            </span>

            {column?.options?.details && column?.options?.details == true ? (
              subtask?.meta?.created && !subtask?.meta?.updated ? (
                <span className={`itemDate ${(item?.options?.complete || subtask?.options?.complete) ? `taskCompleteDate` : `taskActiveDate`} itemName itemCreated textOverflow extended flex row taskDate`}>
                  <i className={`status`}>
                    Cre.
                  </i>
                  <span className={`itemDateTime`}>
                    {subtask?.meta?.created}
                  </span>
                </span>
              ) : subtask?.meta?.updated ? (
                <span className={`itemDate ${(item?.options?.complete || subtask?.options?.complete) ? `taskCompleteDate` : `taskActiveDate`} itemName itemCreated itemUpdated textOverflow extended flex row taskDate`}>
                  <i className={`status`}>
                    Upd.
                  </i>
                  <span className={`itemDateTime`}>
                    {subtask?.meta?.updated}
                  </span>
                </span>
              ) : null
            ) : <></>}
          </div>

          <div className={`taskOptions itemOptions itemButtons customButtons taskComponentBG taskButtons ${subtask?.options?.complete ? `taskComplete` : `taskActive`} ${item?.options?.complete ? `itemComplete` : `itemActive`} ${(item?.options?.complete || subtask?.options?.complete) ? `taskButtonsComplete` : `taskButtonsActive`}`}>
            <button
              title={`Delete Task`}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => deleteSubtask(e, subtask)}
              className={`iconButton deleteButton deleteTaskButton wordIconButton`}
            >
              <i className={`fas fa-trash`} style={{ color: `var(--gameBlue)`, fontSize: 9 }} />
            </button>
            <input
              type={`checkbox`}
              data-checkbox={true}
              autoComplete={`off`}
              disabled={item?.complete}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => completeSubtask(e, subtask)}
              checked={item?.options?.complete || subtask?.options?.complete}
              className={`task_check_box taskCheckbox ${(item?.options?.complete || subtask?.options?.complete) ? `complete` : `activeTask`}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tasks(props) {
  let { item, column, tasks, showForm = true } = props;
  let { user, users, selectedGrid, globalUserData, setLoading, setSystemStatus } = useContext<any>(StateContext);

  let [deletedTaskIDs, setDeletedTaskIDs] = useState<string[]>([]);
  let [subtasks, setSubtasks] = useState(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // activationConstraint: { distance: 8 },
    })
  );

  const capitalizeAllWords = capWords;

  // Called when user edits label
  const changeLabel = (e, taskItem) => {
    let elemValue = e.target.textContent || ``;
    const newValue = capitalizeAllWords(elemValue || taskItem.task);
    const cleanedValue = removeExtraSpacesFromString(newValue);
    
    e.target.innerHTML = cleanedValue;
    taskItem.task = cleanedValue;
    taskItem.updated = formatDate(new Date());

    // updateBoards(user);
  };

  // Toggle complete
  const completeSubtask = (e, subtask) => {
    setLoading(true);
    setSystemStatus(`Marking Task as ${subtask?.options?.complete ? `Reopened` : `Complete`}.`);

    subtask.options.complete = !subtask?.options?.complete;
    subtask.meta.updated = formatDate(new Date());
    item.meta.updated = formatDate(new Date());

    // updateBoards(user);

    setTimeout(() => {
      setSystemStatus(`Marked Task as ${subtask?.options?.complete ? `Complete` : `Reopened`}.`);
      setLoading(false);
    }, 1000);
  };

  // Add subtask with rank insertion
  const addSubtask = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setSystemStatus(`Creating Task.`);

    const formFields = e.target.children;
    const taskName = formFields[0].value.trim();
    const name = capWords(taskName);

    let position = formFields.rank.value;
    const nextIndex = subtasks.length + 1;
    if (!position) position = nextIndex;
    position = Math.min(parseInt(position, 10), nextIndex);

    if (column) {
      const { rank, number } = await getRankAndNumber(Types.Task, globalUserData?.tasks, column?.data?.taskIDs, users, user);
      const newTask = createTask(number, name, user, selectedGrid?.id, item?.boardID, column?.id, item?.id, rank) as Task;

      const prevTskIDs = [...item?.data?.taskIDs];
      const newTskIDs = Array.from(prevTskIDs);
      newTskIDs.splice(position - 1, 0, newTask?.id);

      if (newTskIDs?.length > 5) addBoardScrollBars();

      await addTaskToDatabase(newTask, item?.id, column?.id, newTskIDs);

      e.target.reset();
      if (formFields && formFields?.length > 0) {
        formFields[0].focus();
      }
    }

    setTimeout(() => {
      setSystemStatus(`Created Task.`);
      setLoading(false);
    }, 1000);

    // Scroll new subtask into view
    const subtasksList = e.target.previousSibling;
    window.requestAnimationFrame(() => {
      if (position <= 5) {
        subtasksList.scrollTop = 0;
      } else {
        subtasksList.scrollTop = subtasksList.scrollHeight;
      }
    });
  };

  useEffect(() => {
    setSubtasks(item?.tasks);
  }, [item])

  // Delete subtask
  const deleteSubtask = (e, subtask) => {
    setLoading(true);
    setSystemStatus(`Deleting Task.`);

    const subtaskIDToDelete = subtask.id;
    setDeletedTaskIDs((prev) => [...prev, subtaskIDToDelete]);

    const updatedTasks = subtasks.filter(
      (tsk) => tsk.id !== subtaskIDToDelete && !deletedTaskIDs.includes(tsk.id)
    );

    setSubtasks(updatedTasks);
    item.subtasks = updatedTasks;
    item.updated = formatDate(new Date());

    // updateBoards(user, true);

    setTimeout(() => {
      setSystemStatus('Deleted Task.');
      setLoading(false);
    }, 1000);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const newIndex = subtasks.findIndex((tsk) => tsk.id === over.id);
    const oldIndex = subtasks.findIndex((tsk) => tsk.id === active.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const now = formatDate(new Date());
    const tasks = subtasks.map(tsk => tsk.id == over.id || tsk.id == active.id ? ({ ...tsk, updated: now }) : tsk);

    let updated = reorder(tasks, oldIndex, newIndex);
    setSubtasks(updated);

    item.updated = now;
    item.subtasks = updated;

    // updateBoards(user, true);

    // dev() && console.log(`Dragged & Reordered`, updated);
  };

  return (
    <div id={`${item?.id}_subTasks`} className={`rowSubtasks subTasks dndkitTasks  ${showForm ? `showForm` : `hideForm`}`}>
      <div className={`subTaskElement flex ${subtasks.length > 0 ? `hasTasks` : `noTasks`} ${showForm ? `hasForm` : `noForm`}`}>
        {/* The scrollable container for tasks */}
        <div style={{ marginTop: -1 }} className={`subTaskItems taskItems ${item?.options?.complete ? `completedTasks` : `activeTasks`}`}>
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
              items={subtasks.map((t) => t?.id)}
              strategy={verticalListSortingStrategy}
            >
              {subtasks.map((subtask, index) => {
                if (deletedTaskIDs.includes(subtask?.id)) return null;
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

        {(
          <form onSubmit={addSubtask} className={`subtaskAddForm addForm flex row`}>
            <input
              required
              type={`text`}
              autoComplete={`off`}
              placeholder={`Create Task +`}
              id={`${item?.id}_createSubtask`}
              name={`createSubtask changeLabel`}
            />
            <input
              name={`rank`}
              type={`number`}
              autoComplete={`off`}
              defaultValue={subtasks.length + 1}
              className={`rankField taskRankField`}
              id={`${item?.id}_createSubtask_rank`}
            />
            <button
              type={`submit`}
              title={`Add Task`}
              className={`iconButton createList wordIconButton createTaskButton`}
            >
              <i style={{ color: `var(--gameBlue)`, fontSize: 10 }} className={`fas fa-plus`} />
              <span className={`iconButtonText textOverflow extended`}>
                <span>Add</span>
                <span
                  className={`itemLength index`}
                  style={{ padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}
                />
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}