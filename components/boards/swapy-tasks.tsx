import { createSwapy, Swapy, utils } from "swapy";
import { useRef, useEffect, useState, useContext } from "react";
import { capWords, formatDate, generateUniqueID, StateContext } from "../../pages/_app";
import { addBoardScrollBars } from "./board";

const capitalizeAllWords = capWords;

export default function SwapyTasks({ item }: any) {
  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { boards, setLoading, setSystemStatus } = useContext<any>(StateContext);

  const [slotItemMap, setSlotItemMap] = useState(
    utils.initSlotItemMap(item.subtasks || [], "id")
  );

  const slotItems = utils.toSlottedItems(item.subtasks || [], "id", slotItemMap);

  useEffect(() => {
    if (containerRef.current) {
      swapyRef.current = createSwapy(containerRef.current, {
        manualSwap: true,
        animation: "spring",
        autoScrollOnDrag: true,
      });

      swapyRef.current.onSwapEnd(({ hasChanged, slotItemMap }) => {
        if (hasChanged) {
          setSlotItemMap(slotItemMap.asArray);
          const reorderedSubtasks = Object.values(slotItemMap.asObject).map((id) =>
            item.subtasks.find((task: any) => task.id === id)
          );
          item.subtasks = reorderedSubtasks;
          addBoardScrollBars();
          localStorage.setItem("boards", JSON.stringify(boards));
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

  const addSubtask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formFields = e.currentTarget.elements as any;
    const task = capitalizeAllWords(formFields[0].value);
    let rank = formFields.rank.value || Object.keys(slotItemMap).length + 1;
    rank = Math.min(parseInt(rank, 10), Object.keys(slotItemMap).length + 1);

    const newSubtask = {
      id: `subtask_${generateUniqueID()}`,
      task,
      complete: false,
      created: formatDate(new Date()),
    };

    item.subtasks.splice(rank - 1, 0, newSubtask);
    const updatedSlotItemMap = utils.initSlotItemMap(item.subtasks, "id");
    setSlotItemMap(updatedSlotItemMap);
    utils.dynamicSwapy(swapyRef.current, item.subtasks, "id", updatedSlotItemMap, setSlotItemMap);

    localStorage.setItem("boards", JSON.stringify(boards));
    e.currentTarget.reset();
    formFields[0].focus();
    setSystemStatus("Created Task.");
    setTimeout(() => setLoading(false), 1000);
  };

  const deleteSubtask = (subtask: any) => {
    item.subtasks = item.subtasks.filter((task: any) => task.id !== subtask.id);
    const updatedSlotItemMap = utils.initSlotItemMap(item.subtasks, "id");
    setSlotItemMap(updatedSlotItemMap);
    utils.dynamicSwapy(swapyRef.current, item.subtasks, "id", updatedSlotItemMap, setSlotItemMap);

    localStorage.setItem("boards", JSON.stringify(boards));
    setSystemStatus("Deleted Task.");
    setTimeout(() => setLoading(false), 1000);
  };

  const completeSubtask = (subtask: any) => {
    subtask.complete = !subtask.complete;
    subtask.updated = formatDate(new Date());
    setSlotItemMap({ ...slotItemMap });
    localStorage.setItem("boards", JSON.stringify(boards));
  };

  const changeLabel = (e: React.FocusEvent<HTMLSpanElement>, subtask: any) => {
    const newTask = capitalizeAllWords(e.target.textContent || subtask.task);
    subtask.task = newTask;
    subtask.updated = formatDate(new Date());
    setSlotItemMap({ ...slotItemMap });
    localStorage.setItem("boards", JSON.stringify(boards));
  };

  return (
    <div id={`${item.id}_subTasks`} className="rowSubtasks subTasks">
      <div className={`subTaskElement flex ${slotItems.length > 0 ? "hasTasks" : "noTasks"}`}>
        <div ref={containerRef} className="subTaskItems">
          {slotItems.map(({ slotId, itemId, item: subtask }: any, index: number) => (
            <div
              key={slotId}
              data-swapy-slot={slotId}
              className={`slot subTaskItem ${subtask.complete ? "complete" : "activeTask"}`}
            >
              <div className="item subtaskHandle" data-swapy-item={itemId}>
                <span className="itemOrder">
                  <i
                    className={`itemIndex ${
                      subtask.complete ? "completedIndex" : "activeIndex"
                    }`}
                  >
                    {index + 1}
                  </i>
                </span>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className={`changeLabel taskChangeLabel ${
                    subtask.complete ? "complete" : "activeTask"
                  }`}
                  onBlur={(e) => changeLabel(e, subtask)}
                >
                  {subtask.task}
                </div>
                <div className="itemButtons customButtons">
                  <button
                    onClick={() => deleteSubtask(subtask)}
                    className="iconButton deleteButton wordIconButton"
                  >
                    <i
                      className="fas fa-trash"
                      style={{ color: "var(--gameBlue)", fontSize: 9 }}
                    />
                  </button>
                  <input
                    type="checkbox"
                    checked={subtask.complete}
                    onChange={() => completeSubtask(subtask)}
                    className={`taskCheckbox ${subtask.complete ? "complete" : "activeTask"}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={addSubtask} className="subtaskAddForm addForm flex row">
          <input
            type="text"
            name="createSubtask"
            placeholder="Create Subtask +"
            required
          />
          <input type="number" name="rank" defaultValue={Object.keys(slotItemMap).length + 1} />
          <button type="submit" className="iconButton createList wordIconButton">
            <i className="fas fa-plus" style={{ color: "var(--gameBlue)", fontSize: 10 }} />
            <span className="iconButtonText">Add</span>
          </button>
        </form>
      </div>
    </div>
  );
}