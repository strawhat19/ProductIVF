import { useState } from 'react';
import CustomImage from '../custom-image';
import { getSubTaskPercentage } from './column';
import { capWords, formatDate, generateUniqueID } from '../../pages/_app';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';

export default function ItemDetail(props) {
    let [disabled, setDisabled] = useState(false);
    let [image, setImage] = useState(props.item.image ?? undefined);
    const { item, index, board, boards, setBoards, IDs, setIDs } = props;
    const [active, setActive] = useState(item?.complete ? `complete` : `active`);

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

    const deleteItem = (e) => {
        e.preventDefault();
        console.log(`deleteItem`, e);
       
        delete board.items[item.id];
            
        Object.values(board.columns).forEach((column: any) => {
            const itemIndex = column.itemIds.indexOf(item.id);
            if (itemIndex !== -1) {
                column.itemIds.splice(itemIndex, 1);
            }
        });

        board.updated = formatDate(new Date());

        localStorage.setItem(`boards`, JSON.stringify(boards));
        setBoards(JSON.parse(localStorage.getItem(`boards`)) || []);
        let closeButton: any = document.querySelector(`.alertButton`);
        if (closeButton) closeButton.click();
    }

    const refreshDetails = (e) => {
        e.preventDefault();
        if (e.target.name == `itemImageLink`) {
            setImage(e.target.value);
        }
    }

    return (
        <div id={`detail_view_${item?.id}`} className={`detailView flex row`}>
            {image && (
            //     <Image
            //     className={`itemImage detailViewImage`}
            //     src={image}
            //     alt={item?.content}
            //     layout={`responsive`}
            //     width={500}
            //     height={500}
            //     onError={(e) => setDisabled(true)}
            //     onLoad={(e) => setDisabled(false)}
            //     onLoadingComplete={(result: any) => {
            //       if (result.error) {
            //         console.log(`Error`);
            //         setDisabled(true);
            //       } else {
            //         console.log(`Image Loaded`);
            //         setDisabled(false);
            //       }
            //     }}
            //   />
                <figure className={`customDetailImage`} style={{ maxWidth: `40%` }}>
                    <CustomImage 
                        src={image} 
                        alt={item?.content} 
                        className={`itemImage detailViewImage`} 
                        onError={(e) => setDisabled(true)} onLoad={(e) => setDisabled(false)} 
                    />
                </figure>
            )}
            <form onInput={(e) => refreshDetails(e)} onSubmit={(e) => saveItem(e)} className={`changeInputs flex isColumn`} data-index={index + 1}>
                <div className={`formTop`}>
                    <h3><strong>{item?.type}</strong></h3>
                    {item.subtasks.length > 0 && <div className={`progress`} title={`Progress: ${getSubTaskPercentage(item.subtasks)}%`}>
                        <CircularProgressbar value={getSubTaskPercentage(item.subtasks)} text={`${getSubTaskPercentage(item.subtasks)}%`} styles={buildStyles({
                            rotation: 0.5,
                            strokeLinecap: 'butt',
                            textSize: '24px',
                            pathTransitionDuration: 0.5,
                            pathColor: getSubTaskPercentage(item.subtasks) < 100 ? `rgba(0, 194, 255, ${getSubTaskPercentage(item.subtasks) / 100})` : `#00c2ff`,
                            trailColor: 'rgba(0, 194, 255, 0.2)',
                            backgroundColor: '#3e98c7',
                            textColor: '#fff',
                        })} />
                    </div>}
                </div>
                <div className={`toggle-buttons`}>
                    <div className={`toggle-button iconButton ${active === `active` ? `active` : ``}`} onClick={() => setActive(`active`)}>
                        <input type={`radio`} name={`toggleActive`} value={`active`} checked={active === `active`} onChange={() => {}} />
                        <label>Active</label>
                    </div>
                    <div className={`toggle-button iconButton ${active === `complete` ? `active` : ``}`} onClick={() => setActive(`complete`)}>
                        <input type={`radio`} name={`toggleComplete`} value={`complete`} checked={active === `complete`} onChange={() => {}} />
                        <label>Complete</label>
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