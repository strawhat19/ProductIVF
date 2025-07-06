import 'swiper/css';

import Tasks from './tasks';
import Media from '../media';
import DOMPurify from 'dompurify';
import Tags from './details/tags';
import Progress from '../progress';
import TagURL from './details/url';
import ItemWrapper from './itemwrapper';
import Gallery from '../gallery/gallery';
import CustomImage from '../custom-image';
import DropZone from '../drop-zone/drop-zone';
import Editor from '../messages/editor/editor';
import { Task } from '../../shared/models/Task';
import { Item } from '../../shared/models/Item';
import DetailField from './details/detail-field';
import { Swiper, SwiperSlide } from 'swiper/react';
import parse, { Element } from 'html-react-parser';
import ToggleButtons from './details/toggle-buttons';
import { DetailViews } from '../../shared/types/types';
import { convertURLsToHTML } from '../messages/messages';
import { updateDocFieldsWTimeStamp } from '../../firebase';
import { useContext, useEffect, useRef, useState } from 'react';
import { capitalizeAllWords, StateContext } from '../../pages/_app';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { forceFieldBlurOnPressEnter, removeExtraSpacesFromString } from '../../shared/constants';

export const uploadsBaseURL = `https://firebasestorage.googleapis.com/v0/b/productivf.firebasestorage.app/o/`;

export const detailViews = {
    [DetailViews.Tasks]: `fas fa-stream`,
    [DetailViews.Gallery]: `fas fa-images`,
    // [DetailViews.Settings]: `fas fa-cogs`,
    [DetailViews.Summary]: `fas fa-align-left`,
}

