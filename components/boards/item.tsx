import { ItemTypes } from './boards';
import ItemDetail from './itemdetail';
import React, { useContext } from 'react';
import CustomImage from '../custom-image';
import 'react-circular-progressbar/dist/styles.css';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { showAlert, formatDate, dev, StateContext, capitalizeAllWords } from '../../pages/_app';
import { forceFieldBlurOnPressEnter, removeExtraSpacesFromString } from '../../shared/constants';

export const getSubTaskPercentage = (subtasks: any[], item, isActive = null) => {
    if (item?.complete) return 100;
    if (subtasks.length == 0) {
        if (isActive != null) return item?.complete ? 100 : (isActive == true ? 0 : 100);
        else return item?.complete ? 100 : 0;
    };
    let subtasksProgress = 0;
    let completeTasks = subtasks.filter(task => task.complete);
    subtasksProgress = parseFloat(((completeTasks.length / subtasks.length) * 100).toFixed(1));
    return subtasksProgress;
}

export const getTypeIcon = (type, plain?) => {
    switch (type) {
        default:
            return `+`;
        case ItemTypes.Task:
            if (plain) {
                return `✔`
            } else {
                return <span style={{fontSize: 20, textAlign: `center`}}>✔</span>;
            }
        case ItemTypes.Image:
            return <i style={{display: `contents`}} className={`fas fa-image`} />;
        case ItemTypes.Video:
            return <i style={{display: `contents`}} className={`fab fa-youtube`} />;
    }
}

export const manageItem = (e, item, index, board, boards, setBoards) => {
    if (!e.target.classList.contains(`changeLabel`)) {
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            let isManageButton = e.target.classList.contains(`manageButton`);
            if (isManageButton) {
                dev() && console.log(`Item ${index + 1}`, item);
                showAlert(item?.content, <ItemDetail item={item} index={index} board={board} boards={boards} setBoards={setBoards} />, `95%`, `75%`);
            };
        } else {
            dev() && console.log(`Item ${index + 1}`, item);
            showAlert(item?.content, <ItemDetail item={item} index={index} board={board} boards={boards} setBoards={setBoards} />, `95%`, `75%`);
        }
    }
}

