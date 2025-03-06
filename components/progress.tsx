import 'react-circular-progressbar/dist/styles.css';

import { getItemTaskCompletionPercentage } from './boards/item';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';

export default function Progress({ item, tasks = [], classes = `circleProgress`, injectedProgress = null }: any) {
    let allTasksComplete = tasks.every(tsk => tsk?.options?.complete);
    let progress = (!item?.options?.complete && tasks?.length > 0 && allTasksComplete) ? 99 : getItemTaskCompletionPercentage(tasks, item);
    progress = injectedProgress != null ? injectedProgress : progress;
    return (
        <div className={`progress ${classes}`}>
            <CircularProgressbar 
                value={progress} 
                text={`${progress}%`} 
                styles={buildStyles({
                    rotation: 0.5,
                    textSize: `24px`,
                    textColor: `#fff`,
                    strokeLinecap: `butt`,
                    backgroundColor: `#3e98c7`,
                    pathTransitionDuration: 0.5,
                    trailColor: `rgba(0, 194, 255, 0.2)`,
                    pathColor: progress < 100 ? `rgba(0, 194, 255, ${progress / 100})` : `var(--gameBlue)`,
                })} 
            />
        </div>
    )
}