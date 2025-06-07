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

export default function Messages() {
    let swiperRef = useRef(null);
    let [activeSlide, setActiveSlide] = useState(0);
    let { user, boardsLoading, gridsLoading } = useContext<any>(StateContext);

    let [messages, setMessages] = useState([
        new Message({
            id: `msg-1`,
            name: `Aang`,
            date: `10:48 PM`,
            content: `WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWW WWWWW`,
            image: `https://sm.ign.com/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.jpg`,
        }),
        new Message({
            id: `msg-2`,
            name: `Aangie`,
            date: `9:30 PM`,
            content: `WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWW WWWWW`,
            image: `https://sm.ign.com/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.jpg`,
        }),
        new Message({
            id: `msg-3`,
            name: `ba`,
            date: `9:00 PM`,
            content: `WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWW WWWWW`,
            image: `https://sm.ign.com/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.jpg`,
        }),
        new Message({
            id: `msg-4`,
            name: `badwdw`,
            date: `7:00 PM`,
            content: `WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWW WWWWW`,
            image: `https://sm.ign.com/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.jpg`,
        }),
        new Message({
            id: `msg-4`,
            name: `badwdw`,
            date: `7:00 PM`,
            content: `WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWW WWWWW`,
            image: `https://sm.ign.com/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.jpg`,
        }),
        new Message({
            id: `msg-4`,
            name: `badwdw`,
            date: `7:00 PM`,
            content: `WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWW WWWWW`,
            image: `https://sm.ign.com/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.jpg`,
        }),
        new Message({
            id: `msg-4`,
            name: `badwdw`,
            date: `7:00 PM`,
            content: `WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWWW WWWWWWWWWWWWWWWWW WWWWW`,
            image: `https://sm.ign.com/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.jpg`,
        }),
    ]);

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