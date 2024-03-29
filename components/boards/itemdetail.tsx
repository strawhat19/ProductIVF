import Image from 'next/image';
import { useState } from 'react';
import { capWords, formatDate, generateUniqueID } from '../../pages/_app';
import { getSubTaskPercentage } from './column';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';

export default function ItemDetail(props) {
    let [disabled, setDisabled] = useState(false);
    let [image, setImage] = useState(props.item.image ?? undefined);
    const { item, index, board, boards, setBoards, IDs, setIDs } = props;
    const [active, setActive] = useState(item?.complete ? `complete` : `active`);

    const saveItem = (e) => {
        e.preventDefault();
        console.log(`saveItem`, e);
        let formFields = e.target.children;
        let itemName = formFields.itemName.value;
        let imageLink = formFields.itemImageLink.value;
        let itemSubtask = formFields.itemSubtask.value;
        item.complete = active == `active` ? false : true;
        item.updated = formatDate(new Date());
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
                <img className={`itemImage detailViewImage`} src={image} alt={item?.content} onError={(e) => setDisabled(true)} onLoad={(e) => setDisabled(false)} />
            )}
            <form onInput={(e) => refreshDetails(e)} onSubmit={(e) => saveItem(e)} className={`changeInputs flex isColumn`} data-index={index + 1}>
                <div className={`formTop`}>
                    <h3><strong>{item?.content}</strong> - Details</h3>
                    {item.subtasks.length > 0 && <div className={`progress`} title={`Progress: ${getSubTaskPercentage(item.subtasks)}%`}>
                        <CircularProgressbar value={getSubTaskPercentage(item.subtasks)} text={`${getSubTaskPercentage(item.subtasks)}%`} styles={buildStyles({
                            // Rotation of path and trail, in number of turns (0-1)
                            rotation: 0.5,

                            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                            strokeLinecap: 'butt',

                            // Text size
                            textSize: '24px',

                            // How long animation takes to go from one percentage to another, in seconds
                            pathTransitionDuration: 0.5,

                            // Can specify path transition in more detail, or remove it entirely
                            // pathTransition: 'none',

                            // Colors
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
                <input type={`text`} name={`itemName`} placeholder={`Item Name`} defaultValue={item?.content} />
                <input type={`text`} name={`itemImageLink`} placeholder={`Item Image`} defaultValue={item?.image} />
                <input type={`text`} name={`itemVideoLink`} placeholder={`Item Video`} defaultValue={item?.video} />
                <input type={`text`} name={`itemSubtask`} placeholder={`Item Subtask`} />
                <div className="toggle-buttons">
                    {/* <button onClick={(e) => deleteItem(e)} className={`iconButton deleteButton`}>Delete</button> */}
                    <button disabled={disabled} className={`iconButton saveButton`} type={`submit`}>Save</button>
                </div>
            </form>
        </div>
    )
}