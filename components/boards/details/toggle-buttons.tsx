import { useEffect, useState } from 'react';

export class ToggleButtonsProps {
    item: any;
    activeTasks: any[];
    completeTasks: any[];
    onActiveChange?: (active: string) => void;
};

export default function ToggleButtons({ item, activeTasks, completeTasks, onActiveChange = () => {} }: ToggleButtonsProps) {

    let [active, setActive] = useState(
        item?.options?.complete 
        ? `complete` 
        : (item?.options?.active || activeTasks?.length > 0 || completeTasks?.length > 0) 
        ? `active` 
        : `to do`
    );
    
    useEffect(() => {
        onActiveChange(active);
    }, [active])
    
    return (
        <div className={`toggle-buttons`}>
            {item?.data?.taskIDs?.length == 0 && <>
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