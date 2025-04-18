import Tasks from './tasks';
import Tags from './details/tags';
import Progress from '../progress';
import ItemWrapper from './itemwrapper';
import CustomImage from '../custom-image';
import { Task } from '../../shared/models/Task';
import { Item } from '../../shared/models/Item';
import DetailField from './details/detail-field';
// import RelatedURLs from './details/related-urls';
import ToggleButtons from './details/toggle-buttons';
// import { doc, onSnapshot } from 'firebase/firestore';
// import RelatedURLsDND from './details/related-urls-dnd';
import { updateDocFieldsWTimeStamp } from '../../firebase';
import { TasksFilterStates } from '../../shared/types/types';
import { capWords, dev, StateContext } from '../../pages/_app';
import { useContext, useEffect, useRef, useState } from 'react';

export default function ItemDetail(props) {
    let formRef = useRef(null);
    let { item: itemProp, index, tasks: tasksProp, activeTasks, completeTasks, board, column } = props;

    let { selected, globalUserData } = useContext<any>(StateContext);

    let [item, setItem] = useState<Item>(itemProp);
    let [formStatus, setFormStatus] = useState(``);
    let [imageErrorText, ] = useState(`Image Error`);
    let [tasks, setTasks] = useState<Task[]>(tasksProp);
    let [image, setImage] = useState((itemProp?.image && itemProp?.image != ``) ? itemProp?.image : undefined);
    let [active, setActive] = useState(
        item?.options?.complete 
        ? `complete` 
        : (item?.options?.active || activeTasks?.length > 0 || completeTasks?.length > 0) 
        ? `active` 
        : `to do`
    );

    useEffect(() => {
        const updatedTasks = [];
        const refreshedItem = globalUserData?.items?.find((itm: Item) => itm?.id == itemProp?.id);
        const refreshedTasks = globalUserData?.tasks?.filter((tsk: Task) => tsk?.itemID == itemProp?.id);
        refreshedItem?.data?.taskIDs?.forEach(tskID => {
            const thisTask = refreshedTasks?.find((tsk: Task) => tsk?.id == tskID);
            if (thisTask) updatedTasks?.push(thisTask);
        })
        setTasks(updatedTasks);
        const updatedItemAndTasks = { ...refreshedItem, tasks: updatedTasks };
        setItem(updatedItemAndTasks);
    }, [globalUserData])

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
        if (formField?.name == `itemImageLink`) setImage(formField?.value);
        // if (formRef != null) {
        //     let form = formRef?.current;
        //     let { itemURL: itemURLField } = form;
        //     if (itemURLField) {
        //         let itemURL = itemURLField?.value;
        //         let itemURLLowercased = itemURL?.toLowerCase();
        //         let lowercasedCurrentURLs = item?.data?.relatedURLs?.map(url => url?.toLowerCase());
        //         let URLAlreadyLinked = itemURLLowercased != `` && lowercasedCurrentURLs?.includes(itemURLLowercased);
        //         updateFormStatus(`URL already linked`, !URLAlreadyLinked);
        //     }
        // }
    }

    const saveItem = async (e, dismissOnSave = false) => {
        e.preventDefault();

        let form = e?.target;

        let { 
            itemImageLink, 
            itemDescriptionField,
            // itemURL: itemURLField, 
            itemName: itemNameField, 
        } = form;

        // let itemURL = itemURLField?.value;
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
        // let urlChanged = itemURL?.toLowerCase() != item?.data?.relatedURLs[0]?.toLowerCase() && !item?.data?.relatedURLs?.includes(itemURL);

        if (statusChanged || nameChanged || imageChanged || descriptionChanged) {
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
                // ...(urlChanged && {
                //     [`data.relatedURLs`]: [itemURL, ...item?.data?.relatedURLs],
                // }),
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
            {selected != null && (
                <form ref={formRef} onInput={(e) => refreshDetails(e)} onSubmit={(e) => saveItem(e)} className={`changeInputs flex isColumn`} data-index={index + 1}>
                    <div className={`formTop`}>
                        <div className={`detailsColumn detailStart detailEdge formStartData formTopLeft flexColumn gap10`} style={{ minWidth: 255 }}>
                            <div className={`itemDetailFieldMetric flexLabel`}>
                                <h4 className={`itemDetailType`}><strong>Type:</strong></h4>
                                <h4 className={`itemDetailType`}>{item?.type}</h4>
                            </div>
                            <div className={`itemDetailFieldMetric flexLabel`}>
                                <h4 className={`itemDetailType`}><strong>ID:</strong></h4>
                                <h4 className={`itemDetailType`}>
                                    <ItemWrapper>    
                                        <Tags item={item} parentClass={`itemDetailContentsTagParent itemContents`} className={`IDTag`} />
                                    </ItemWrapper>
                                </h4>
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
                        {dev() && (item?.data?.taskIDs?.length > 0 || item?.data?.tags?.length > 0) && (
                            <div className={`formCenterData detailCenter formTopLeft flexColumn gap10`}>
                                {item?.data?.taskIDs?.length > 0 && <>
                                    <div className={`itemDetailTasksLabel itemDetailFieldMetric flexLabel`}>
                                        <h4 className={`itemDetailType`}><strong>Tasks:</strong></h4>
                                        <h4 className={`itemDetailType`}>{item?.data?.taskIDs?.length}</h4>
                                    </div>
                                    <ItemWrapper>
                                        <Tasks 
                                            item={item} 
                                            board={board}
                                            column={column} 
                                            showForm={true} 
                                            tasksProp={tasks}
                                        />
                                    </ItemWrapper>
                                </>}
                                {/* {dev() && item?.data?.tags?.length > 0 && <>
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
                                </>} */}
                            </div>
                        )}
                        <Progress 
                            item={item} 
                            tasks={tasks}
                            customInnerText={false}
                            classes={`detailViewProgress detailsColumn detailEdge detailEnd`} 
                            injectedProgress={active === `complete` ? 100 : active === `to do` ? 0 : item?.data?.taskIDs?.length == 0 ? 50 : undefined} 
                        />
                    </div>
                    <ToggleButtons item={item} activeTasks={tasks?.filter((tsk: Task) => tsk?.options?.active)} completeTasks={tasks?.filter((tsk: Task) => tsk?.options?.complete)} onActiveChange={(newActive) => setActive(newActive)} />
                    <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                        <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                            Name
                        </div>
                        <input type={`text`} name={`itemName`} className={`itemNameField`} placeholder={`Item Name`} defaultValue={item?.name} />
                    </div>
                    <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                        <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                            Image
                        </div>
                        <input type={`text`} name={`itemImageLink`} className={`itemImageLinkField`} placeholder={`Item Image`} defaultValue={item?.image} />
                    </div>
                    <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                        <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                            Description
                        </div>
                        <textarea name={`itemDescriptionField`} className={`itemDescriptionField`} placeholder={`Item Description`} defaultValue={item?.description} />
                    </div>
                    {/* <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                        <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                            Video
                        </div>
                        <input type={`text`} name={`itemVideoLink`} className={`itemVideoLinkField`} placeholder={`Item Video`} defaultValue={item?.video} />
                    </div> */}
                    {/* <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                        <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                            URL
                        </div>
                        <input type={`url`} name={`itemURL`} className={`itemURLField`} placeholder={`https Item URL`} pattern={`https?://.*`} />
                    </div> */}
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
            )}
        </div>
    )
}