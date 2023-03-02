import { useState, useEffect, useContext } from 'react';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import { capWords, dev, formatDate, generateUniqueID, StateContext } from '../../pages/_app';

const capitalizeAllWords = capWords;

export const defaultSubtasks = [{ task: `Task 1`, id: `subtask_1_3_58_AM_2_27_2023_b3778dejv`,},{ task: `Task 2`, id: `subtask_2_3_58_AM_2_27_2023_bhp76c2z2`,},{ task: `Task 3`, id: `subtask_3_3_58_AM_2_27_2023_5qpvxbqpe`,},{ task: `Task 4`, id: `subtask_4_3_58_AM_2_27_2023_71p1p75yo`,},{ task: `Task 5`, id: `subtask_5_3_58_AM_2_27_2023_iw2nnv3qx`,},];

export const randArray = (array) => {
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    // Get a random index to slice from
    const sliceIndex = Math.floor(Math.random() * array.length);

    // Slice the array from the random index and return the result
    return array.slice(sliceIndex);
}

export default function SubTasks(props) {

    const { item } = props;
    const startingSubTasks = item.subtasks && item.subtasks.length > 0 ? item.subtasks : [];
    const [subtasks, setSubtasks] = useState(startingSubTasks);
    const { setLoading, setSystemStatus, devEnv, completeFiltered, boardCategories, board, setBoard } = useContext<any>(StateContext);

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

        subtasks.splice(rank-1,0,newSubtask);
        item.subtasks = subtasks;
        item.updated = formatDate(new Date());
        localStorage.setItem(`board`, JSON.stringify({...board, updated: formatDate(new Date())}));

        e.target.reset();
        e.target.children[0].focus();
        setTimeout(() => {
            setSystemStatus(`Created Task.`);
            setLoading(false);
        }, 1000);
        // window.requestAnimationFrame(() => {
        //     if (rank <= 5) {
        //         return subtasksList.scrollTop = 0;
        //     } else {
        //         return subtasksList.scrollTop = subtasksList.scrollHeight;
        //     }
        // });
    }

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
        localStorage.setItem(`board`, JSON.stringify({...board, updated: formatDate(new Date())}));
    }

    const completeSubtask = (e, subtask) => {
        setLoading(true);
        setSystemStatus(`Marking Task as ${subtask.complete ? `Reopened` : `Complete`}.`);
        subtask.complete = !subtask.complete;
        item.updated = formatDate(new Date());
        subtask.updated = formatDate(new Date());
        dev() && console.log(`Task`, subtask);
        localStorage.setItem(`board`, JSON.stringify({...board, updated: formatDate(new Date())}));
        setTimeout(() => {
            setSystemStatus(`Marked Task as ${subtask.complete ? `Complete` : `Reopened`}.`);
            setLoading(false);
        }, 1000);
    }

    const deleteSubtask = (e, subtask) => {
        setLoading(true);
        setSystemStatus(`Deleting Task.`);
        setSubtasks(prevTasks => {
            let newSubtasks = prevTasks.filter(task => task.id != subtask.id);
            item.subtasks = newSubtasks;
            localStorage.setItem(`board`, JSON.stringify({...board, updated: formatDate(new Date())}));
            return newSubtasks;
        });
        setTimeout(() => {
            setSystemStatus(`Deleted Task.`);
            setLoading(false);
        }, 1000);
    }
    
    const onDragEnd = (dragEndEvent) => {
        const { destination, source, draggableId, type } = dragEndEvent;

        console.log({source, destination, draggableId});

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const newSubtasks = [...subtasks];
        const [reorderedSubtask] = newSubtasks.splice(source.index, 1);
        newSubtasks.splice(destination.index, 0, reorderedSubtask);

        setSubtasks(newSubtasks);
        item.subtasks = newSubtasks;
        localStorage.setItem(`board`, JSON.stringify(board));

    };

    // useEffect(() => {

    // }, [subtasks])

    return <>
    <DragDropContext onDragEnd={onDragEnd}>
        <div id={`${item.id}_subTasks`} className={`rowSubtasks subTasks`}>
            <div className={`subTaskElement flex ${subtasks.length > 0 ? `hasTasks` : `noTasks`}`}>
                <Droppable droppableId={`${item.id}_subtaskItems`}>
                    {(provided, snapshot) => (
                        <div className={`subTaskItems ${snapshot.isDraggingOver ? `isDraggingOver` : ``}`} ref={provided.innerRef} {...provided.droppableProps}>
                            {subtasks.map((subtask, taskIndex) => {
                                return (
                                    <Draggable key={`${taskIndex + 1}_${subtask.id}_subtask_key`} draggableId={`${taskIndex + 1}_${subtask.id}_draggable_subtask`} index={taskIndex}>
                                        {(provided, snapshot) => (
                                            <div id={`${taskIndex + 1}_${subtask.id}_task`} className={`subTaskItem ${subtask?.complete ? `complete` : `activeTask`} ${snapshot.isDragging ? `dragging` : ``}`} title={subtask?.task} {...provided.draggableProps} ref={provided.innerRef} {...provided.dragHandleProps}>
                                                <div className="item subtaskHandle">
                                                    <span className="itemOrder">
                                                        <i className={`itemIndex ${subtask?.complete ? `completedIndex` : `activeIndex`}`}>{taskIndex + 1}</i>
                                                    </span>
                                                    {/* <div title={subtask.task} className={`taskContent ${subtask.complete ? `complete` : ``}`}>
                                                        {subtask.task}
                                                    </div> */}
                                                    <div className={`subtaskActions flex row ${subtask?.complete ? `complete` : `activeTask`}`}>
                                                        <span onBlur={(e) => changeLabel(e, subtask)} contentEditable suppressContentEditableWarning className={`changeLabel taskChangeLabel ${subtask?.complete ? `complete` : `activeTask`}`}>{subtask?.task}</span>
                                                        {subtask?.created && !subtask?.updated ? (
                                                        <span className="itemDate itemName itemCreated textOverflow extended flex row">
                                                            <i className={`status`}>Cre.</i> 
                                                            <span className={`itemDateTime`}>{formatDate(new Date(subtask?.created))}</span>
                                                        </span>
                                                        ) : subtask?.updated ? (
                                                        <span className="itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                                                            <i className={`status`}>Upd.</i> 
                                                            <span className={`itemDateTime`}>{formatDate(new Date(subtask?.updated))}</span>
                                                        </span>
                                                        ) : null}
                                                        {/* <input title={`${subtask.complete ? `Reopen` : `Complete`} Task`} onChange={(e) => completeSubtask(e, subtask)} id={`${subtask.id}_checkbox`} type="checkbox" defaultChecked={subtask.complete} /> */}
                                                    </div>
                                                    <div className="itemButtons customButtons">
                                                        <button id={`delete_${subtask.id}`} onClick={(e) => deleteSubtask(e, subtask)} title={`Delete Task`} className={`iconButton deleteButton wordIconButton`}>
                                                            <i style={{color: `var(--gameBlue)`, fontSize: 9}} className="fas fa-trash"></i>
                                                        </button>
                                                        <input title={`${subtask.complete ? `Reopen` : `Complete`} Task`} className={`taskCheckbox ${subtask?.complete ? `complete` : `activeTask`}`} onChange={(e) => completeSubtask(e, subtask)} id={`${subtask.id}_checkbox`} type="checkbox" defaultChecked={subtask.complete} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                )
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <form onSubmit={(e) => addSubtask(e)} className="subtaskAddForm addForm flex row">
                    <input type="text" id={`${item.id}_createSubtask`} name={`createSubtask changeLabel`} placeholder={`Create Subtask +`} required />
                    <input type="number" id={`${item.id}_createSubtask_rank`} name={`rank`} defaultValue={subtasks.length + 1} />
                    <button type={`submit`} title={`Add Task`} className={`iconButton createList wordIconButton`}>
                        <i style={{ color: `var(--gameBlue)`, fontSize: 10 }} className="fas fa-plus"></i>
                        <span className={`iconButtonText textOverflow extended`}>
                            <span>Add</span>
                            <span className={`itemLength index`} style={{ padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                {/* {list.items.length + 1} */}
                            </span>
                        </span>
                    </button>
                </form>
            </div>
        </div>
    </DragDropContext>
    </>
}