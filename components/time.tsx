import moment from 'moment-timezone';
import { StateContext } from '../pages/_app';
import { useContext, useEffect } from 'react';
import { momentFormats } from '../shared/constants';

export default function Time({ dynamic = true, wSeconds = true }) {
    const { currentTime, setCurrentTime } = useContext<any>(StateContext);

    useEffect(() => {
        const updateTime = () => {
            const format = wSeconds ? momentFormats.wSeconds : momentFormats.default;
            setCurrentTime(moment().format(format));
        }

        updateTime();

        if (dynamic == true) {
            const interval = setInterval(updateTime, 1000);
            return () => clearInterval(interval);
        }
    }, [dynamic, wSeconds])

    return <>
        <div className={`timeComponent`}>
            <div className={`timeElement`}>
                {currentTime}
            </div>
        </div>
    </>
}