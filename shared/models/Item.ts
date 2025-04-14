import { Data } from './Data';
import { genID } from '../ID';
import { User } from './User';
import { TasksFilterStates, Types } from '../types/types';
import { ItemTypes } from '../../components/boards/boards';
import { countPropertiesInObject, extractURLsFromText, isValid, setItemURLs, stringNoSpaces } from '../constants';

export class Item extends Data {
    ID: any;
    number: number;
    listID: string;
    gridID: string;
    boardID: string;

    creator: string;

    owner: string;
    ownerID: string;
    ownerUID: string;

    type: Types = Types.List;
    itemType: ItemTypes = ItemTypes.Item;

    image = ``;
    video = ``;
    description = ``;
    color = `Default`;
    
    tasks?: any;
    
    options = {
        private: true,
        active: false,
        complete: false,
        archived: false,
        recurring: false,
        showTaskForm: false,
        hideCoverImage: false,
        tasksFilterState: TasksFilterStates.All_On,
        archivedData: {
            archivedBy: ``,
            archivedAt: ``,
            archivedFromGridID: ``,
            archivedFromBoardID: ``,
            archivedFromListID: ``,
        },
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
    number: number,
    gridID = ``, 
    boardID = ``, 
    listID = ``, 
    image = ``,
    video = ``,
    itemType = ItemTypes.Item,
    taskIDs = [], 
    color = `Default`,
    description = ``,
    type = Types.Item, 
) => {
    let item: Item = new Item({
        name,
        type,
        rank,
        number,
        gridID,
        listID,
        boardID,
        itemType,

        image,
        video,
        color,
        description,

        ...(user != null && {
            ownerID: user?.id,
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

    item = setItemURLs(item, [item?.name]);

    return item;
}