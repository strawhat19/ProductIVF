import 'swiper/css';
// import 'swiper/css/effect-cards';
// import { EffectCards } from 'swiper/modules';
import { StateContext } from '../../pages/_app';
import { Swiper, SwiperSlide } from 'swiper/react';
import { RolesMap } from '../../shared/models/User';
import { useContext, useRef, useState } from 'react';
import { Message } from '../../shared/models/Message';
import MessagePreview from './message/message-preview';
import IVFSkeleton from '../loaders/skeleton/ivf_skeleton';

export const avatars = {
    aang: {
        name: `Aang`,
        images: {
            state: `https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj`,
        },
    },
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
};

export default function Messages() {
    let swiperRef = useRef(null);
    let [activeSlide, setActiveSlide] = useState(0);
    let { user, boardsLoading, gridsLoading } = useContext<any>(StateContext);

    let [messages, setMessages] = useState(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const { name, image } = getRandomAvatar();
            return new Message({
                name: name,
                image: image,
                id: `msg-${i + 1}`,
                date: `10:${48 - i} PM`,
                content: `WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWW WWWWW`,
            });
        });
    });

    const setActiveSlideIndex = (swiperInstance) => {
        const activeSlideIndex = swiperInstance?.realIndex;
        setActiveSlide(activeSlideIndex);
    }

    const goNext = () => {
        if (swiperRef.current && swiperRef.current.swiper) {
            const swiperInstance = swiperRef.current?.swiper;
            const activeSlideIndex = swiperInstance?.realIndex;
            if (activeSlideIndex == 0) {
                swiperInstance.slideNext();
            } else {
                swiperInstance.slidePrev();
            }
            setActiveSlideIndex(swiperInstance);
        }
    };

    // const goPrev = () => {
    //     if (swiperRef.current && swiperRef.current.swiper) {
    //         const swiperInstance = swiperRef.current?.swiper;
    //         swiperInstance.slidePrev();
    //         setActiveSlideIndex(swiperInstance);
    //     }
    // };

    const getChatMessagesHeight = () => {
        return window.innerHeight - 176;
    }

    return (
        ((!boardsLoading && !gridsLoading) && (user != null && ((RolesMap[user.role] as any) >= RolesMap.Moderator))) ? <>
            <div className={`messages`}>
                <div className={`messagesHeader`}>
                    <div className={`messagesInfoRow`}>
                        <h2 className={`flexThis gap5 alignCenter`}>
                            <span className={`mainColor`} style={{ fontSize: 14 }}>
                                ({messages.length})
                            </span> 
                            {activeSlide == 0 ? `Chat(s)` : `Messages`}
                        </h2>
                        <i onClick={goNext} className={`mainColor fas ${activeSlide == 0 ? `fa-edit` : `fa-chevron-left`} cursorPointer`} style={{ fontSize: 14 }} />
                    </div>
                    {/* <div className={`messagesSearch`}>
                        [Messages Search Goes Here]
                    </div> */}
                </div>
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
                        <SwiperSlide>
                            <div className={`messagesPreviewContainer`}>
                                {messages.map((msg: Message, msgIndex) => {
                                    return (
                                        <MessagePreview 
                                            key={msgIndex} 
                                            onClick={goNext} 
                                            userMessage={msg}
                                        />
                                    )
                                })}
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className={`chatSlide`}>
                            <div className={`messagesPreviewContainer`} style={{ maxHeight: getChatMessagesHeight() }}>
                                {messages.map((msg: Message, msgIndex) => {
                                    return (
                                        <MessagePreview 
                                            key={msgIndex} 
                                            onClick={goNext} 
                                            userMessage={msg}
                                        />
                                    )
                                })}
                            </div>
                            <form className={`chatForm`}>
                                <div className={`formField`}>
                                    <input type={`text`} name={`message`} placeholder={`Enter Message...`} />
                                </div>
                            </form>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </div>
        </> : (
            <div style={{ padding: `80px 15px 15px 15px` }}>
                <IVFSkeleton 
                    height={65}
                    labelSize={12}
                    showLoading={true}
                    skeletonContainerGap={15}
                    className={`chatSkeleton`} 
                    skeletonContainerWidth={`92%`}
                    label={user != null ? `Messages Loading` : `Sign in as >= Moderator to View Messages`} 
                />
            </div>
        )
    )
}