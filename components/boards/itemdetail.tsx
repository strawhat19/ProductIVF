import { useState } from 'react';
import CustomImage from '../custom-image';
import { getSubTaskPercentage } from './item';
import { capWords, formatDate, generateUniqueID } from '../../pages/_app';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';

export default function ItemDetail(props) {
    let [disabled, setDisabled] = useState(false);
    const { item, index, boards, setBoards, IDs } = props;
    let [image, setImage] = useState(props.item.image ?? undefined);
    const [active, setActive] = useState(item?.complete ? `complete` : `active`);

    const refreshDetails = (e) => {
        e.preventDefault();
        if (e.target.name == `itemImageLink`) {
            setImage(e.target.value);
        }
    }

    const renderProgressChart = (tasks, item, active, injectedProgress = null) => {
        let progress = getSubTaskPercentage(tasks, item, active === `active`);
        progress = injectedProgress != null ? injectedProgress : progress;
        return (
            <div className={`progress`} title={`Progress: ${progress}%`}>
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
                        pathColor: progress < 100 ? `rgba(0, 194, 255, ${progress / 100})` : `#00c2ff`,
                    })} 
                />
            </div>
        )
    }

    const saveItem = (e) => {
        e.preventDefault();
        let form = e?.target;
        let { itemName: itemNameField, itemImageLink, itemSubtask: itemSubtaskField, itemDescriptionField } = form;
        let itemName = itemNameField?.value;
        let imageLink = itemImageLink?.value;
        let itemSubtask = itemSubtaskField?.value;
        let itemDescription = itemDescriptionField?.value;
        item.complete = active == `active` ? false : true;
        item.updated = formatDate(new Date());
        item.description = itemDescription;
        item.content = itemName;
        item.image = imageLink;
        if (itemSubtask != ``) {
            item.subtasks.push({
                id: `${item?.subtasks?.length + 1}_subtask_${generateUniqueID(IDs)}`,
                created: formatDate(new Date()),
                task: capWords(itemSubtask),
                complete: false,
            });
        }
        localStorage.setItem(`boards`, JSON.stringify(boards));
        setBoards(JSON.parse(localStorage.getItem(`boards`)) || []);
        let closeButton: any = document.querySelector(`.alertButton`);
        if (closeButton) closeButton.click();
    }

    return (
        <div id={`detail_view_${item?.id}`} className={`detailView flex row`}>
            {image && (
                <figure className={`customDetailImage`} style={{ maxWidth: `40%` }}>
                    <CustomImage 
                        src={image} 
                        alt={item?.content} 
                        onError={(e) => setDisabled(true)} 
                        onLoad={(e) => setDisabled(false)} 
                        className={`itemImage detailViewImage`} 
                    />
                </figure>
            )}
            <form onInput={(e) => refreshDetails(e)} onSubmit={(e) => saveItem(e)} className={`changeInputs flex isColumn`} data-index={index + 1}>
                <div className={`formTop`}>
                    <h3>
                        <strong>
                            {item?.type}
                        </strong>
                    </h3>
                    {renderProgressChart(item?.subtasks, item, active, active === `active` ? 0 : null)}
                </div>
                <div className={`toggle-buttons`}>
                    <div 
                        onClick={() => setActive(`active`)}
                        className={`toggle-button iconButton ${active === `active` ? `active` : ``}`} 
                    >
                        <input 
                            type={`radio`} 
                            value={`active`} 
                            onChange={() => {}} 
                            name={`toggleActive`} 
                            checked={active === `active`} 
                        />
                        <label>
                            Active
                        </label>
                    </div>
                    <div 
                        onClick={() => setActive(`complete`)}
                        className={`toggle-button iconButton ${active === `complete` ? `active` : ``}`} 
                    >
                        <input 
                            type={`radio`} 
                            value={`complete`} 
                            onChange={() => {}} 
                            name={`toggleComplete`} 
                            checked={active === `complete`} 
                        />
                        <label>
                            Complete
                        </label>
                    </div>
                </div>
                <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                    <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                        Title
                    </div>
                    <input type={`text`} name={`itemName`} className={`itemNameField`} placeholder={`Item Name`} defaultValue={item?.content} />
                </div>
                <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                    <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                        Description
                    </div>
                    <textarea name={`itemDescriptionField`} className={`itemDescriptionField`} placeholder={`Item Description`} defaultValue={item?.description} />
                </div>
                <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                    <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                        Image
                    </div>
                    <input type={`text`} name={`itemImageLink`} className={`itemImageLinkField`} placeholder={`Item Image`} defaultValue={item?.image} />
                </div>
                <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                    <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                        Video
                    </div>
                    <input type={`text`} name={`itemVideoLink`} className={`itemVideoLinkField`} placeholder={`Item Video`} defaultValue={item?.video} />
                </div>
                <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                    <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                        Subtask
                    </div>
                    <input type={`text`} name={`itemSubtask`} className={`itemSubtaskField`} placeholder={`Item Subtask`} />
                </div>
                <div className="toggle-buttons">
                    {/* <button onClick={(e) => deleteItem(e)} className={`iconButton deleteButton`}>Delete</button> */}
                    <button disabled={disabled} className={`iconButton saveButton`} type={`submit`}>
                        Save
                    </button>
                </div>
            </form>
        </div>
    )
}