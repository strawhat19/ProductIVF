import { Data } from './Data';
import { genID } from '../ID';
import { User } from './User';
import { TasksFilterStates, Types } from '../types/types';
import { ItemTypes } from '../../components/boards/boards';
import { countPropertiesInObject, isValid, stringNoSpaces } from '../constants';

export class Item extends Data {
    ID: any;
    gridID: string;
    boardID: string;
    listID: string;

    creator: string;

    owner: string;
    ownerID: string;
    ownerUID: string;

    type: Types = Types.List;
    itemType: ItemTypes = ItemTypes.Item;

    image = ``;
    description = ``;
    color = `Default`;
    
    options = {
        private: false,
        archived: false,
        recurring: false,
        completed: false,
        hideCoverImage: false,
        tasksFilterState: TasksFilterStates.All_On,
    }

    data?: { [key: string]: string[] } = {
        tags: [],
        users: [],
        taskIDs: [],
        imageURLs: [],
        categories: [],
        commentIDs: [],
        relatedURLs: [],
    }

    constructor(data: Partial<Item>) {
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

export const createItem = (
    rank: number, 
    name: string, 
    user: User | any, 
    gridID = ``, 
    boardID = ``, 
    listID = ``, 
    itemType = ItemTypes.Item,
    taskIDs = [`Item 1`, `Item 2`], 
    color = `Default`,
    description = ``,
    image = ``,
    type = Types.Item, 
) => {

    let item: Item = new Item({
        name,
        type,
        rank,
        gridID,
        boardID,
        listID,
        itemType,

        image,
        color,
        description,

        ...(user != null && {
            ownerID: user?.ID,
            email: user?.email,
            owner: user?.email,
            ownerUID: user?.uid,
            creator: user?.email,
        }),
    }) as Item;

    if (user != null) {
        let title = stringNoSpaces(item?.title);
        let idTitle = user?.email + `_` + title;
        let extensionIDs = `_` + item?.uuid + `_` + user?.uid;
        item.ID = idTitle + extensionIDs;
        item.uid = title + `_` + item?.uuid + `_` + user?.email;
        item.id = idTitle + `_` + stringNoSpaces(item?.meta?.created) + extensionIDs;
        item.data = {
            ...item?.data,
            taskIDs,
            ...(user != null && {
                users: [user?.email],
            }),
        }
    }

    return item;
}