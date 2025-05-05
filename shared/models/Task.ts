import { Data } from './Data';
import { User } from './User';
import { genID } from '../ID';
import { Types } from '../types/types';
import { countPropertiesInObject, getItemOrTaskURLs, isValid, stringNoSpaces } from '../constants';

export class Task extends Data {
    ID: any;
    number: number;
    gridID: string;
    boardID: string;
    listID: string;
    itemID: string;

    creator: string;

    owner: string;
    ownerID: string;
    ownerUID: string;

    taskType: any = `To Do`;
    type: Types = Types.Task;

    image = ``;
    description = ``;
    color = `Default`;
    
    options = {
        private: true,
        active: false,
        complete: false,
        archived: false,
        recurring: false,
    }

    data?: { [key: string]: string[] } = {
        users: [],
        relatedURLs: [],
    }

    constructor(data: Partial<Task>) {
        super(data);
        Object.assign(this, data);

        this.A = this.name;

        let ID = genID(this.type, this.rank, this.name);
        let { id, date, title, uuid } = ID;

        if (!isValid(this.id)) this.id = id;
        if (!isValid(this.uuid)) this.uuid = uuid;
        if (!isValid(this.title)) this.title = title;
        if (!isValid(this.meta.created)) this.meta.created = date;
        if (!isValid(this.meta.updated)) this.meta.updated = date;
        if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
    }
}

export const createTask = (
    rank: number, 
    name: string, 
    user: User | any, 
    gridID = ``, 
    boardID = ``, 
    listID = ``, 
    itemID = ``, 
    number: number = 1,
    taskType = `To Do`,
    color = `Default`,
    description = ``,
    image = ``,
    type = Types.Task, 
) => {

    let task: Task = new Task({
        name,
        type,
        rank,
        number,
        gridID,
        boardID,
        listID,
        itemID,
        taskType,

        image,
        color,
        description,

        ...(user != null && {
            ownerID: user?.id,
            owner: user?.email,
            email: user?.email,
            ownerUID: user?.uid,
            creator: user?.email,
        }),
    }) as Task;

    if (user != null) {
        let title = stringNoSpaces(task?.title);
        let idTitle = user?.email + `_` + title;
        let extensionIDs = `_` + task?.uuid + `_` + user?.uid;
        task.ID = idTitle + extensionIDs;
        task.uid = title + `_` + task?.uuid + `_` + user?.email;
        task.id = idTitle + `_` + stringNoSpaces(task?.meta?.created) + extensionIDs;
        task.data = {
            ...task?.data,
            ...(user != null && {
                users: [user?.email],
            }),
        }
    }

    const taskURLs = getItemOrTaskURLs(task, [task?.name]);
    task.data.relatedURLs = taskURLs;

    return task;
}