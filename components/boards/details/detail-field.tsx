import { capWords } from '../../../pages/_app';
import { Item } from '../../../shared/models/Item';
import { Task } from '../../../shared/models/Task';
import { isValid } from '../../../shared/constants';
import { Types } from '../../../shared/types/types';

export enum Statuses {
    Next = `To Do`,
    Active = `Active`,
    Complete = `Complete`,
}

export enum DetailTypes {
    Dates = `Dates`,
    Status = `Status`,
}

export const getItemOrTaskStatus = (itemOrTask: Item | Task, tasks: Task[] = []): Statuses => {
    let status: Statuses = Statuses.Next;

    const statusIsTrue = (status) => isValid(status) && status == true;

    let isActive = statusIsTrue(itemOrTask?.options?.active);
    let isComplete = statusIsTrue(itemOrTask?.options?.complete);
    
    let isItem = itemOrTask?.type == Types.Item;
    let isItemWActiveTasks = isItem && (isValid(tasks) && tasks?.some(tsk => statusIsTrue(tsk?.options?.active) || statusIsTrue(tsk?.options?.complete)));

    if (isActive || isItemWActiveTasks) status = Statuses.Active;
    if (isComplete) status = Statuses.Complete;

    return status;
}

export default function DetailField({ item, task = undefined, type = DetailTypes.Status, tasks = undefined }) {

    const detailFieldElement = (itemOrTask: Item | Task, className = `dateDetail`, key: `created` | `updated` = `created`) => {
        return <>
            <span className={`detailField itemDate ${className} itemName textOverflow extended flex row`}>
                <i className={`status statusLabel`}>
                    {type == DetailTypes.Status ? `Sta` : capWords(key?.slice(0, 3))}.
                </i> 
                <span className={`statusField`}>
                    {type == DetailTypes.Status ? getItemOrTaskStatus(itemOrTask, tasks) : itemOrTask?.meta[key]}
                </span>
            </span>
        </>
    }

    return <>
        {task == undefined ? <>
            {type == DetailTypes.Status ? <>
                {detailFieldElement(item, `itemDetailField itemStatus`)}
            </> : <>
                {item?.meta?.created && !item?.meta?.updated ? (
                    detailFieldElement(item, `itemDetailField itemCreated`)
                ) : item?.meta?.updated ? (
                    detailFieldElement(item, `itemDetailField itemUpdated`, `updated`)
                ) : null}
            </>}
        </> : <>            
            {type == DetailTypes.Status ? <>
                {detailFieldElement(task, `taskDetailField taskStatus taskDate ${(item?.options?.complete || task?.options?.complete) ? `taskCompleteDate` : `taskActiveDate`}`)}
            </> : <>
                {task?.meta?.created && !task?.meta?.updated ? (
                    detailFieldElement(task, `taskDetailField taskDate taskCreated ${(item?.options?.complete || task?.options?.complete) ? `taskCompleteDate` : `taskActiveDate`}`)
                ) : task?.meta?.updated ? (
                    detailFieldElement(task, `taskDetailField taskDate taskUpdated ${(item?.options?.complete || task?.options?.complete) ? `taskCompleteDate` : `taskActiveDate`}`, `updated`)
                ) : null}
            </>}
        </>}
    </>
}