export default function Item({ item, count, column, itemIndex, board, setBoard }: any) {
    const { boards, setBoards, tasksFiltered, setLoading, setSystemStatus } = useContext<any>(StateContext);

    const changeLabel = (e, item) => {
        let elemValue = e.target.textContent;
        let value = elemValue == `` ? capitalizeAllWords(item.task) : capitalizeAllWords(elemValue);
        if (!elemValue || elemValue == ``) {
            elemValue = capitalizeAllWords(item.task);
            return;
        };

        elemValue = removeExtraSpacesFromString(value);
        elemValue = capitalizeAllWords(elemValue);

        e.target.innerHTML = elemValue;
        item.title = elemValue;
        item.content = elemValue;
        item.updated = formatDate(new Date());

        localStorage.setItem(`boards`, JSON.stringify(boards));
    }

    const completeItem = (e, itemId, index, item) => {
        let button = e.target;
        let isButton = button.classList.contains(`iconButton`);
        if (isButton) {
            let completeButton = button.classList.contains(`completeButton`);
            if (!completeButton) return;
        }
        if (!e.target.classList.contains(`changeLabel`)) {
            completeActions(item, index, itemId, isButton);
        }
    }

    const getTypeIcon = (type, plain?) => {
        switch (type) {
            default:
                return `+`;
            case ItemTypes.Task:
                if (plain) {
                    return `✔`
                } else {
                    return <span style={{fontSize: 20, textAlign: `center`}}>✔</span>;
                }
            case ItemTypes.Image:
                return <i style={{display: `contents`}} className={`fas fa-image`} />;
            case ItemTypes.Video:
                return <i style={{display: `contents`}} className={`fab fa-youtube`} />;
        }
    }

    const renderProgressChart = (tasks: any[], item) => {
        tasks = tasks.length > 0 ? tasks : [];
        const progress = getSubTaskPercentage(tasks, item);
        return (
            <div className={`progress`}>
                <CircularProgressbar 
                    value={progress} 
                    text={`${progress}%`} 
                    styles={buildStyles({
                        rotation: 0.5,
                        textSize: `24px`,
                        textColor: `#fff`,
                        strokeLinecap: `butt`,
                        backgroundColor: `#3e98c7`,
                        pathTransitionDuration: 0.5,
                        trailColor: `rgba(0, 194, 255, 0.2)`,
                        pathColor: progress < 100 ? `rgba(0, 194, 255, ${progress / 100})` : `#00b900`,
                    })} 
                />
        </div>
        )
    }

    const completeActions = (item, index, itemId, isButton) => {
        if (count == 0) {
            setLoading(true);
            setSystemStatus(`Marking Item as Complete.`);

            board.items[itemId].updated = formatDate(new Date());
            board.items[itemId].complete = !board.items[itemId].complete;

            // Complete Tasks On Complete Item
            // for (let i = 0; i < board.items[itemId].subtasks.length; i++) {
            //     board.items[itemId].subtasks[i].complete = !board.items[itemId].subtasks[i].complete;
            // }

            setBoard({
                ...board,
                updated: formatDate(new Date()),
                items: {
                    ...board.items
                },
            });

            setTimeout(() => {
                setSystemStatus(item.complete ? `Marked Item as Complete.` : `Reopened Item.`);
                setLoading(false);
            }, 1000);
            if (isButton) count = count + 1;
        }
    }

    const deleteItem = (e, item, columnId, index, itemId) => {
        let isButton = e.target.classList.contains(`iconButton`);
        if (isButton) {
            e.preventDefault();
            setLoading(true);
            setSystemStatus(`Deleting Item.`);
            const column = board.columns[columnId];
            const newItemIds = Array.from(column.itemIds);
            newItemIds.splice(index, 1);

            const items = board.items;
            const { [itemId]: oldItem, ...newItems } = items;

            setBoard({
                ...board,
                updated: formatDate(new Date()),
                items: {
                    ...newItems
                },
                columns: {
                    ...board.columns,
                    [columnId]: {
                        ...column,
                        itemIds: newItemIds
                    }
                }
            });
            setTimeout(() => {
                setSystemStatus(`Deleted Item ${item.content}.`);
                setLoading(false);
            }, 1000);   
        }
    }

    return <>
        <div id={`itemElement_${item.id}`} className={`itemComponent itemInnerRow flex row`}>
            <span className={`itemOrder rowIndexOrder`}>
                {/* <i className={`itemIconType itemIndex ${item.complete ? `completedIndex` : `activeIndex`}`}>{getTypeIcon(item?.type)}</i> */}
                <i className={`itemIndex ${item.complete ? `completedIndex` : `activeIndex`}`}>
                    {(item?.type == ItemTypes.Item || item?.type == ItemTypes.Task) && (
                        <span className={`itemIconType ${item?.type}`}>
                            {getTypeIcon(item?.type, true)}
                        </span>
                    )} {itemIndex + 1}
                </i>
            </span>
            {item?.image && <CustomImage className={`itemImage boardItemImage`} src={item?.image} alt={item?.content} useLazyLoad={true} />}
            <div className={`itemContents`}>
                <span className={`flex row itemContent boardItemContent itemName textOverflow extended`}>
                    {/* <textarea onBlur={(e) => changeLabel(e, item)} className={`changeLabel`} defaultValue={item.content} /> */}
                    <span 
                        contentEditable 
                        spellCheck={false}
                        suppressContentEditableWarning 
                        onBlur={(e) => changeLabel(e, item)} 
                        className={`changeLabel stretchEditable`}
                        onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
                    >
                        {item.content}
                    </span>
                    {/* {item.subtasks.length > 0 && (
                        <div className="progress">
                            <div className="progressBar" style={{clipPath: `polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)`}}></div>
                        </div>
                    )} */}
                </span>
                {/* {devEnv && wordInCategories(item) && <span className="itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row">
                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-hashtag"></i> 
                    <span className={`itemDateTime`}>{wordOfCategory(item)}</span>
                </span>} */}
                {(item?.image || column?.details && column?.details == true) ? <>
                    <hr className={`itemSep`} style={{height: 1, borderColor: `var(--gameBlue)`}} />
                    <div className={`itemFooter flex row`}>
                        {item.created && !item.updated ? (
                        <span className={`itemDate itemName itemCreated textOverflow extended flex row`}>
                            <i className={`status`}>Cre.</i> 
                            <span className={`itemDateTime`}>
                                {formatDate(new Date(item.created))}
                            </span>
                        </span>
                        ) : item.updated ? (
                        <span className={`itemDate itemName itemCreated itemUpdated textOverflow extended flex row`}>
                            <i className={`status`}>Upd.</i> 
                            <span className={`itemDateTime`}>
                                {formatDate(new Date(item.updated))}
                            </span>
                        </span>
                        ) : null}
                        {!tasksFiltered && item.subtasks && item.subtasks.length > 0 && <>
                            <span className={`subtaskIndex subscript flex row gap5`}>
                                <span className={`slashes`}>
                                    ✔
                                </span> {item?.complete ? item.subtasks.length : item.subtasks.filter(subtask => subtask.complete).length} <span className={`slashes`}>
                                    //
                                </span> {item.subtasks.length}
                            </span>
                        </>}
                    </div>
                </> : <></>}
            </div>
            {renderProgressChart(item?.subtasks, item)}
            <div className={`itemButtons customButtons`}>
                {/* <button id={`copy_${item.id}`} onClick={(e) => copyItem(e, item)} title={`Copy Item`} className={`iconButton ${ItemActions.Copy} copyButton wordIconButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas fa-copy`}></i>
                </button> */}
                <button id={`delete_${item.id}`} onClick={(e) => deleteItem(e, item, column.id, itemIndex, item.id)} title={`Delete Item`} className={`iconButton deleteButton wordIconButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className="fas fa-trash"></i>
                </button>
                <button id={`complete_${item.id}`} onClick={(e) => completeItem(e, item.id, itemIndex, item)} title={`Complete Item`} className={`iconButton wordIconButton completeButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas ${item.complete ? `fa-history` : `fa-check-circle`}`}></i>
                </button>
                <button id={`manage_${item.id}`} onClick={(e) => manageItem(e, item, itemIndex, board, boards, setBoards)} title={`Manage Item`} className={`iconButton wordIconButton manageButton`}>
                    <i style={{color: `var(--gameBlue)`, fontSize: 13}} className={`fas fa-bars`}></i>
                </button>
            </div>
        </div>
    </>
}