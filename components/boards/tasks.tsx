import { addBoardScrollBars } from './board';
import { createSwapy, Swapy, utils } from 'swapy';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { capitalizeAllWords, dev, formatDate, StateContext } from '../../pages/_app';

export default function Tasks({ item, items = [] }: any) {
  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { boards, setLoading, setSystemStatus } = useContext<any>(StateContext);

  const [slotItemMap,] = useState(utils.initSlotItemMap(items, `id`));
  const slottedItems = useMemo(() => utils.toSlottedItems(items, `id`, slotItemMap), [items, slotItemMap]);

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
    // localStorage.setItem(`board`, JSON.stringify({...board, updated: formatDate(new Date())}));
  }

  const completeSubtask = (e, subtask) => {
    setLoading(true);
    setSystemStatus(`Marking Task as ${subtask.complete ? `Reopened` : `Complete`}.`);
    subtask.complete = !subtask.complete;
    item.updated = formatDate(new Date());
    subtask.updated = formatDate(new Date());
    dev() && console.log(`Task`, subtask);
    localStorage.setItem(`boards`, JSON.stringify(boards));
    // localStorage.setItem(`board`, JSON.stringify({...board, updated: formatDate(new Date())}));
    setTimeout(() => {
      setSystemStatus(`Marked Task as ${subtask.complete ? `Complete` : `Reopened`}.`);
      setLoading(false);
    }, 1000);
  }

  const deleteSubtask = (e, subtask) => {
    setLoading(true);
    setSystemStatus(`Deleting Task.`);
    // setSubtasks(prevTasks => {
    //     let newSubtasks = prevTasks.filter(task => task.id != subtask.id);
    //     item.subtasks = newSubtasks;
    //     addBoardScrollBars();
    //     localStorage.setItem(`boards`, JSON.stringify(boards));
    //     // localStorage.setItem(`board`, JSON.stringify({...board, updated: formatDate(new Date())}));
    //     return newSubtasks;
    // });
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
            let swappedData = swappedItemIDs.map(id => items.find(itm => itm?.id == id));
            let swappedItems = swappedData.map(itm => itm.task);
            dev() && console.log(`Swapped`, {item, swappedItems});
            item.subtasks = swappedData;
            addBoardScrollBars();
            localStorage.setItem(`boards`, JSON.stringify(boards));
        }
      });
    }

    return () => {
      if (swapyRef.current) {
        swapyRef.current.destroy();
        swapyRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`_tasks tasksContainer`}>
      {slottedItems?.length > 0 ? (
        slottedItems.map(({ slotId, itemId, item }: any, itmIndex) => (
          <div className={`slot`} key={slotId} data-swapy-slot={slotId}>
            <div id={`${itemId}_task`} className={`_task taskItem`} data-swapy-item={itemId}>

                <div id={`${itmIndex + 1}_${item.id}_task`} title={item?.task} className={`subTaskItem ${item?.complete ? `complete` : `activeTask`}`}>
                    
                    <div className={`item subtaskHandle`}>

                        <span className={`itemOrder`}>
                            <i className={`itemIndex ${item?.complete ? `completedIndex` : `activeIndex`}`}>
                                {itmIndex + 1}
                            </i>
                        </span>

                        <div className={`subtaskActions flex row ${item?.complete ? `complete` : `activeTask`}`}>

                            <span onBlur={(e) => changeLabel(e, item)} contentEditable suppressContentEditableWarning className={`changeLabel taskChangeLabel ${item?.complete ? `complete` : `activeTask`}`}>
                                {item?.task}
                            </span>

                            {item?.created && !item?.updated ? (

                                <span className={`itemDate itemName itemCreated textOverflow extended flex row`}>
                                    <i className={`status`}>
                                        Cre.
                                    </i> 
                                    <span className={`itemDateTime`}>
                                        {formatDate(new Date(item?.created))}
                                    </span>
                                </span>

                            ) : item?.updated ? (

                                <span className={`itemDate itemName itemCreated itemUpdated textOverflow extended flex row`}>
                                    <i className={`status`}>
                                        Upd.
                                    </i> 
                                    <span className={`itemDateTime`}>
                                        {formatDate(new Date(item?.updated))}
                                    </span>
                                </span>

                            ) : null}

                        </div>
                        <div className={`itemButtons customButtons`}>
                            <button id={`delete_${item.id}`} onClick={(e) => deleteSubtask(e, item)} title={`Delete Task`} className={`iconButton deleteButton wordIconButton`}>
                                <i style={{color: `var(--gameBlue)`, fontSize: 9}} className={`fas fa-trash`} />
                            </button>
                            <input title={`${item.complete ? `Reopen` : `Complete`} Task`} className={`taskCheckbox ${item?.complete ? `complete` : `activeTask`}`} onChange={(e) => completeSubtask(e, item)} id={`${item.id}_checkbox`} type={`checkbox`} defaultChecked={item.complete} />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ))
      ) : (
        <p>No tasks available</p>
      )}
    </div>
  );
}