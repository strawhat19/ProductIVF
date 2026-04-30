import { useEffect, useState } from 'react';
import { Task } from '../../../shared/models/Task';

export class ToggleButtonsProps {
    item: any;
    toDoTasks: Task[];
    activeTasks: Task[];
    completeTasks: Task[];
    onActiveChange?: (active: string) => void;
};

export default function ToggleButtons({ item, activeTasks, completeTasks, toDoTasks, onActiveChange = () => {} }: ToggleButtonsProps) {
    let [active, setActive] = useState(item?.status?.toLowerCase());
    
    useEffect(() => {
        onActiveChange(active);
    }, [active])
    
    useEffect(() => {
        setActive(item?.status?.toLowerCase())
    }, [item])
    
    return (
        <div className={`toggle-buttons`}>
            {(item?.data?.taskIDs?.length == 0 || item?.data?.taskIDs?.length == toDoTasks?.length) && <>
                <div 
                    onClick={() => setActive(`to do`)}
                    className={`toggle-button iconButton ${(active === `to do` || (item?.options?.active == false && active == `to do`)) ? `active` : ``}`} 
                >
                    <input 
                        type={`radio`} 
                        value={`active`} 
                        onChange={() => {}} 
                        name={`toggleActive`} 
                        checked={(active === `to do` || (item?.options?.active == false && active == `to do`))} 
                    />
                    <label className={`flexLabel`}>
                        <i className={`fas fa-plus`} />
                        To Do
                    </label>
                </div>
            </>}
            <div 
                onClick={() => setActive(`active`)}
                className={`toggle-button iconButton ${(active === `active` || (active == `active` && (activeTasks?.length > 0 || completeTasks?.length > 0))) ? `active` : ``}`} 
            >
                <input 
                    type={`radio`} 
                    value={`active`} 
                    onChange={() => {}} 
                    name={`toggleActive`} 
                    checked={(active === `active` || (active == `active` && (activeTasks?.length > 0 || completeTasks?.length > 0)))} 
                />
                <label className={`flexLabel`}>
                    <i className={`fas fa-play-circle`} />
                    Active
                </label>
            </div>
            <div 
                onClick={() => setActive(`review`)}
                className={`toggle-button iconButton ${(active === `review`) ? `active` : ``}`} 
            >
                <input 
                    type={`radio`} 
                    value={`review`} 
                    onChange={() => {}} 
                    name={`toggleReview`} 
                    checked={(active === `review`)} 
                />
                <label className={`flexLabel`}>
                    <i className={`fas fa-star-of-life`} />
                    Review
                </label>
            </div>
            <div 
                onClick={() => setActive(`complete`)}
                className={`toggle-button iconButton ${active === `complete` ? `active` : ``}`} 
            >
                <input 
                    type={`radio`} 
                    value={`complete`} 
                    onChange={() => {}} 
                    name={`toggleComplete`} 
                    checked={active === `complete`} 
                />
                <label className={`flexLabel`}>
                    <i className={`fas fa-check-circle`} />
                    Done
                </label>
            </div>
        </div>
    )
}