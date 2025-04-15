import Progress from '../progress';
import CustomImage from '../custom-image';
import { Item } from '../../shared/models/Item';
import DetailField from './details/detail-field';
import { capWords, dev } from '../../pages/_app';
// import RelatedURLs from './details/related-urls';
import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import RelatedURLsDND from './details/related-urls-dnd';
import { db, itemsTable, updateDocFieldsWTimeStamp } from '../../firebase';

export default function ItemDetail(props) {
    let formRef = useRef(null);
    let { item: itemProp, index, tasks, activeTasks, completeTasks } = props;

    let [item, setItem] = useState<Item>(itemProp);
    let [formStatus, setFormStatus] = useState(``);
    let [imageErrorText, ] = useState(`Image Error`);
    let [image, setImage] = useState(props.item.image ?? undefined);
    let [active, setActive] = useState(item?.options?.complete ? `complete` : (item?.options?.active || activeTasks?.length > 0 || completeTasks?.length > 0) ? `active` : `to do`);

    useEffect(() => {
        const itemListener = onSnapshot(doc(db, itemsTable, itemProp.id), (docSnap) => {
            if (docSnap.exists()) {
              const updatedItem = docSnap.data();
              const refreshedItem = new Item(updatedItem);
              setItem(refreshedItem);
            }
        });
        return () => itemListener();
    }, [])

    const updateFormStatus = (statusText: string = ``, clear = false) => {
        if (statusText == ``) {
            setFormStatus(statusText);
        } else {
            if (clear) {
                if (formStatus?.includes(statusText)) {
                    if (formStatus?.includes(`,`)) {
                        setFormStatus(prevFormStatus => prevFormStatus?.replaceAll(`, ${statusText}`, ``));
                    } else {
                        setFormStatus(prevFormStatus => prevFormStatus?.replaceAll(statusText, ``));
                    }
                }
            } else {
                if (formStatus == ``) {
                    setFormStatus(statusText);
                } else {
                    setFormStatus(prevFormStatus => prevFormStatus + `, ${statusText}`);
                }
            }
        }
    }

    const refreshDetails = (e) => {
        e.preventDefault();

        let formField = e?.target;

        if (formField?.name == `itemImageLink`) {
            setImage(formField?.value);
        }

        if (formRef != null) {
            let form = formRef?.current;

            let { 
                itemURL: itemURLField, 
            } = form;

            if (itemURLField) {
                let itemURL = itemURLField?.value;
                let itemURLLowercased = itemURL?.toLowerCase();
                let lowercasedCurrentURLs = item?.data?.relatedURLs?.map(url => url?.toLowerCase());
                let URLAlreadyLinked = itemURLLowercased != `` && lowercasedCurrentURLs?.includes(itemURLLowercased);
                updateFormStatus(`URL already linked`, !URLAlreadyLinked);
            }
        }
    }

    const saveItem = async (e, dismissOnSave = false) => {
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

        let itemActive = active == `active`;
        let itemComplete = active == `complete`;
        let activeStatusChanged = itemActive != item?.options?.active;
        let completionStatusChanged = itemComplete != item?.options?.complete;

        let statusChanged = activeStatusChanged || completionStatusChanged;

        let nameChanged = itemName?.toLowerCase() != item?.name?.toLowerCase();
        let imageChanged = itemImage?.toLowerCase() != item?.image?.toLowerCase();
        let descriptionChanged = itemDescription?.toLowerCase() != item?.description?.toLowerCase();
        let urlChanged = itemURL?.toLowerCase() != item?.data?.relatedURLs[0]?.toLowerCase() && !item?.data?.relatedURLs?.includes(itemURL);

        if (statusChanged || nameChanged || imageChanged || urlChanged || descriptionChanged) {
            await updateDocFieldsWTimeStamp(item, {
                ...(item?.data?.taskIDs?.length > 0 ? {
                    ...(completionStatusChanged && {
                        [`options.complete`]: itemComplete,
                    }),
                } : {
                    ...(statusChanged && {
                        ...(activeStatusChanged && {
                            [`options.active`]: itemActive,
                        }),
                        ...(completionStatusChanged && {
                            [`options.complete`]: itemComplete,
                        }),
                    }),
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

        if (dismissOnSave) {
            let closeButton: any = document.querySelector(`.alertButton`);
            if (closeButton) closeButton.click();
        } else {
            form?.reset();
        }
    }

    return (
        <div id={`detail_view_${item?.id}`} className={`detailView flex row`}>
            {image && (
                <figure className={`customDetailImage`} style={{ maxWidth: `40%` }}>
                    <CustomImage 
                        src={image} 
                        alt={item?.name} 
                        className={`itemImage detailViewImage`} 
                        onError={(e) => updateFormStatus(imageErrorText)} 
                        onLoad={(e) => updateFormStatus(imageErrorText, true)} 
                    />
                </figure>
            )}
            <form ref={formRef} onInput={(e) => refreshDetails(e)} onSubmit={(e) => saveItem(e)} className={`changeInputs flex isColumn`} data-index={index + 1}>
                <div className={`formTop`}>
                    <div className={`formStartData formTopLeft flexColumn gap10`} style={{ minWidth: 255 }}>
                        <div className={`itemDetailFieldMetric flexLabel`}>
                            <h4 className={`itemDetailType`}><strong>Type:</strong></h4>
                            <h4 className={`itemDetailType`}>{item?.type}</h4>
                        </div>
                        <div className={`itemDetailFieldMetric flexLabel`}>
                            <h4 className={`itemDetailType`}><strong>Status:</strong></h4>
                            <DetailField item={item} tasks={tasks} />
                        </div>
                        <div className={`itemDetailFieldMetric flexLabel`}>
                            <h4 className={`itemDetailType`}><strong>Created:</strong></h4>
                            <h4 className={`itemDetailType`}>{item?.meta?.created}</h4>
                        </div>
                        <div className={`itemDetailFieldMetric flexLabel`}>
                            <h4 className={`itemDetailType`}><strong>Updated:</strong></h4>
                            <h4 className={`itemDetailType`}>{item?.meta?.updated}</h4>
                        </div>
                    </div>
                    {(item?.data?.taskIDs?.length > 0 || item?.data?.tags?.length > 0 || item?.data?.relatedURLs?.length > 0) && (
                        <div className={`formCenterData formTopLeft flexColumn gap10`}>
                            {item?.data?.taskIDs?.length > 0 && <>
                                <div className={`itemDetailTasksLabel itemDetailFieldMetric flexLabel`}>
                                    <h4 className={`itemDetailType`}><strong>Tasks:</strong></h4>
                                    <h4 className={`itemDetailType`}>{item?.data?.taskIDs?.length}</h4>
                                </div>
                            </>}
                            {dev() && item?.data?.tags?.length > 0 && <>
                                <div className={`itemDetailTagsLabel itemDetailFieldMetric flexLabel`}>
                                    <h4 className={`itemDetailType`}><strong>Tags:</strong></h4>
                                    <h4 className={`itemDetailType`}>{item?.data?.tags?.length}</h4>
                                </div>
                                <div className={`itemDetailTags itemDetailFieldMetric flexLabel`}>
                                    {item?.data?.tags?.map((tag, tagIndex) => (
                                        <div key={tagIndex} className={`itemTag`}>
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </>}
                            {item?.data?.relatedURLs?.length > 0 && <>
                                <div className={`itemDetailURLsField itemDetailFieldMetric flexLabel`}>
                                    <div className={`itemDetailURLsFieldLabels flexLabel`}>
                                        <h4 className={`itemDetailType`}><strong>URLs:</strong></h4>
                                        <h4 className={`itemDetailSubType`}>{item?.data?.relatedURLs?.length}</h4>
                                    </div>
                                    <RelatedURLsDND item={item} />
                                </div>
                            </>}
                        </div>
                    )}
                    <Progress 
                        item={item} 
                        tasks={tasks}
                        customInnerText={false}
                        classes={`detailViewProgress`} 
                        injectedProgress={active === `complete` ? 100 : active === `to do` ? 0 : item?.data?.taskIDs?.length == 0 ? 50 : undefined} 
                    />
                </div>
                <div className={`toggle-buttons`}>
                    {item?.data?.taskIDs?.length == 0 && <>
                        <div 
                            onClick={() => setActive(`to do`)}
                            className={`toggle-button iconButton ${(active === `to do` || (item?.options?.active == false && active == `to do`)) ? `active` : ``}`} 
                        >
                            <input 
                                type={`radio`} 
                                value={`active`} 
                                onChange={() => {}} 
                                name={`toggleActive`} 
                                checked={(active === `to do` || (item?.options?.active == false && active == `to do`))} 
                            />
                            <label className={`flexLabel`}>
                                <i className={`fas fa-plus`} />
                                To Do
                            </label>
                        </div>
                    </>}
                    <div 
                        onClick={() => setActive(`active`)}
                        className={`toggle-button iconButton ${(active === `active` || (active == `active` && (activeTasks?.length > 0 || completeTasks?.length > 0))) ? `active` : ``}`} 
                    >
                        <input 
                            type={`radio`} 
                            value={`active`} 
                            onChange={() => {}} 
                            name={`toggleActive`} 
                            checked={(active === `active` || (active == `active` && (activeTasks?.length > 0 || completeTasks?.length > 0)))} 
                        />
                        <label className={`flexLabel`}>
                            <i className={`fas fa-play-circle`} />
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
                        <label className={`flexLabel`}>
                            <i className={`fas fa-check-circle`} />
                            Done
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
                    <input type={`url`} name={`itemURL`} className={`itemURLField`} placeholder={`https Item URL`} pattern={`https?://.*`} />
                </div>
                {/* <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                    <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                        Subtask
                    </div>
                    <input type={`text`} name={`itemTask`} className={`itemTaskField`} placeholder={`Item Task`} />
                </div> */}
                {/* {formStatus != `` && (
                    <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                        <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end`, color: `red` }}>
                            {formStatus}
                        </div>
                    </div>
                )} */}
                <div className={`toggle-buttons`}>
                    {/* <button className={`iconButton deleteButton`}>
                        Delete
                    </button> */}
                    <button type={`submit`} title={formStatus != `` ? formStatus : undefined} disabled={formStatus != ``} className={`iconButton saveButton ${formStatus != `` ? `pointerEventsNone` : ``}`} style={{ color: formStatus != `` ? `red` : `black` }}>
                        {formStatus != `` ? formStatus : `Save`}
                    </button>
                </div>
            </form>
        </div>
    )
}