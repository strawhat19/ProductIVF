import 'swiper/css';
// import 'swiper/css/effect-cards';
// import { EffectCards } from 'swiper/modules';
import { StateContext } from '../../pages/_app';
import { Swiper, SwiperSlide } from 'swiper/react';
import { RolesMap } from '../../shared/models/User';
import { useContext, useRef, useState } from 'react';
import MessagePreview from './message/message-preview';
import IVFSkeleton from '../loaders/skeleton/ivf_skeleton';

export default function Messages() {
    let swiperRef = useRef(null);
    let [messages, setMessages] = useState([]);
    let [activeSlide, setActiveSlide] = useState(0);
    let { user, boardsLoading, gridsLoading } = useContext<any>(StateContext);

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
                            {activeSlide == 0 ? `Messages` : `Chat`}
                        </h2>
                        <i onClick={goNext} className={`mainColor fas ${activeSlide == 0 ? `fa-edit` : `fa-chevron-left`} cursorPointer`} style={{ fontSize: 14 }} />
                    </div>
                    {/* <div className={`messagesSearch`}>
                        [Messages Search Goes Here]
                    </div> */}
                </div>
                <div className={`messagesContainer`}>                  
                    <Swiper 
                        loop={true}
                        ref={swiperRef}
                        spaceBetween={50} 
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
                                <MessagePreview onClick={goNext} />
                                <MessagePreview onClick={goNext} />
                                <MessagePreview onClick={goNext} />
                                <MessagePreview onClick={goNext} />
                                <MessagePreview onClick={goNext} />
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className={`messagesPreviewContainer`}>
                                <MessagePreview onClick={goNext} />
                                <MessagePreview onClick={goNext} />
                                <MessagePreview onClick={goNext} />
                                <MessagePreview onClick={goNext} />
                                <MessagePreview onClick={goNext} />
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </div>
        </> : (
            (gridsLoading || boardsLoading) ? (
               <div style={{ padding: 15 }}>
                    <IVFSkeleton 
                        height={65}
                        showLoading={true}
                        skeletonContainerGap={15}
                        label={`Messages Loading`} 
                        className={`boardsSkeleton`} 
                        skeletonContainerWidth={`92%`}
                    />
               </div>
            ) : (
                <div className={`messagesZeroState`}>
                    <i className={`mainColor fas fa-user-slash`} />
                    Sign in as {`>=`} Moderator to View Messages
                </div>
            )
        )
    )
}