export default function ItemDetail(props) {
    let formRef = useRef(null);
    let swiperRef = useRef(null);
    let editorRef = useRef(null);

    let { devEnv, selected, setSelected, globalUserData } = useContext<any>(StateContext);
    let { itemID, item: itemProp, index, tasks: tasksProp, activeTasks, completeTasks, board, column } = props;

    let [editing, setEditing] = useState(false);
    let [item, setItem] = useState<Item>(itemProp);
    let [formStatus, setFormStatus] = useState(``);
    let [tasks, setTasks] = useState<Task[]>(tasksProp);
    let [view, setView] = useState<DetailViews>(DetailViews.Summary);
    let [saveButtonDisabled, setSaveButtonDisabled] = useState(true);
    let [validSelectedImage, setValidSelectedImage] = useState(false);
    let [description, setDescription] = useState(itemProp?.description || `Enter Item Description`);
    let [image, setImage] = useState((itemProp?.image && itemProp?.image != ``) ? itemProp?.image : undefined);

    let [active, setActive] = useState(
        item?.options?.complete 
        ? `complete` 
        : (item?.options?.active || activeTasks?.length > 0 || completeTasks?.length > 0) 
        ? `active` 
        : `to do`
    );

    const slideTo = (position: number = 0, last = false) => {
        const swiper = swiperRef?.current?.swiper;
        if (swiper) {
            if (last) position = swiper.slides.length - 1;
            swiper.slideTo(position);
        }
    }

    // const onEditorBlur = (e) => {
    //     setEditing(false);
    // }

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
        devEnv && console.log(`Item Details`, updatedItemAndTasks);
        setItem(updatedItemAndTasks);
        if (updatedItemAndTasks?.image != `` && updatedItemAndTasks?.image != image) {
            setImage(updatedItemAndTasks?.image);
        }
        setTimeout(() => {
            if (updatedItemAndTasks?.attachments?.length > 3) {
                slideTo(undefined, true);
            }
        }, 500)
    }, [globalUserData])

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

    const refreshDetails = (e) => {
        e.preventDefault();
        let formField = e?.target;
        if (formField?.name == `itemImageLink`) {
            const updatedImage = formField?.value;
            setImage(updatedImage);
            const detailViewImage: HTMLImageElement = document?.querySelector(`.detailViewImage`);
            if (detailViewImage || updatedImage == ``) {
                setValidSelectedImage(true);
                setFormStatus(``);
            }
        }
        let saveDisabled = formStatus != `` || (description == `` || description == item?.description);
        setSaveButtonDisabled(saveDisabled);
    }

    const onItemShowFormChange = async (e) => {
        e?.preventDefault();
        await updateDocFieldsWTimeStamp(selected?.item, { [`options.showTaskForm`]: !item?.options?.showTaskForm });
    }

    const handleTabsChange = (event: React.MouseEvent<HTMLElement>, newView: DetailViews) => {
        setView(newView);
        // let isGallery = newView == DetailViews.Gallery;
        // if (isGallery) slideTo();
    }

    const formSubmitOnEnter = (e) => {
        const queryFields = [e?.key, e?.keyCode];
        const submitKeys = [13, `Enter`, `Return`];
        const shouldSubmitOnEnter = queryFields?.some(fld => submitKeys?.includes(fld));
        if (shouldSubmitOnEnter) {
            saveItem(e);
        }
    }

    const imageLoaded = (e) => {
        const imageComponent = e?.target;
        if (imageComponent?.complete && imageComponent?.naturalWidth > 0) {
            setFormStatus(``);
            setValidSelectedImage(true);
        }
    }
  
    const imageErrored = (e) => {
        const imageField: any = document?.querySelector(`.itemImageLinkField`);
        if (imageField && imageField?.value == ``) {
            setFormStatus(``);
            setValidSelectedImage(false);
        } else {
            setValidSelectedImage(false);
            setFormStatus(`Image Error`);
        }
    }

    const onEditorChangeVal = (editorVal) => {
        let output = convertURLsToHTML(editorVal);
        console.log(`onEditorChangeVal`, output);
        setDescription(output);
    }

    const resetEditor = () => {
        if (editorRef) editorRef.current?.clear();
        setEditing(false);
    }

    const cleanHTML = (htmlString: string) => {
        return DOMPurify.sanitize(htmlString, {
            ADD_ATTR: [`target`, `rel`, `id`, `class`],
            ALLOWED_ATTR: [`href`, `src`, `alt`, `target`, `rel`, `id`, `class`],
            ALLOWED_TAGS: [`a`, `img`, `p`, `strong`, `em`, `ul`, `li`, `ol`, `br`],
        });
    }

    const renderContent = (htmlString: string) => {
        let cleanedHTML =  cleanHTML(htmlString);
        let renderedContent = parse(cleanedHTML, {
            replace: (domNode) => {
                if (domNode instanceof Element) {
                    if (domNode.name === `img`) {
                        const { src, alt, class: className } = domNode.attribs;
                        return (
                            <CustomImage
                                src={src}
                                alt={alt || `Message Image`}
                                className={className || `msgImg`}
                            />
                        );
                    } else if (domNode.name === `a`) {
                        const { href, class: className } = domNode.attribs;
                        return <TagURL url={href} extraClasses={className} />
                    }
                }
            },
        });
        return renderedContent;
    }

    const saveItem = async (e, dismissOnSave = false) => {
        e.preventDefault();

        let form = formRef?.current;

        let { itemImageLink } = form;

        let itemImage = itemImageLink ? itemImageLink?.value : ``;

        let itemActive = active == `active`;
        let itemComplete = active == `complete`;
        let activeStatusChanged = itemActive != item?.options?.active;
        let completionStatusChanged = itemComplete != item?.options?.complete;

        let statusChanged = activeStatusChanged || completionStatusChanged;

        if (itemImage != `` || statusChanged || !saveButtonDisabled) {
            await updateDocFieldsWTimeStamp(item, {
                description,
                ...(itemImage != `` && {
                    ...(item?.image == `` && { image: itemImage, }),
                    attachments: Array.from(new Set([...[...item?.attachments, itemImage]])),
                }),
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
            });
        }

        if (dismissOnSave) {
            let closeButton: any = document.querySelector(`.alertButton`);
            if (closeButton) closeButton.click();
        } else {
            form?.reset();
        }

        resetEditor();
    }

    const DetailsFields = () => {
        return <>
            <div className={`itemDetailFieldMetric flexLabel`}>
                <h4 className={`itemDetailType`}>
                    <strong>ID:</strong>
                </h4>
                <h4 className={`itemDetailType`}>
                    <ItemWrapper cursorGrab={false}>    
                        <Tags item={item} extend={true} parentClass={`itemDetailContentsTagParent itemContents`} className={`IDTag`} />
                    </ItemWrapper>
                </h4>
            </div>
            <div className={`itemDetailFieldMetricRow`}>
                <div className={`itemDetailFieldMetric flexLabel`}>
                    <h4 className={`itemDetailType`}>
                        <strong>Status:</strong>
                    </h4>
                    <DetailField item={item} tasks={tasks} />
                </div>
                {item?.attachments?.length > 0 && (
                    <Tooltip title={`Attachments`} arrow>
                        <div className={`itemDetailFieldMetric flexLabel`} style={{ marginLeft: 5, maxWidth: `fit-content` }}>
                            <h4 className={`itemDetailType`}>
                                <i className={`fas fa-paperclip`} style={{ color: `var(--gameBlue)` }} />
                            </h4>
                            <h4 className={`itemDetailType`}>
                                {item?.attachments?.length}
                            </h4>
                        </div>
                    </Tooltip>
                )}
            </div>
            <div className={`itemDetailFieldMetric flexLabel`}>
                <h4 className={`itemDetailType`}>
                    <strong>Created:</strong>
                </h4>
                <h4 className={`itemDetailType`}>
                    {item?.meta?.created}
                </h4>
            </div>
            <div className={`itemDetailFieldMetric flexLabel`}>
                <h4 className={`itemDetailType`}>
                    <strong>Updated:</strong>
                </h4>
                <h4 className={`itemDetailType`}>
                    {item?.meta?.updated}
                </h4>
            </div>
        </>
    }

    const TasksField = () => {
        return <>
            <div className={`itemDetailTasksRow flexLabel spaceBetween`}>
                <div className={`itemDetailTasksLabel itemDetailFieldMetric flexLabel`}>
                    <h4 className={`itemDetailType`}>
                        <strong>Tasks:</strong>
                    </h4>
                    <h4 className={`itemDetailType`}>
                        {item?.data?.taskIDs?.length}
                    </h4>
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
                <input onKeyDown={(e) => formSubmitOnEnter(e)} type={`text`} name={`itemImageLink`} className={`itemImageLinkField`} placeholder={`Item Image URL`} />
                <DropZone item={item} />
            </div>
            <div className={`itemDetailField`} style={{ display: `flex`, width: `100%`, alignItems: `center`, gridGap: 15 }}>
                {/* <div className={`itemDetailFieldtitle`} style={{ minWidth: 100, textAlign: `end` }}>
                    Description
                </div> */}
                {/* <textarea name={`itemDescriptionField`} className={`itemDescriptionField`} placeholder={`Item Description`} defaultValue={item?.description} /> */}
                {editing ? (
                    <Editor 
                        ref={editorRef} 
                        // onBlur={(e) => onEditorBlur(e)}
                        className={`itemDescriptionEditorField`} 
                        placeholder={description || `Enter Item Description`} 
                        onChange={(editorVal) => onEditorChangeVal(editorVal)} 
                    />
                ) : (
                    <div className={`itemDescriptionPreview messageContentPreview renderHTML fullText`} onClick={() => setEditing(!editing)}>
                        {renderContent(description)}
                    </div>
                )}
            </div>
            <div className={`toggle-buttons`}>
                <button onClick={(e) => saveItem(e)} type={`button`} title={saveButtonDisabled ? formStatus : undefined} disabled={saveButtonDisabled} className={`iconButton saveButton ${saveButtonDisabled ? `pointerEventsNone` : ``}`} style={{ color: saveButtonDisabled && formStatus != `` ? `red` : `black` }}>
                    {saveButtonDisabled && formStatus != `` ? formStatus : `Save`}
                </button>
            </div>
        </>
    }

    const AttachmentsSlider = (
        slidesPerView = item?.attachments?.length >= 3 ? 2 : 1, 
        attachmentsArray = item?.attachments?.slice(1, item?.attachments.length),
    ) => {
        return (
            <div className={`attachmentsSliderWrapper`}>
                <Swiper 
                    loop={true}
                    ref={swiperRef}
                    spaceBetween={7} 
                    navigation={true} 
                    pagination={true} 
                    simulateTouch={true} 
                    allowTouchMove={true}
                    slidesPerView={slidesPerView} 
                    className={`attachmentsSlider`}
                >
                    {attachmentsArray?.map((att, attIndx) => (
                        <SwiperSlide key={attIndx} className={`attachmentSlide ${(active && (slidesPerView == 1 && attachmentsArray?.length >= 2) || (item?.attachments?.length > 3)) ? `multiSlides` : `staticSlides`}`}>
                            <Media item={item} attachmentURL={att} onCoverChange={() => slideTo()}>
                                <CustomImage src={att} alt={item?.name} className={`attachmentMedia ${view == DetailViews.Summary ? `attachmentMediaShort` : ``}`} borderRadius={`var(--borderRadius)`} />
                            </Media>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        )
    }

    return <>
        <div className={`detail_view alertDetailsComponent detailView_${view}`}>
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
                        <div className={`itemDetailTabs`}>
                            <ToggleButtonGroup
                                exclusive
                                value={view}
                                color={`primary`}
                                aria-label={`View`}
                                onChange={handleTabsChange}
                                className={`detailViewTabs`}
                                style={{ minHeight: 50, gridGap: 2 }}
                            >
                                {Object.values(DetailViews).map((v, vi) => (
                                    <ToggleButton key={vi} value={v} className={`detailViewTabButton flex gap5 alignCenter`} style={{ background: `white` }}>
                                        <i className={`detailViewTabIcon ${detailViews[v]}`} style={{ color: `var(--gameBlue)` }} />
                                        <strong>{v}</strong>
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </div>
                        {selected != null && (
                            <button className={`detailsCloseButton buttonComponent`} onClick={() => setSelected(null)}>
                                <i className={`fas fa-times`} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div id={`detail_view_${item?.id}`} className={`detailView flex row`}>

                {<div className={`attachmentsContainer`} style={{ maxWidth: `40%` }}>
                    <figure className={`customDetailImage ${validSelectedImage ? `validSelectedImage` : `invalidSelectedImage`}`}>
                        {(view == DetailViews.Summary || view == DetailViews.Gallery) && (image != `` || item?.attachments?.length >= 1) ? (
                            <Media item={item} attachmentURL={image}>
                                <CustomImage 
                                    src={image} 
                                    alt={item?.name} 
                                    onImageLoad={(e) => imageLoaded(e)} 
                                    borderRadius={`var(--borderRadius)`}
                                    onImageError={(e) => imageErrored(e)} 
                                    className={`itemImage detailViewImage imageLoadElement`} 
                                />
                            </Media>
                        ) : AttachmentsSlider(1, item?.attachments)}
                    </figure>
                    {view == DetailViews.Summary && item?.attachments?.length > 1 && (
                        AttachmentsSlider()
                    )}
                </div>}

                {selected != null && item != null && item?.type && (
                    <form ref={formRef} onInput={(e) => refreshDetails(e)} onSubmit={(e) => saveItem(e)} className={`itemDetailsForm changeInputs flex isColumn`} data-index={(index ?? 0) + 1}>
                        {view != DetailViews.Tasks && (
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
                        )}
                        {view == DetailViews.Gallery ? <Gallery item={item} /> : <>
                            {(item?.data?.taskIDs?.length == 0 || item?.data?.taskIDs?.length == tasks?.filter((tsk: Task) => tsk?.options?.complete)?.length) && (
                                <ToggleButtons item={item} toDoTasks={tasks?.filter((tsk: Task) => !tsk?.options?.active && !tsk?.options?.complete)} activeTasks={tasks?.filter((tsk: Task) => tsk?.options?.active)} completeTasks={tasks?.filter((tsk: Task) => tsk?.options?.complete)} onActiveChange={(newActive) => setActive(newActive)} />
                            )}
                            <div className={`tasksContainer detailView_tasksContainer`}>
                                {TasksField()}
                            </div>
                        </>}
                    </form>
                )}
            </div>
        </div>
    </>
}