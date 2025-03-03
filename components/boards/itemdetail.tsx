import { useState } from 'react';
import Progress from '../progress';
import CustomImage from '../custom-image';
import { capWords } from '../../pages/_app';
import { updateDocFieldsWTimeStamp } from '../../firebase';

export default function ItemDetail(props) {
    let { item, index, tasks } = props;

    let [disabled, setDisabled] = useState(false);
    let [image, setImage] = useState(props.item.image ?? undefined);
    let [active, setActive] = useState(item?.options?.complete ? `complete` : `active`);

    const refreshDetails = (e) => {
        e.preventDefault();
        if (e.target.name == `itemImageLink`) {
            setImage(e.target.value);
        }
    }

    const saveItem = async (e) => {
        e.preventDefault();
        let form = e?.target;
        let { 
            itemImageLink, 
            itemDescriptionField,
            itemURL: itemURLField, 
            itemName: itemNameField, 
        } = form;

        let itemURL = itemURLField?.value;
        let itemName = itemNameField?.value;
        let itemImage = itemImageLink?.value;
        let itemDescription = itemDescriptionField?.value;
        let itemComplete = active == `active` ? false : true;

        let completionStatusChanged = itemComplete != item?.options?.complete;
        let nameChanged = itemName?.toLowerCase() != item?.name?.toLowerCase();
        let imageChanged = itemImage?.toLowerCase() != item?.image?.toLowerCase();
        let descriptionChanged = itemDescription?.toLowerCase() != item?.description?.toLowerCase();
        let urlChanged = itemURL?.toLowerCase() != item?.data?.relatedURLs[0]?.toLowerCase() && !item?.data?.relatedURLs?.includes(itemURL);

        if (completionStatusChanged || nameChanged || imageChanged || urlChanged || descriptionChanged) {
            await updateDocFieldsWTimeStamp(item, {
                ...(completionStatusChanged && {
                    [`options.complete`]: itemComplete,
                }),
                ...(urlChanged && {
                    [`data.relatedURLs`]: [itemURL, ...item?.data?.relatedURLs],
                }),
                ...(descriptionChanged && {
                    description: itemDescription,
                }),
                ...(imageChanged && {
                    image: itemImage,
                    [`data.imageURLs`]: [itemImage, ...item?.data?.imageURLs],
                }),
                ...(nameChanged && {
                    A: capWords(itemName),
                    name: capWords(itemName),
                    title: `${item?.type} ${item?.rank} ${capWords(itemName)}`,
                }),
            })
        }

        let closeButton: any = document.querySelector(`.alertButton`);
        if (closeButton) closeButton.click();
    }

    return (
        <div id={`detail_view_${item?.id}`} className={`detailView flex row`}>
            {image && (
                <figure className={`customDetailImage`} style={{ maxWidth: `40%` }}>
                    <CustomImage 
                        src={image} 
                        alt={item?.name} 
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
                    <Progress 
                        item={item} 
                        tasks={tasks}
                        classes={`detailViewProgress`} 
                        injectedProgress={active === `complete` ? 100 : undefined} 
                    />
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
                        Name
                    </div>
                    <input type={`text`} name={`itemName`} className={`itemNameField`} placeholder={`Item Name`} defaultValue={item?.name} />
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
                {/* <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                    <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                        Video
                    </div>
                    <input type={`text`} name={`itemVideoLink`} className={`itemVideoLinkField`} placeholder={`Item Video`} defaultValue={item?.video} />
                </div> */}
                <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                    <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                        URL
                    </div>
                    <input type={`text`} name={`itemURL`} className={`itemURLField`} placeholder={`Item URL`} />
                </div>
                {/* <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                    <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                        Subtask
                    </div>
                    <input type={`text`} name={`itemTask`} className={`itemTaskField`} placeholder={`Item Task`} />
                </div> */}
                <div className="toggle-buttons">
                    {/* <button className={`iconButton deleteButton`}>
                        Delete
                    </button> */}
                    <button disabled={disabled} className={`iconButton saveButton`} type={`submit`}>
                        Save
                    </button>
                </div>
            </form>
        </div>
    )
}