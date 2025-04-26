import Tasks from './tasks';
import Tags from './details/tags';
import Progress from '../progress';
import ItemWrapper from './itemwrapper';
import CustomImage from '../custom-image';
import { Task } from '../../shared/models/Task';
import { Item } from '../../shared/models/Item';
import DetailField from './details/detail-field';
import ToggleButtons from './details/toggle-buttons';
import { updateDocFieldsWTimeStamp } from '../../firebase';
import { capitalizeAllWords, capWords, dev, StateContext } from '../../pages/_app';
import { useContext, useEffect, useRef, useState } from 'react';
import { forceFieldBlurOnPressEnter, removeExtraSpacesFromString } from '../../shared/constants';

export default function ItemDetail(props) {
    let formRef = useRef(null);
    let { itemID, item: itemProp, index, tasks: tasksProp, activeTasks, completeTasks, board, column } = props;

    let { selected, setSelected, globalUserData } = useContext<any>(StateContext);

    let [item, setItem] = useState<Item>(itemProp);
    let [formStatus, setFormStatus] = useState(``);
    // let [imageErrorText, ] = useState(`Image Error`);
    let [tasks, setTasks] = useState<Task[]>(tasksProp);
    let [validSelectedImage, setValidSelectedImage] = useState(false);
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
        const refreshedItem = globalUserData?.items?.find((itm: Item) => itm?.id == itemID);
        const refreshedTasks = globalUserData?.tasks?.filter((tsk: Task) => tsk?.itemID == itemID);
        refreshedItem?.data?.taskIDs?.forEach(tskID => {
            const thisTask = refreshedTasks?.find((tsk: Task) => tsk?.id == tskID);
            if (thisTask) updatedTasks?.push(thisTask);
        })
        setTasks(updatedTasks);
        const updatedItemAndTasks = { ...refreshedItem, tasks: updatedTasks };
        setItem(updatedItemAndTasks);
        if (updatedItemAndTasks != null) {
            setSelected(prevSelected => ({ ...prevSelected, item: updatedItemAndTasks }));
        }
    }, [globalUserData])

    // const updateFormStatus = (statusText: string = ``, clear = false) => {
    //     if (statusText == ``) {
    //         setFormStatus(statusText);
    //     } else {
    //         if (clear) {
    //             if (formStatus?.includes(statusText)) {
    //                 if (formStatus?.includes(`,`)) {
    //                     setFormStatus(prevFormStatus => prevFormStatus?.replaceAll(`, ${statusText}`, ``));
    //                 } else {
    //                     setFormStatus(prevFormStatus => prevFormStatus?.replaceAll(statusText, ``));
    //                 }
    //             }
    //         } else {
    //             if (formStatus == ``) {
    //                 setFormStatus(statusText);
    //             } else {
    //                 setFormStatus(prevFormStatus => prevFormStatus + `, ${statusText}`);
    //             }
    //         }
    //     }
    // }

    const refreshDetails = (e) => {
        e.preventDefault();
        let formField = e?.target;
        if (formField?.name == `itemImageLink`) {
            const updatedImage = formField?.value;
            // dev() && console.log(`Item Detail Form Change`, {detailViewImage, updatedImage});
            setImage(updatedImage);
            const detailViewImage: HTMLImageElement = document?.querySelector(`.detailViewImage`);
            if (detailViewImage || updatedImage == ``) {
                setValidSelectedImage(true);
                setFormStatus(``);
            }
        }
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

        // let form = e?.target;
        let form = formRef?.current;

        let { 
            itemImageLink, 
            itemDescriptionField,
            itemName: itemNameField, 
            // itemURL: itemURLField, 
        } = form;

        // let itemURL = itemURLField?.value;
        let itemName = itemNameField?.value;
        let itemDescription = itemDescriptionField?.value;
        let itemImage = itemImageLink ? itemImageLink?.value : ``;

        let itemActive = active == `active`;
        let itemComplete = active == `complete`;
        let activeStatusChanged = itemActive != item?.options?.active;
        let completionStatusChanged = itemComplete != item?.options?.complete;

        let statusChanged = activeStatusChanged || completionStatusChanged;

        let nameChanged = itemName?.toLowerCase() != item?.name?.toLowerCase();
        let descriptionChanged = itemDescription?.toLowerCase() != item?.description?.toLowerCase();
        let imageChanged = itemImage && itemImage != `` && (itemImage?.toLowerCase() != item?.image?.toLowerCase());
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

    const onItemShowFormChange = async (e) => {
        e?.preventDefault();
        await updateDocFieldsWTimeStamp(selected?.item, { [`options.showTaskForm`]: !item?.options?.showTaskForm });
    }

    const imageLoaded = (e) => {
        const imageComponent = e?.target;
        // console.log(`Image Loaded`, { e, complete: imageComponent?.complete, width: imageComponent?.naturalWidth, height: imageComponent?.naturalHeight });
        if (imageComponent?.complete && imageComponent?.naturalWidth > 0) {
            setValidSelectedImage(true);
            setFormStatus(``);
        }
    }
  
    const imageErrored = (e) => {
        const imageComponent = e?.target;
        dev() && console.log(`Image Errored`, { e, complete: imageComponent?.complete, width: imageComponent?.naturalWidth, height: imageComponent?.naturalHeight });
        setValidSelectedImage(false);
        setFormStatus(`Image Error`);
    }

    const formSubmitOnEnter = (e) => {
        const queryFields = [e?.key, e?.keyCode];
        const submitKeys = [13, `Enter`, `Return`];
        const shouldSubmitOnEnter = queryFields?.some(fld => submitKeys?.includes(fld));
        if (shouldSubmitOnEnter) {
            saveItem(e);
        }
    }

    const changeLabel = (e, item: Item) => {
            let elemValue = e.target.textContent;
            let invalidValue = !elemValue || elemValue == ``;
            let sameName = elemValue?.toLowerCase() == item?.name?.toLowerCase();
    
            if (invalidValue || sameName) {
                elemValue = capitalizeAllWords(item?.name);
                e.target.innerHTML = elemValue;
                return;
            } else {
                let value = elemValue == `` ? capitalizeAllWords(item?.name) : capitalizeAllWords(elemValue);
        
                elemValue = removeExtraSpacesFromString(value);
                elemValue = capitalizeAllWords(elemValue);
                e.target.innerHTML = elemValue;
                const name = elemValue;
        
                updateDocFieldsWTimeStamp(item, { name, A: name, title: `${item?.type} ${item?.rank} ${name}` });
            }
        }

    const DetailsFields = () => {
        return <>
            <div className={`itemDetailFieldMetric flexLabel`}>
                <h4 className={`itemDetailType`}><strong>ID:</strong></h4>
                <h4 className={`itemDetailType`}>
                    <ItemWrapper cursorGrab={false}>    
                        <Tags item={item} extend={true} parentClass={`itemDetailContentsTagParent itemContents`} className={`IDTag`} />
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
        </>
    }

    const TasksField = () => {
        return <>
            <div className={`itemDetailTasksRow flexLabel spaceBetween`}>
                <div className={`itemDetailTasksLabel itemDetailFieldMetric flexLabel`}>
                    <h4 className={`itemDetailType`}><strong>Tasks:</strong></h4>
                    <h4 className={`itemDetailType`}>{item?.data?.taskIDs?.length}</h4>
                </div>
                <div className={`itemDetailTasksLabel itemDetailFieldMetric flexLabel`}>
                    {item?.data?.taskIDs?.length > 0 && (
                        <div className={`toggle-buttons`}>
                            <button className={`taskFormToggleButton flexLabel buttonComponent`} type={`button`} onClick={(e) => onItemShowFormChange(e)}>
                                <i className={`fas ${item?.options?.showTaskForm ? `fa-minus` : `fa-plus`}`} />
                                Tasks
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ItemWrapper>
                <Tasks 
                    item={item} 
                    board={board}
                    column={column} 
                    tasksProp={tasks}
                    showForm={item?.options?.showTaskForm || item?.data?.taskIDs?.length == 0} 
                />
            </ItemWrapper>
        </>
    }

    const FormFields = () => {
        return <>
            {/* <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                    Name
                </div>
                <input onKeyDown={(e) => formSubmitOnEnter(e)} type={`text`} name={`itemName`} className={`itemNameField`} placeholder={`Item Name`} defaultValue={item?.name} />
            </div> */}
            <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                {/* <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                    Image
                </div> */}
                <input onKeyDown={(e) => formSubmitOnEnter(e)} type={`text`} name={`itemImageLink`} className={`itemImageLinkField`} placeholder={`Item Image`} defaultValue={item?.image} />
            </div>
            <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                {/* <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                    Description
                </div> */}
                <textarea name={`itemDescriptionField`} className={`itemDescriptionField`} placeholder={`Item Description`} defaultValue={item?.description} />
            </div>
            <div className={`toggle-buttons`}>
                <button onClick={(e) => saveItem(e)} type={`button`} title={formStatus != `` ? formStatus : undefined} disabled={formStatus != ``} className={`iconButton saveButton ${formStatus != `` ? `pointerEventsNone` : ``}`} style={{ color: formStatus != `` ? `red` : `black` }}>
                    {formStatus != `` ? formStatus : `Save`}
                </button>
            </div>
        </>
    }

    return <>
        <div className={`alertDetailsComponent`}>
            <div className={`alertTitleRowInner`}>
                <div className={`alertTitleRow`}>
                    <h2 className={`alertTitle`}>
                        <span 
                            contentEditable 
                            spellCheck={false}
                            suppressContentEditableWarning 
                            onBlur={(e) => changeLabel(e, item)} 
                            onKeyDown={(e) => forceFieldBlurOnPressEnter(e)}
                            className={`itemDetailsChangeLabel changeLabel stretchEditable itemChangeLabel`}
                        >
                            {item?.name}
                        </span>
                    </h2>
                    <div className={`rightTitleField`}>
                        {selected != null && (
                            <button className={`detailsCloseButton buttonComponent`} onClick={() => setSelected(null)}>
                                <i className={`fas fa-times`} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div id={`detail_view_${item?.id}`} className={`detailView flex row`}>
                <figure className={`customDetailImage ${validSelectedImage ? `validSelectedImage` : `invalidSelectedImage`}`} style={{ maxWidth: `40%` }}>
                    <CustomImage 
                        src={image} 
                        alt={item?.name} 
                        onImageLoad={(e) => imageLoaded(e)} 
                        onImageError={(e) => imageErrored(e)} 
                        className={`itemImage detailViewImage imageLoadElement`} 
                    />
                </figure>
                {selected != null && item != null && item?.type && (
                    <form ref={formRef} onInput={(e) => refreshDetails(e)} onSubmit={(e) => saveItem(e)} className={`itemDetailsForm changeInputs flex isColumn`} data-index={(index ?? 0) + 1}>
                        <div className={`formTop`}>
                            <div className={`detailsStartContent`}>
                                <div className={`detailsColumn detailStart detailEdge formStartData formTopLeft flexColumn gap10`} style={{ minWidth: 255 }}>
                                    {DetailsFields()}
                                </div>
                                <div className={`detailProgress`}>
                                    <Progress 
                                        item={item} 
                                        tasks={tasks}
                                        customInnerText={false}
                                        classes={`detailViewProgress detailsColumn detailEdge detailEnd`} 
                                        injectedProgress={active === `complete` ? 100 : active === `to do` ? 0 : item?.data?.taskIDs?.length == 0 ? 50 : undefined} 
                                    />
                                </div>
                            </div>
                            <div className={`formCenterData detailCenter formTopLeft flexColumn gap10`}>
                                {FormFields()}
                            </div>
                        </div>
                        {(item?.data?.taskIDs?.length == 0 || item?.data?.taskIDs?.length == tasks?.filter((tsk: Task) => tsk?.options?.complete)?.length) && (
                            <ToggleButtons item={item} toDoTasks={tasks?.filter((tsk: Task) => !tsk?.options?.active && !tsk?.options?.complete)} activeTasks={tasks?.filter((tsk: Task) => tsk?.options?.active)} completeTasks={tasks?.filter((tsk: Task) => tsk?.options?.complete)} onActiveChange={(newActive) => setActive(newActive)} />
                        )}
                        <div className={`tasksContainer`}>
                            {TasksField()}
                        </div>
                    </form>
                )}
            </div>
        </div>
    </>
}