import { createSwapy, Swapy, utils } from 'swapy';
import { addBoardScrollBars } from '../boards/board';
import { useState, useContext, useRef, useEffect, useMemo } from 'react';
import { capWords, dev, formatDate, generateUniqueID, StateContext } from '../../pages/_app';

const capitalizeAllWords = capWords;

export default function SwapyTasks(props) {
  const { item } = props;
  const { boards, setLoading, setSystemStatus } = useContext<any>(StateContext);

  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
//   const [deletedTaskIDs, setDeletedTaskIDs] = useState([]);
  
  const startingSubTasks = item.subtasks && item.subtasks.length > 0 ? item.subtasks : [];
  const [subtasks, setSubtasks] = useState(startingSubTasks);

  const [slotItemMap, setSlotItemMap] = useState(utils.initSlotItemMap(subtasks, `id`));
  const slottedItems = useMemo(() => utils.toSlottedItems(subtasks, `id`, slotItemMap), [subtasks]);
  useEffect(() => utils.dynamicSwapy(swapyRef.current, subtasks, `id`, slotItemMap, setSlotItemMap), [subtasks]);

  const changeLabel = (e, item) => {
    let elemValue = e.target.textContent;
    let value = elemValue == `` ? capitalizeAllWords(item.task) : capitalizeAllWords(elemValue);
    if (!elemValue || elemValue == ``) {
      elemValue = capitalizeAllWords(item.task);
      return;
    };
    elemValue = capitalizeAllWords(value);
    item.task = capitalizeAllWords(value);
    item.updated = formatDate(new Date());
    localStorage.setItem(`boards`, JSON.stringify(boards));
  }

  const completeSubtask = (e, subtask) => {
    setLoading(true);
    setSystemStatus(`Marking Task as ${subtask?.complete ? `Reopened` : `Complete`}.`);
    subtask.complete = !subtask?.complete;
    item.updated = formatDate(new Date());
    subtask.updated = formatDate(new Date());
    dev() && console.log(`Task`, subtask);
    localStorage.setItem(`boards`, JSON.stringify(boards));
    setTimeout(() => {
      setSystemStatus(`Marked Task as ${subtask?.complete ? `Complete` : `Reopened`}.`);
      setLoading(false);
    }, 1000);
  }

  const addSubtask = (e) => {
    e.preventDefault();
    let formFields = e.target.children;
    setLoading(true);
    let nextSubtaskIndex = subtasks.length + 1;
    setSystemStatus(`Creating Task.`);
    let subtasksList = e.target.previousSibling;
    let newSubtaskID = `subtask_${nextSubtaskIndex}`;
    let subtaskID = `${newSubtaskID}_${generateUniqueID()}`;
    let task = formFields[0].value;
    let rank = formFields.rank.value;
    if (!rank || rank == ``) rank = nextSubtaskIndex;
    rank = parseInt(rank);
    rank = rank > nextSubtaskIndex ? nextSubtaskIndex : rank; 

    const newSubtask = {
      id: subtaskID,
      complete: false,
      task: capitalizeAllWords(task),
      created: formatDate(new Date()),
    }

    const updatedTasks = [
      ...subtasks.slice(0, rank - 1), // Tasks before the rank
      newSubtask,                     // The new subtask
      ...subtasks.slice(rank - 1),    // Tasks after the rank
    ];

    setSubtasks(updatedTasks);
    item.subtasks = updatedTasks;
    item.updated = formatDate(new Date());

    const updatedSlotItemMap = utils.initSlotItemMap(updatedTasks, `id`);
    setSlotItemMap(updatedSlotItemMap);

    utils.dynamicSwapy(swapyRef.current, updatedTasks, `id`, updatedSlotItemMap, setSlotItemMap);

    localStorage.setItem(`boards`, JSON.stringify(boards));
    addBoardScrollBars();

    console.log(`Added Subtask`, {
      boards, 
      subtasks,
      newSubtask, 
      slotItemMap, 
      updatedTasks,
      slottedItems, 
    });

    e.target.reset();
    e.target.children[0].focus();

    setTimeout(() => {
      setSystemStatus(`Created Task.`);
      setLoading(false);
    }, 1000);

    window.requestAnimationFrame(() => {
      if (rank <= 5) {
        return subtasksList.scrollTop = 0;
      } else {
        return subtasksList.scrollTop = subtasksList.scrollHeight;
      }
    });
  }

  const deleteSubtask = (e, subtask) => {
    setLoading(true);
    setSystemStatus(`Deleting Task.`);

    const subtaskIDToDelete = subtask?.id;

    const updatedTasks = subtasks.filter(tsk => tsk.id != subtaskIDToDelete);

    setSubtasks(updatedTasks);
    item.subtasks = updatedTasks;
    item.updated = formatDate(new Date());

    const updatedSlotItemMap = utils.initSlotItemMap(updatedTasks, `id`);
    setSlotItemMap(updatedSlotItemMap);

    utils.dynamicSwapy(swapyRef.current, updatedTasks, `id`, updatedSlotItemMap, setSlotItemMap);

    console.log(`Deleted Subtask`, {
      boards, 
      subtask, 
      slotItemMap, 
      slottedItems, 
      updatedTasks,
    });

    localStorage.setItem(`boards`, JSON.stringify(boards));
    addBoardScrollBars();

    setTimeout(() => {
      setSystemStatus(`Deleted Task.`);
      setLoading(false);
    }, 1000);
  }

  useEffect(() => {
    if (containerRef.current) {
      swapyRef.current = createSwapy(containerRef.current, {
        animation: `spring`,
        autoScrollOnDrag: true,
      });

      swapyRef.current.onSwapEnd(({ hasChanged, slotItemMap }) => {
        if (hasChanged) {
          let swappedItemIDs = Object.values(slotItemMap.asObject);
          let swappedData = swappedItemIDs.map(id => subtasks.find(itm => itm?.id == id)).filter(itm => itm != undefined && item != null);
          let swappedItems = swappedData.map(itm => itm?.task);
      
          // Update React state so your UI matches the new order:
          setSubtasks(swappedData);
          // setSlotItemMap(slotItemMap.asArray);

          dev() && console.log(`Swapped`, {item, swappedItems, swappedData, slotItemMap, arr: slotItemMap?.asArray});
      
          // Also update the `item` object (if needed) and localStorage:
          item.subtasks = swappedData;
          localStorage.setItem('boards', JSON.stringify(boards));
          addBoardScrollBars();
        }
      });
    }

    return () => {
      if (swapyRef.current) {
        swapyRef.current?.destroy();
        swapyRef.current = null;
      }
    }
  }, [item, subtasks, slotItemMap])

  return <>
    <div id={`${item.id}_subTasks`} className={`rowSubtasks subTasks`}>

      <div className={`subTaskElement flex ${subtasks.length > 0 ? `hasTasks` : `noTasks`}`}>
        <div ref={containerRef} style={{ marginTop: -1 }} className="subTaskItems">
          {slottedItems.map(({ slotId, itemId, item: subtask }: any, taskIndex) => {
            return (
                <div
                    title={subtask?.task}
                    key={slotId} data-swapy-slot={slotId}
                    className={`task_${subtask?.id} slot subTaskItem ${subtask?.complete ? `complete` : `activeTask`}`}
                >
                    <div className="draggableItem item subtaskHandle" key={itemId} data-swapy-item={itemId}>

                    <span className="itemOrder taskComponentBG">
                        <i className={`itemIndex ${subtask?.complete ? `completedIndex` : `activeIndex`}`}>
                        {taskIndex + 1}
                        </i>
                    </span>

                    <div className={`subtaskActions flex row taskComponentBG ${subtask?.complete ? `complete` : `activeTask`}`}>

                        <span
                        onBlur={(e) => changeLabel(e, subtask)}
                        contentEditable
                        suppressContentEditableWarning
                        className={`changeLabel taskChangeLabel ${subtask?.complete ? `complete` : `activeTask`}`}
                        >
                        {subtask?.task}
                        </span>

                        {subtask?.created && !subtask?.updated ? (
                        <span className="itemDate itemName itemCreated textOverflow extended flex row">
                            <i className={`status`}>
                            Cre.
                            </i>
                            <span className={`itemDateTime`}>
                            {formatDate(new Date(subtask?.created))}
                            </span>
                        </span>
                        ) : subtask?.updated ? (
                        <span className="itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                            <i className={`status`}>
                            Upd.
                            </i>
                            <span className={`itemDateTime`}>
                            {formatDate(new Date(subtask?.updated))}
                            </span>
                        </span>
                        ) : null}

                    </div>

                    <div className="itemButtons customButtons taskComponentBG">
                        <button
                        title={`Delete Task`}
                        onClick={(e) => deleteSubtask(e, subtask)}
                        className={`iconButton deleteButton wordIconButton`}
                        >
                        <i className="fas fa-trash" style={{ color: `var(--gameBlue)`, fontSize: 9 }} />
                        </button>
                        <input
                        className={`taskCheckbox ${subtask?.complete ? `complete` : `activeTask`}`}
                        onChange={(e) => completeSubtask(e, subtask)}
                        type="checkbox"
                        defaultChecked={subtask?.complete}
                        autoComplete={`off`}
                        />
                    </div>

                    </div>
                </div>
            );
          })}
        </div>

        <form onSubmit={(e) => addSubtask(e)} className="subtaskAddForm addForm flex row">
          <input
            type="text"
            id={`${item.id}_createSubtask`}
            name={`createSubtask changeLabel`}
            placeholder={`Create Subtask +`}
            autoComplete={`off`}
            required
          />
          <input
            type="number"
            id={`${item.id}_createSubtask_rank`}
            name={`rank`}
            autoComplete={`off`}
            defaultValue={subtasks.length + 1}
          />
          <button
            type={`submit`}
            title={`Add Task`}
            className={`iconButton createList wordIconButton`}
          >
            <i
              style={{ color: `var(--gameBlue)`, fontSize: 10 }}
              className="fas fa-plus"
            />
            <span className={`iconButtonText textOverflow extended`}>
              <span>
                Add
              </span>
              <span
                className={`itemLength index`}
                style={{
                  padding: `0 5px`,
                  color: `var(--gameBlue)`,
                  maxWidth: `fit-content`,
                }}
              />
            </span>
          </button>
        </form>

      </div>
    </div>
  </>
}