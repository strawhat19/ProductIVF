import 'swiper/css';
// import 'swiper/css/effect-cards';
// import { EffectCards } from 'swiper/modules';
import { StateContext } from '../../pages/_app';
import { Swiper, SwiperSlide } from 'swiper/react';
import { RolesMap } from '../../shared/models/User';
import { Chat, ChatTypes, createChat } from '../../shared/models/Chat';
import MessagePreview from './message/message-preview';
import IVFSkeleton from '../loaders/skeleton/ivf_skeleton';
import MultiSelect from '../selector/multiselect/multiselect';
import { CSSProperties, useContext, useEffect, useRef, useState } from 'react';
import { createMessage, Message } from '../../shared/models/Message';
import { addChatToDatabase, addMessageToChatSubcollection, deleteChatFromDatabase } from '../../firebase';

export const avatars = {
    // aang: {
    //     name: `Aang`,
    //     images: {
    //         state: `https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj`,
    //     },
    // },
    toph: {
        name: `Toph`,
        images: {
            smiling: `https://i.pinimg.com/474x/34/15/b0/3415b010cb3f7adff5b0e1b0a7690a3f.jpg`,
        },
    },
    gojo: {
        name: `Gojo`,
        images: {
            smiling: `https://i.pinimg.com/736x/43/17/62/431762698f04cd7eff75697bf12c82fb.jpg`,
        },
    },
}

const getRandomAvatar = () => {
    const avatarKeys = Object.keys(avatars);
    const randomAvatarKey = avatarKeys[Math.floor(Math.random() * avatarKeys.length)];
    const avatar = avatars[randomAvatarKey];

    const imageKeys = Object.keys(avatar.images);
    const randomImageKey = imageKeys[Math.floor(Math.random() * imageKeys.length)];
    const imageUrl = avatar.images[randomImageKey];

    return { name: avatar.name, image: imageUrl };
}

const getArr = (num) => {
    return Array.from({ length: num }, (_, i) => {
        const { name, image } = getRandomAvatar();
        return new Message({
            name,
            image,
            senderEmail: name,
            id: `msg-${i + 1}`,
            date: `10:${48 - i} PM`,
            content: `WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWW WWWWW`,
        });
    });
}

export default function Messages() {
    let swiperRef = useRef(null);
    let [message, setMessage] = useState(``);
    let [recipients, setRecipients] = useState([]);
    let [activeSlide, setActiveSlide] = useState(0);
    let [composing, setComposing] = useState(false);
    let [activeChat, setActiveChat] = useState(null);
    let [chatSlideActive, setChatSlideActive] = useState(false);
    let { user, chats, boardsLoading, gridsLoading } = useContext<any>(StateContext);

    const setMsgChats = () => {
        let msgChats = chats?.length > 0 ? [
            ...chats.map(c => c.lastMessage), 
            // ...getArr(3),
        ] : [];
        return msgChats;
    }
    
    let [userChats, setMessages] = useState(setMsgChats());

    useEffect(() => {
        setMessages(setMsgChats());
    }, [chats])

    const onSelectedRecipients = (selectedOptions) => {
        setRecipients(selectedOptions);
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

    const onChatFormSubmit = async (onFormSubmitEvent) => {
        onFormSubmitEvent?.preventDefault();

        const storeNewChat = () => {
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
            const newMessage = createMessage(1, message, user, newChat?.id);
            newChat.lastMessage = newMessage;

            // setChatts(prevChats => [...prevChats, newChat]);

            addChatToDatabase(newChat);
            // addMessageToChatSubcollection(newChat?.id, newMessage);
            setActiveChat(newChat);

            onFormSubmitEvent?.target?.reset();
            setRecipients([]);
        }

        if (chats.length > 0) {
            let thisChat = chats.find(ch => {
                const sortedRec = [...recipients.map(s => s.toLowerCase())].sort();
                const sortedUsers = [...ch.data.users.map(s => s.toLowerCase())].sort();
                return sortedRec.length === sortedUsers.length &&
                    sortedRec.every((val, index) => val === sortedUsers[index]);
            });
            
            if (thisChat) {
                console.log(`Has Chat`, thisChat);
            } else storeNewChat();
        } else storeNewChat();
    }
    
    const onChatFormChange = (onFormChangeEvent) => {
        onFormChangeEvent?.preventDefault();
        let updatedValue = onFormChangeEvent?.target?.value;
        setMessage(updatedValue);
        console.log(`onChatFormChange`, updatedValue);
    }

    const getBodyHeight = (extraThreshold = 0) => {
        let nextraNavContainer = document.querySelector(`.nextra-nav-container`);
        let messagesHeader = document.querySelector(`.messagesHeader`);
        let chatForm = document.querySelector(`.chatForm`);
        let h = window.innerHeight - 176;
        if (chatForm && messagesHeader && nextraNavContainer) {
            h = window.innerHeight - ((
                messagesHeader.clientHeight 
                // nextraNavContainer.clientHeight 
                + chatForm.clientHeight
            ) + extraThreshold);
            // console.log({
            //     h,
            //     innerHeight: window.innerHeight,
            //     chatForm: chatForm?.clientHeight,
            //     messagesHeader: messagesHeader?.clientHeight,
            //     // nextraNavContainer: nextraNavContainer?.clientHeight,
            // })
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
                setComposing(compose);
                if (chatMsg) {
                    if (chats?.length > 0) {
                        let thisCh = chats?.find(c => c?.id == chatMsg?.chatID);
                        if (thisCh) {
                            setActiveChat(thisCh);
                        }
                    }
                }
                setTimeout(() => setChatSlideActive(true), 175);
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
                                    {activeSlide == 0 ? `Chat(s)` : activeChat == null ? `Messages` : activeChat?.name}
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
                                <div className={`chatMessagesContainer messagesPreviewContainer ${userChats.length > 0 ? `hasChats` : `noChats`} ${chatSlideActive ? `chatSlideActive` : `chatSlideInactive`}`} 
                                    style={chatSlideActive ? { 
                                        [`--height`]: getBodyHeight(1) + `px`,
                                        height: `var(--height)`, 
                                        minHeight: `var(--height)`, 
                                        maxHeight: `var(--height)`,
                                    } as CSSProperties : undefined}
                                >
                                    {userChats.map((msg: Message, msgIndex) => {
                                        return (
                                            <MessagePreview 
                                                key={msgIndex} 
                                                userMessage={msg}
                                                clickableMsg={false}
                                            />
                                        )
                                    })}
                                </div>
                                <form className={`chatForm`} onSubmit={(e) => onChatFormSubmit(e)} onChange={(e) => onChatFormChange(e)}>
                                    <div className={`formField ${(activeChat == null && recipients.length == 0) ? `disabledFormField` : `enabledFormField`}`}>
                                        <input disabled={(activeChat == null && recipients.length == 0)} type={`text`} name={`message`} placeholder={`Enter Message...`} className={`formFielInput`} required />
                                        <button className={`iconButton ${message == `` ? `disabledFormField` : `enabledFormField`}`} type={`submit`}>
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