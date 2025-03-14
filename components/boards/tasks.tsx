import { CSS } from '@dnd-kit/utilities';
import { addBoardScrollBars } from './board';
import { getIDParts } from '../../shared/ID';
import DetailField from './details/detail-field';
import React, { useContext, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { createTask, Task } from '../../shared/models/Task';
import { capWords, dev, StateContext } from '../../pages/_app';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { forceFieldBlurOnPressEnter, isValid, removeExtraSpacesFromString } from '../../shared/constants';
import { addTaskToDatabase, db, deleteTaskFromDatabase, tasksTable, updateDocFieldsWTimeStamp } from '../../firebase';
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

const reorder = (list, oldIndex, newIndex) => arrayMove(list, oldIndex, newIndex);

const SortableSubtaskItem = ({ item, task, isLast, index, gridSearchTerm, changeLabel, completeTask, deleteSubtask }) => {
  let { listeners, transform, attributes, setNodeRef, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transition,
    opacity: isDragging ? 1 : 1,
    zIndex: isDragging ? 1000 : 1,
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`boardTaskDraggableWrap`}>
      <div className={`task_${task?.id} boardTask subTaskItem ${item?.options?.complete ? `taskItemComplete` : `taskItemNotComplete`} ${!item?.options?.complete && (isValid(task?.options?.active) && task?.options?.active == true) ? `activeItemOrTask` : ``} ${(item?.options?.complete || task?.options?.complete) ? `complete` : `activeTask`} ${isLast ? `dndLast` : ``}`}>
        <div className={`boardTaskHandle ${gridSearchTerm == `` ? `cursorGrab` : `cursorAuto`} draggableItem item subtaskHandle ${(item?.options?.complete || task?.options?.complete) ? `complete` : `activeTask`}`}>
          <span className={`itemOrder taskComponentBG`}>
            <i className={`itemIndex ${(item?.options?.complete || task?.options?.complete) ? `completedIndex` : `activeIndex`}`}>
              {index + 1}
            </i>
          </span>

          <div className={`subtaskActions flex row taskComponentBG ${(item?.options?.complete || task?.options?.complete) ? `complete` : `activeTask`}`}>
            <span
              contentEditable
              spellCheck={false}
              suppressContentEditableWarning
              onBlur={(e) => changeLabel(e, task)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
              // onInput={(e) => setMaxLengthOnField(e, nameFields.task.max)}
              className={`changeLabel taskChangeLabel stretchEditable ${(item?.options?.complete || task?.options?.complete) ? `complete` : `activeTask`}`}
            >
              {task?.name}
            </span>
            <DetailField item={item} task={task} />
          </div>

          <div className={`taskOptions itemOptions itemButtons customButtons taskComponentBG taskButtons ${task?.options?.complete ? `taskComplete` : `taskActive`} ${item?.options?.complete ? `itemComplete` : `itemActive`} ${(item?.options?.complete || task?.options?.complete) ? `taskButtonsComplete` : `taskButtonsActive`}`}>
            <button
              title={`Delete Task`}
              onClick={(e) => deleteSubtask(e, task)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={`iconButton deleteButton deleteTaskButton wordIconButton`}
            >
              <i className={`fas fa-trash`} style={{ color: `var(--gameBlue)`, fontSize: 9 }} />
            </button>
            <input
              type={`checkbox`}
              data-checkbox={true}
              autoComplete={`off`}
              disabled={item?.options?.complete}
              onChange={(e) => completeTask(e, task)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              checked={item?.options?.complete || (task?.options?.complete || task?.options?.active)}
              className={`task_check_box taskCheckbox ${(item?.options?.complete || task?.options?.complete) ? `complete` : `activeTask`}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tasks(props) {
  let { item, column, showForm = true } = props;
  let { user, gridSearchTerm, selectedGrid, setLoading, setSystemStatus, setGlobalUserData } = useContext<any>(StateContext);

  let [tasks, setTasks] = useState(item?.tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // activationConstraint: { distance: 8 },
    })
  );

  const updateTaskInState = (task: Task, updates: Partial<Task>) => {
    item.tasks = item?.tasks?.map(tsk => tsk?.id == task?.id ? ({
      ...task,
      ...updates,
    }) : tsk);
    setTasks(prevTasks => prevTasks?.map(tsk => tsk?.id == task?.id ? ({
      ...task,
      ...updates,
    }) : tsk));
    setGlobalUserData(prevGlobalUserData => ({
      ...prevGlobalUserData,
      tasks: prevGlobalUserData?.tasks?.map(tsk => tsk?.id == task?.id ? ({
        ...task,
        ...updates,
      }) : tsk),
    }))
  }

  const changeLabel = (e, task: Task) => {
    let elemValue = e.target.textContent || ``;
    const newValue = capWords(elemValue || task.name);
    const cleanedValue = removeExtraSpacesFromString(newValue);
    
    e.target.innerHTML = cleanedValue;
    
    const name = cleanedValue;
    const updates = { name, A: name, title: `${task?.type} ${task?.rank} ${name}` };

    updateTaskInState(task, updates);
    updateDocFieldsWTimeStamp(task, updates);
  }

  const getTasksInCurrentSearchFilters = (tasks: Task[]) => {
    let tasksInCurrentSearchFilters = tasks;
    let hasSearchTerm = gridSearchTerm != ``;
    if (hasSearchTerm) {
      tasksInCurrentSearchFilters = tasks?.filter((tsk: Task) => tsk?.name?.toLowerCase()?.includes(gridSearchTerm?.toLowerCase()?.trim()));
    }
    return tasksInCurrentSearchFilters;
  }

  const completeTask = async (e, task) => {
    setLoading(true);

    const { date } = getIDParts();

    const taskComplete = task?.options?.complete == true;
    const taskActive = isValid(task?.options?.active) && task?.options?.active == true;

    setSystemStatus(`Marking Task as ${taskComplete ? `Reopened` : `Complete`}.`);

    updateTaskInState(task, {
      options: {
        ...task?.options,
        ...(taskActive ? {
          ...(taskComplete ? {
            active: false,
            complete: false,
          } : {
            active: false,
            complete: true,
          }),
        } : {
          ...(taskComplete ? {
            active: false,
            complete: false,
          } : {
            active: true,
            complete: false,
          })
        }),
      },
      meta: {
        ...task?.meta,
        updated: date,
      }
    })

    await updateDocFieldsWTimeStamp(task, { 
      ...(taskActive ? {
        ...(taskComplete ? {
          [`options.active`]: false,
          [`options.complete`]: false,
        } : {
          [`options.active`]: false,
          [`options.complete`]: true,
        }),
      } : {
        ...(taskComplete ? {
          [`options.active`]: false,
          [`options.complete`]: false,
        } : {
          [`options.active`]: true,
          [`options.complete`]: false,
        })
      }),
    });

    setTimeout(() => {
      setSystemStatus(`Marked Task #${task?.number} as ${!taskComplete ? `Complete` : `Reopened`}.`);
      setLoading(false);
    }, 1000);
  }

  const deleteTask = async (e, task) => {
    setLoading(true);
    setSystemStatus(`Deleting Task.`);

    setTasks(prevTasks => prevTasks?.filter(tsk => tsk?.id != task?.id));
    if (item?.data?.taskIDs?.length < 5) {
      await addBoardScrollBars();
    }
    await deleteTaskFromDatabase(task);

    setTimeout(() => {
      setSystemStatus(`Deleted Task ${task?.number}`);
      setLoading(false);
    }, 1000);
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const newIndex = tasks.findIndex((tsk) => tsk.id === over.id);
    const oldIndex = tasks.findIndex((tsk) => tsk.id === active.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    const updatedTasks = reorder(tasks, oldIndex, newIndex);
    setTasks(updatedTasks);

    const updatedTaskIDs = updatedTasks?.map((tsk: Task) => tsk?.id);
    await updateDocFieldsWTimeStamp(item, { [`data.taskIDs`]: updatedTaskIDs });
  }

  const addTask = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setSystemStatus(`Creating Task.`);

    const formFields = e.target.children;
    const taskName = formFields[0].value.trim();
    const name = capWords(taskName);

    let position = formFields.rank.value;
    const nextIndex = tasks.length + 1;
    if (!position) position = nextIndex;
    position = Math.min(parseInt(position, 10), nextIndex);

    if (column) {
      // const { rank, number } = await getRankAndNumber(Types.Task, globalUserData?.tasks, column?.data?.taskIDs, users, user);
      const tasksRef = await collection(db, tasksTable);
      const tasksSnapshot = await getDocs(tasksRef);
      const tasksCount = tasksSnapshot.size;
      const taskRank = tasksCount + 1;
      const newTask = createTask(taskRank, name, user, selectedGrid?.id, item?.boardID, column?.id, item?.id, taskRank) as Task;

      const prevTasks = [...tasks];
      const updatedTasks = Array.from(prevTasks);
      updatedTasks.splice(position - 1, 0, newTask);
      
      setTasks(updatedTasks);
      e.target.reset();

      const updatedTaskIDs = updatedTasks?.map(tsk => tsk?.id);
      if (updatedTaskIDs?.length > 5) addBoardScrollBars();

      await addTaskToDatabase(newTask, item?.id, column?.id, updatedTaskIDs);

      if (formFields && formFields?.length > 0) {
        formFields[0].focus();
      }
    }

    setTimeout(() => {
      setSystemStatus(`Created Task.`);
      setLoading(false);
    }, 1000);

    
    const tasksList = e.target.previousSibling;
    window.requestAnimationFrame(() => {
      if (position <= 5) {
        tasksList.scrollTop = 0;
      } else {
        tasksList.scrollTop = tasksList.scrollHeight;
      }
    });
  }

  return (
    <div id={`${item?.id}_subTasks`} className={`rowSubtasks subTasks dndkitTasks  ${showForm ? `showForm` : `hideForm`}`}>
      <div className={`subTaskElement flex ${getTasksInCurrentSearchFilters(tasks)?.length > 0 ? `hasTasks` : `noTasks`} ${showForm ? `hasForm` : `noForm`}`}>
        {/* The scrollable container for tasks */}
        <div style={{ marginTop: -1 }} className={`subTaskItems tasks_${getTasksInCurrentSearchFilters(tasks)?.length} taskItems ${item?.options?.complete ? `completedTasks` : `activeTasks`}`}>
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
              disabled={gridSearchTerm != ``}
              strategy={verticalListSortingStrategy}
              items={getTasksInCurrentSearchFilters(tasks)?.map((t) => t?.id)}
            >
              {getTasksInCurrentSearchFilters(tasks)?.map((task, index) => {
                let isLast = index == getTasksInCurrentSearchFilters(tasks)?.length - 1; 
                return (
                  <SortableSubtaskItem
                    task={task}
                    item={item}
                    index={index}
                    key={task.id}
                    isLast={isLast}
                    changeLabel={changeLabel}
                    gridSearchTerm={gridSearchTerm}
                    deleteSubtask={(e) => deleteTask(e, task)}
                    completeTask={(e) => completeTask(e, task)}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>

        {showForm && (
          <form onSubmit={addTask} className={`subtaskAddForm addForm flex row`}>
            <input
              required
              type={`text`}
              autoComplete={`off`}
              placeholder={`Create Task +`}
              className={`createTaskField`}
              id={`${item?.id}_createSubtask`}
              name={`createSubtask changeLabel`}
            />
            <input
              name={`rank`}
              type={`number`}
              autoComplete={`off`}
              defaultValue={tasks.length + 1}
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
  )
}