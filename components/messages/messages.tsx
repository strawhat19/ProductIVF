import 'swiper/css';
// import 'swiper/css/effect-cards';
import Editor from './editor/editor';
// import { EffectCards } from 'swiper/modules';
import { StateContext } from '../../pages/_app';
import { Swiper, SwiperSlide } from 'swiper/react';
import { RolesMap } from '../../shared/models/User';
import MessagePreview from './message/message-preview';
import IVFSkeleton from '../loaders/skeleton/ivf_skeleton';
import MultiSelect from '../selector/multiselect/multiselect';
import { isMobileDevice, logToast } from '../../shared/constants';
import { createMessage, Message } from '../../shared/models/Message';
import { Chat, ChatTypes, createChat } from '../../shared/models/Chat';
import { CSSProperties, useContext, useEffect, useRef, useState } from 'react';
import { collection, onSnapshot, orderBy, query, Unsubscribe } from 'firebase/firestore';
import { addChatToDatabase, addMessageToChatSubcollection, db, deleteChatFromDatabase, updateDocFieldsWTimeStamp } from '../../firebase';

export const convertURLsToHTML = (html: string): string => {
  // Create a DOM parser to handle the HTML string safely
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, `text/html`);

  const imageExtensions = [`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.svg`];

  // Walk through all <strong> tags that contain URLs
  doc.querySelectorAll(`p`).forEach(p => {
    const text = p.textContent?.trim() || ``;
    try {
      const url = new URL(text); // validate URL

      const isImage = imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
      const replacement = isImage
        ? `<img src="${url.href}" class="msgImg" />`
        : `<a href="${url.href}" class="msgLnk" target="_blank" rel="noopener noreferrer">
            ${url.href}
           </a>`;

      // Replace the text content with HTML (note: innerHTML is safe here because it's your own validated content)
      p.innerHTML = replacement;
    } catch {
      // Not a valid URL — skip it
    }
  });

  return doc.body.innerHTML;
}

// export const avatars = {
//     // aang: {
//     //     name: `Aang`,
//     //     images: {
//     //         state: `https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj`,
//     //     },
//     // },
//     toph: {
//         name: `Toph`,
//         images: {
//             smiling: `https://i.pinimg.com/474x/34/15/b0/3415b010cb3f7adff5b0e1b0a7690a3f.jpg`,
//         },
//     },
//     gojo: {
//         name: `Gojo`,
//         images: {
//             smiling: `https://i.pinimg.com/736x/43/17/62/431762698f04cd7eff75697bf12c82fb.jpg`,
//         },
//     },
// }

// const getRandomAvatar = () => {
//     const avatarKeys = Object.keys(avatars);
//     const randomAvatarKey = avatarKeys[Math.floor(Math.random() * avatarKeys.length)];
//     const avatar = avatars[randomAvatarKey];

//     const imageKeys = Object.keys(avatar.images);
//     const randomImageKey = imageKeys[Math.floor(Math.random() * imageKeys.length)];
//     const imageUrl = avatar.images[randomImageKey];

//     return { name: avatar.name, image: imageUrl };
// }

// const getArr = (num) => {
//     return Array.from({ length: num }, (_, i) => {
//         const { name, image } = getRandomAvatar();
//         return new Message({
//             name,
//             image,
//             senderEmail: name,
//             id: `msg-${i + 1}`,
//             date: `10:${48 - i} PM`,
//             content: `WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWW WWWWW`,
//         });
//     });
// }

