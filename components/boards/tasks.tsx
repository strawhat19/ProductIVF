import Tags from './details/tags';
import { CSS } from '@dnd-kit/utilities';
import { addBoardScrollBars } from './board';
import { getIDParts } from '../../shared/ID';
import { Types } from '../../shared/types/types';
import DetailField from './details/detail-field';
import { collection, getDocs } from 'firebase/firestore';
import { capWords, StateContext } from '../../pages/_app';
import { createTask, Task } from '../../shared/models/Task';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { addTaskToDatabase, db, deleteTaskFromDatabase, tasksTable, updateDocFieldsWTimeStamp } from '../../firebase';
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { forceFieldBlurOnPressEnter, getRankAndNumber, isValid, removeExtraSpacesFromString } from '../../shared/constants';

const reorder = (list, oldIndex, newIndex) => arrayMove(list, oldIndex, newIndex);

const SortableSubtaskItem = ({ selected, item, task: taskProp, isLast, index, gridSearchTerm, changeLabel, completeTask, deleteSubtask, searchFilterTasks }) => {
  let { globalUserData } = useContext<any>(StateContext);
  let { listeners, transform, attributes, setNodeRef, transition, isDragging } = useSortable({ id: taskProp?.id });

  let [task, setTask] = useState<Task>(taskProp);

  useEffect(() => {
    let thisTask = globalUserData?.tasks?.find(tsk => tsk?.id == task?.id);
    if (thisTask) setTask(thisTask);
  }, [globalUserData])

  const style = {
    transition,
    opacity: isDragging ? 1 : 1,
    zIndex: isDragging ? 1000 : 1,
    transform: CSS.Translate.toString(transform),
  }

  // const getHighlightedText = (text: string, highlight: string) => {
  //   if (!highlight) return text;
  //   const regex = new RegExp(`(${highlight})`, `gi`);
  //   const parts = text.split(regex);
  //   return parts.map((part, i) =>
  //     part.toLowerCase() === highlight.toLowerCase() ? (
  //       <span key={i} className={`highlightSearchMatch fit`}>
  //         {part}
  //       </span>
  //     ) : (
  //       part
  //     )
  //   );
  // }

  return (
    <div ref={setNodeRef} title={task?.name} style={style} {...attributes} {...listeners} className={`draggableTask boardTaskDraggableWrap ${isLast ? `dndLastTask` : index == 0 ? `dndFirstTask` : `dndMiddleTask`}`}>
      <div className={`task_${task?.id} boardTask taskMainWrap subTaskItem ${item?.options?.complete ? `taskItemComplete` : `taskItemNotComplete`} ${!item?.options?.complete && (isValid(task?.options?.active) && task?.options?.active == true) ? `activeItemOrTask` : ``} ${(item?.options?.complete || task?.options?.complete) ? `complete` : `activeTask`} ${isLast ? `dndLast` : index == 0 ? `dndFirst` : `dndMiddle`}`}>
        <div className={`boardTaskHandle ${searchFilterTasks && gridSearchTerm != `` ? `cursorAuto` : `cursorGrab`} draggableItem item subtaskHandle ${(item?.options?.complete || task?.options?.complete) ? `complete` : `activeTask`}`}>
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
              {/* {getHighlightedText(task?.name || ``, gridSearchTerm)} */}
            </span>
            <div className={`taskDetailsEnd itemContents fit`}>
              <Tags item={task} />
              <DetailField item={item} task={task} />
            </div>
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
              name={`task_status`}
              data-checkbox={true}
              autoComplete={`off`}
              disabled={item?.options?.complete}
              onChange={(e) => completeTask(e, task)}
              id={`task_${task?.id}_status_checkbox`}
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
  let { item, column, showForm = true, tasksProp = undefined } = props;

  let { 
    user,
    users,
    selected,
    setLoading,
    selectedGrid,
    gridSearchTerm,
    globalUserData,
    setSystemStatus,
    setGlobalUserData,
    searchFilterTasks, 
  } = useContext<any>(StateContext);

  let [tasks, setTasks] = useState(item?.tasks);
  let createTaskFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showForm && createTaskFieldRef.current) {
      createTaskFieldRef.current.focus();
    }
  }, [showForm]);  

  useEffect(() => {
    let thisItem = globalUserData?.items?.find(itm => itm?.id == item?.id);
    if (thisItem) {
      let updatedTasks = [];
      let thisItemTaskIDs = thisItem?.data?.taskIDs;
      thisItemTaskIDs.forEach(tskID => {
        let thisTask = thisItem?.tasks?.find(tsk => tsk?.id == tskID);
        if (thisTask) updatedTasks.push(thisTask);
      })
      setTasks(updatedTasks);
    }
  }, [globalUserData])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // activationConstraint: { distance: 8 },
    })
  );

  const updateTaskInState = (task: Task, updates: Partial<Task>) => {
    const getUpdatedTasks = (taskArray: Task[]) => taskArray?.map(tsk => tsk?.id == task?.id ? ({ ...task, ...updates }) : tsk);
    item.tasks = getUpdatedTasks(item.tasks);
    setTasks(prevTasks => getUpdatedTasks(prevTasks));
    setGlobalUserData(prevGlobalUserData => ({
      ...prevGlobalUserData,
      tasks: getUpdatedTasks(prevGlobalUserData?.tasks),
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
    // let tasksInCurrentSearchFilters = item?.data?.taskIDs?.map(tskID => tasks?.find((tsk: Task) => tsk?.id == tskID));
    let hasSearchTerm = gridSearchTerm != ``;
    if (searchFilterTasks && hasSearchTerm) {
      tasksInCurrentSearchFilters = tasks?.filter((tsk: Task) => tsk?.name?.toLowerCase()?.includes(gridSearchTerm?.toLowerCase()?.trim()));
    }
    if (tasksProp != undefined) {
      return tasksProp;
    } else {
      return tasksInCurrentSearchFilters;
    }
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

  const formSubmitOnEnter = (e) => {
    const queryFields = [e?.key, e?.keyCode];
    const submitKeys = [13, `Enter`, `Return`];
    const shouldSubmitOnEnter = queryFields?.some(fld => submitKeys?.includes(fld));
    if (shouldSubmitOnEnter) {
      addTask(e);
    }
  }

  const addTask = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setSystemStatus(`Creating Task.`);

    let default_TaskFormSelector = `.taskAddForm_${item?.uuid}`;
    let taskFormSelector = default_TaskFormSelector;
    if (selected != null) {
      taskFormSelector = `.detailsDialogAlert ${default_TaskFormSelector}`;
    }
    
    const taskForm: any = document?.querySelector(taskFormSelector);
    const formFields: any = taskForm?.children;
    const taskName = formFields[0].value.trim();
    const name = capWords(taskName);

    if (name && name != ``) {
      let position = formFields.rank.value;
      const nextIndex = tasks.length + 1;
      if (!position) position = nextIndex;
      position = Math.min(parseInt(position, 10), nextIndex);
  
      if (column) {
        const { rank, number } = await getRankAndNumber(Types.Task, globalUserData?.tasks, column?.data?.taskIDs, users, user);
        const tasksRef = await collection(db, tasksTable);
        const tasksSnapshot = await getDocs(tasksRef);
        const allDBTasks = tasksSnapshot.docs.map(doc => doc.data());
        const highestDbTaskRanks = allDBTasks?.map((tsk: Task) => tsk?.rank)?.sort((a, b) => b - a);
        const highestDbTaskRank = highestDbTaskRanks[0] + 1;
        const tasksCount = tasksSnapshot.size;
        const taskRank = tasksCount + 1;
        const taskNumber = Math.max(rank, number, taskRank, highestDbTaskRank);
  
        const newTask = createTask(taskNumber, name, user, selectedGrid?.id, item?.boardID, column?.id, item?.id, taskNumber) as Task;
  
        const prevTasks = [...tasks];
        const updatedTasks = Array.from(prevTasks);
        updatedTasks.splice(position - 1, 0, newTask);
        
        setTasks(updatedTasks);
        taskForm.reset();
  
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
  
      
      const tasksList = document?.querySelector(`.taskItems_${item?.uuid}`);
      if (tasksList) {
        window.requestAnimationFrame(() => {
          if (position <= 5) {
            tasksList.scrollTop = 0;
          } else {
            tasksList.scrollTop = tasksList.scrollHeight;
          }
        });
      }
    }
  }

  return (
    <div id={`${item?.id}_subTasks`} className={`rowTasks rowSubtasks subTasks dndkitTasks  ${showForm ? `showForm` : `hideForm`}`}>
      <div className={`taskElement subTaskElement flex ${getTasksInCurrentSearchFilters(tasks)?.length > 0 ? `hasTasks` : `noTasks`} ${showForm ? `hasForm` : `noForm`}`}>
        <div style={{ marginTop: -1 }} className={`subTaskItems taskItems_${item?.uuid} tasks_${getTasksInCurrentSearchFilters(tasks)?.length} taskItems ${item?.options?.complete ? `completedTasks` : `activeTasks`}`}>
          <DndContext
            sensors={sensors}
            autoScroll={true}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor, restrictToWindowEdges]}
          >
            <SortableContext
              strategy={verticalListSortingStrategy}
              disabled={searchFilterTasks && gridSearchTerm != ``}
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
                    selected={selected}
                    changeLabel={changeLabel}
                    gridSearchTerm={gridSearchTerm}
                    searchFilterTasks={searchFilterTasks}
                    deleteSubtask={(e) => deleteTask(e, task)}
                    completeTask={(e) => completeTask(e, task)}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>

        {showForm && (
          <form onSubmit={(e) => addTask(e)} className={`taskAddForm subtaskAddForm addForm flex row taskAddForm_${item?.uuid}`}>
            <input
              required
              type={`text`}
              autoComplete={`off`}
              ref={createTaskFieldRef}
              placeholder={`Create Task +`}
              className={`createTaskField`}
              id={`${item?.id}_createSubtask`}
              name={`createSubtask changeLabel`}
              onKeyDown={(e) => formSubmitOnEnter(e)}
            />
            <input
              name={`rank`}
              type={`number`}
              autoComplete={`off`}
              defaultValue={tasks.length + 1}
              className={`rankField taskRankField`}
              id={`${item?.id}_createSubtask_rank`}
              onKeyDown={(e) => formSubmitOnEnter(e)}
            />
            <button
              type={`button`}
              title={`Add Task`}
              onClick={(e) => addTask(e)}
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