export default function Messages() {
    let swiperRef = useRef(null);
    let editorRef = useRef(null);
    let chatMessagesRef = useRef(null);
    let [message, setMessage] = useState(``);
    let [recipients, setRecipients] = useState([]);
    let [activeSlide, setActiveSlide] = useState(0);
    let [composing, setComposing] = useState(false);
    let [activeChat, setActiveChat] = useState(null);
    let [chatMessages, setChatMessages] = useState([]);
    let [chatSlideActive, setChatSlideActive] = useState(false);
    let { user, chats, boardsLoading, gridsLoading } = useContext<any>(StateContext);

    const getUserChats = (chts = chats) => {
        let msgChats = chts?.length > 0 ? [
            ...chts.map(c => {
                return new Message({
                    ...c.lastMessage,
                    senderEmail: c?.lastMessage?.senderEmail?.toLowerCase() == user?.email?.toLowerCase() 
                                    ? c?.name : c?.lastMessage?.senderEmail,
                });
            }), 
            // ...getArr(3),
        ] : [];
        return msgChats;
    }
    
    let [userChats, setUserChats] = useState(getUserChats());

    useEffect(() => {
        const updatedChats = getUserChats(chats);
        setUserChats(updatedChats);
        if (activeChat != null) {
            let thisChat = chats?.find(ch => ch?.id == activeChat?.id);
            if (thisChat) {
                setActiveChat(thisChat);
            }
        }
        if (chats?.length == 0) {
            if (activeChat != null) {
                goNextSwiperSlide();
            }
        }
    }, [chats])

    useEffect(() => {
        let realtimeChatMessagesListener: Unsubscribe | null = null;

        if (activeChat != null) {
            if (activeChat?.id) {
                const messagesRef = collection(db, `chats/${activeChat.id}/messages`);
                const messagesQuery = query(messagesRef, orderBy(`rank`));
                realtimeChatMessagesListener = onSnapshot(messagesQuery, snapshot => {
                    const liveMessages = snapshot.docs.map(doc => new Message({ ...doc.data() }))?.sort((a: any, b: any) => (new Date(a.meta.updated) as any) - (new Date(b.meta.updated) as any));
                    setChatMessages(liveMessages);
                    setTimeout(() => {
                        scrollChatScreenDown();
                    }, 250);
                }, (getChatMessagesError) => {
                    logToast(`Error on Get Chat Messages from Database`, getChatMessagesError, true);
                })
            }
        } else setChatMessages([]);

        return () => {
            if (realtimeChatMessagesListener != null) {
                realtimeChatMessagesListener();
                realtimeChatMessagesListener = null;
            }
        }
    }, [activeChat])

    const onSelectedRecipients = (selectedOptions) => {
        setRecipients(selectedOptions);
    }

    const scrollChatScreenDown = () => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }

    const chatsReady = () => {
        let dataLoaded = !boardsLoading && !gridsLoading;
        let userHasPermission = user != null && ((RolesMap[user.role] as any) >= RolesMap.Moderator);
        return dataLoaded && userHasPermission;
    }

    const deleteChat = (actvCht: Chat = activeChat) => {
        deleteChatFromDatabase(actvCht);
        goNextSwiperSlide(false);
    }

    // const onChatFormChange = (onFormChangeEvent) => {
    //     onFormChangeEvent?.preventDefault();
    //     let updatedValue = onFormChangeEvent?.target?.value;
    //     setMessage(updatedValue);
    // }

    const onEditorChangeVal = (editorVal) => {
        let output = convertURLsToHTML(editorVal);
        console.log(`onEditorChangeVal`, {editorVal, output});
        setMessage(output);
    }

    const resetEditor = (onFormSubmitEvent = null) => {
        setMessage(``);
        if (editorRef) editorRef.current?.clear();
        if (onFormSubmitEvent != null) {
            if (onFormSubmitEvent?.target) onFormSubmitEvent?.target?.reset();
        }
    }

    const onChatFormSubmit = async (onFormSubmitEvent) => {
        onFormSubmitEvent?.preventDefault();
        if (message == `` || message == `<p></p>`) return;

        if (activeChat != null) {
            const { rank, recipients: recips } = activeChat?.lastMessage;
            const newMessageIndex = parseFloat(rank) + 1;
            const newMessage = createMessage(newMessageIndex, message, user, activeChat?.id, recips);
            addMessageToChatSubcollection(activeChat?.id, newMessage);
            updateDocFieldsWTimeStamp(activeChat, { lastMessage: JSON.parse(JSON.stringify(newMessage)) });
            resetEditor(onFormSubmitEvent);
        } else {
            if (chats.length > 0) {
                let thisChat = chats.find(ch => {
                    const sortedRec = [...recipients.map(s => s.toLowerCase())].sort();
                    const sortedUsers = [...ch.data.users.map(s => s.toLowerCase())].sort();
                    return sortedRec.length === sortedUsers.length &&
                        sortedRec.every((val, index) => val === sortedUsers[index]);
                });
                
                if (thisChat) {
                    console.log(`Has Chat`, thisChat);
                } else addNewChat(onFormSubmitEvent);
            } else addNewChat(onFormSubmitEvent);
        }
    }

    const getBodyHeight = (extraThreshold = 0) => {
        let nextraNavContainer = document.querySelector(`.nextra-nav-container`);
        let messagesHeader = document.querySelector(`.messagesHeader`);
        let chatForm = document.querySelector(`.chatForm`);
        let h = window.innerHeight - 176;
        let onMobile = isMobileDevice();
        if (onMobile) return;
        if (chatForm && messagesHeader && nextraNavContainer) {
            h = window.innerHeight - ((
                messagesHeader.clientHeight 
                + chatForm.clientHeight
            ) + extraThreshold);
        }
        return h;
    }

    const chatsLoader = () => {
        return (
            <div className={`chatsLoader ${chatsReady() ? `chatsReady` : `chatsLoading`}`}>
                <IVFSkeleton 
                    height={65}
                    labelSize={12}
                    showLoading={true}
                    skeletonContainerGap={15}
                    className={`chatSkeleton`} 
                    skeletonContainerWidth={`92%`}
                    label={getChatsLoadingLabel()} 
                />
            </div>
        )
    }

    const goNextSwiperSlide = (compose = false, chatMsg?) => {
        if (swiperRef.current && swiperRef.current.swiper) {
            const swiperInstance = swiperRef.current?.swiper;
            const activeSlideIndex = swiperInstance?.realIndex;
            if (activeSlideIndex == 0) {
                swiperInstance.slideNext();
                // let usrGridURL = `/user/${usr?.rank}/grids/${selectedGrd?.rank}`;
                // router.replace(usrGridURL, undefined, { shallow: true });
                setComposing(compose);
                if (chatMsg) {
                    if (chats?.length > 0) {
                        let thisCh = chats?.find(c => c?.id == chatMsg?.chatID);
                        if (thisCh) {
                            setActiveChat(thisCh);
                        }
                    }
                }
                setTimeout(() => {
                    setChatSlideActive(true);
                }, 175);
            } else {
                swiperInstance.slidePrev();
                setChatSlideActive(false);
                setComposing(false);
                setActiveChat(null);
            }
            setActiveSlide(swiperInstance?.realIndex);
        }
    }

    const getChatsLoadingLabel = () => {
        let defaultLoadingLabel = `Messages Loading`;
        let loadingLabel = defaultLoadingLabel;
        
        if (user != null) {
            let currentRole: any = RolesMap[user.role];
            if (currentRole >= RolesMap.Moderator) {
                if (userChats.length > 0) {
                    loadingLabel = defaultLoadingLabel;
                } else {
                    loadingLabel = `No Chat(s) Yet`;
                }
            } else {
                loadingLabel = `Role must be >= Moderator to View Messages`;
            }
        } else {
            loadingLabel = `Sign in as >= Moderator to View Messages`;
        }

        return loadingLabel;
    }

    const addNewChat = (onFormSubmitEvent = null) => {
        let maxChatRank = 0;
        if (chats.length > 0) {
            let chatRanks = chats.map(ch => ch.rank).sort((a, b) => b - a);
            maxChatRank = chatRanks[0];
        }

        const chatNumber = Math.max(maxChatRank) + 1;
        const nonUserRecips = recipients?.filter(r => r?.value?.toLowerCase() != user?.email?.toLowerCase());
        const chatType = nonUserRecips?.length > 1 ? ChatTypes.Group : (nonUserRecips?.length == 1 ? ChatTypes.Direct : ChatTypes.Self);

        const recipientsEmails = recipients?.map(r => r?.value);
        const recipientsString = recipientsEmails?.join(` `)?.trim();
        const uniqueRecipientEmails = Array.from(new Set([...[user?.email, ...recipientsEmails]]));

        const newChat = createChat(chatNumber, recipientsString, user, uniqueRecipientEmails, chatType);
        const newMessage = createMessage(1, message, user, newChat?.id, uniqueRecipientEmails);
        newChat.lastMessage = newMessage;

        addChatToDatabase(newChat);
        addMessageToChatSubcollection(newChat?.id, newMessage);
        setActiveChat(newChat);

        setRecipients([]);
        resetEditor(onFormSubmitEvent);
    }

    return (
        chatsReady() ? <>
            <div className={`messages`}>
                <div className={`messagesHeader`}>
                    <div className={`messagesInfoRow`}>
                        {(composing && activeChat == null) ? (
                            <div className={`multiselectContainer`}>
                                <MultiSelect value={recipients} userSelector={true} onChange={(selectedOptions) => onSelectedRecipients(selectedOptions)} />
                            </div>
                        ) : (
                            <h2 className={`flexThis gap5 alignCenter`}>
                                <span className={`mainColor`} style={{ fontSize: 14 }}>
                                    ({userChats.length})
                                </span> 
                                <span className={`messagesHeaderRowTitle`} title={activeChat == null ? `` : activeChat?.name}>
                                    {activeSlide == 0 
                                        ? `Chat(s)` : (
                                            activeChat == null 
                                            ? `Messages` 
                                            : (
                                                activeChat?.creator?.toLowerCase() == user?.email?.toLowerCase() 
                                                    ? activeChat?.name 
                                                    : activeChat?.creator
                                            )
                                        )
                                    }
                                </span>
                            </h2>
                        )}
                        {activeChat != null && (
                            <button className={`chatsActionIconButton iconButton chatsActionDeleteIconButton`} onClick={() => deleteChat(activeChat)} style={{marginRight: 10}}>
                                <i className={`mainColor fas fa-trash cursorPointer`} style={{ fontSize: 14 }} />
                            </button>
                        )}
                        <button className={`chatsActionIconButton iconButton`} onClick={() => goNextSwiperSlide(true)}>
                            <i className={`mainColor fas ${activeSlide == 0 ? `fa-edit` : `fa-chevron-left`} cursorPointer`} style={{ fontSize: 14 }} />
                        </button>
                    </div>
                    {/* <div className={`messagesSearch`}>
                        [Messages Search Goes Here]
                    </div> */}
                </div>
                {/* {messages.length > 0 ? ( */}
                    <div className={`messagesContainer ${activeSlide == 0 ? `chatsContainer` : `chatMessages`}`}>                  
                        <Swiper 
                            loop={true}
                            // speed={500}
                            ref={swiperRef}
                            spaceBetween={0} 
                            slidesPerView={1} 
                            navigation={false} 
                            pagination={false} 
                            // effect={`cards`}
                            simulateTouch={false} 
                            allowTouchMove={false}
                            // modules={[EffectCards]}
                        >
                            <SwiperSlide className={`chatsScreen`}>
                                {/* {chats?.length}
                                {messages?.length} */}
                                {userChats?.length > 0 ? (
                                    <div className={`messagesPreviewContainer`} 
                                        style={{ 
                                            [`--height`]: getBodyHeight(4) + `px`,
                                            height: `var(--height)`, 
                                            minHeight: `var(--height)`, 
                                            maxHeight: `var(--height)`,
                                        } as CSSProperties}
                                    >
                                        {userChats.map((chatMsg: Message, msgIndex) => {
                                            return (
                                                <MessagePreview 
                                                    key={msgIndex} 
                                                    userMessage={chatMsg}
                                                    onClick={() => goNextSwiperSlide(true, chatMsg)} 
                                                />
                                            )
                                        })}
                                    </div>
                                ) : chatsLoader()}
                            </SwiperSlide>
                            <SwiperSlide className={`chatSlide`}>
                                <div ref={chatMessagesRef} className={`chatMessagesContainer messagesPreviewContainer ${userChats.length > 0 ? `hasChats` : `noChats`} ${chatSlideActive ? `chatSlideActive` : `chatSlideInactive`}`} 
                                    style={chatSlideActive ? { 
                                        [`--height`]: getBodyHeight(1) + `px`,
                                        height: `var(--height)`, 
                                        minHeight: `var(--height)`, 
                                        maxHeight: `var(--height)`,
                                    } as CSSProperties : undefined}
                                >
                                    {chatMessages.map((msg: Message, msgIndex) => {
                                        return (
                                            <MessagePreview 
                                                key={msgIndex} 
                                                userMessage={msg}
                                                clickableMsg={false}
                                            />
                                        )
                                    })}
                                </div>
                                <form className={`chatForm`} onSubmit={(e) => onChatFormSubmit(e)}>
                                    <div className={`formField ${(activeChat == null && recipients.length == 0) ? `disabledFormField` : `enabledFormField`}`}>
                                        <Editor ref={editorRef} onChange={(editorVal) => onEditorChangeVal(editorVal)} />
                                        <button disabled={message == `` || message == `<p></p>`} className={`chatsActionIconButton messageActionButton iconButton ${(message == `` || message == `<p></p>`) ? `disabledFormField disabledFormFieldButton` : `enabledFormField enabledFormFieldButton`}`} type={`submit`}>
                                            <i className={`fas fa-caret-right`} />
                                        </button>
                                    </div>
                                </form>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                {/* // ) : chatsLoader()} */}
            </div>
        </> : chatsLoader()
    )
}