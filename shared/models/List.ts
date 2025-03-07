import { Data } from './Data';
import { genID } from '../ID';
import { User } from './User';
import { Types } from '../types/types';
import { ItemTypes } from '../../components/boards/boards';
import { countPropertiesInObject, isValid, stringNoSpaces } from '../constants';

export class List extends Data {
    ID: any;
    number: number;
    gridID: string;
    boardID: string;

    creator: string;

    owner: string;
    ownerID: string;
    ownerUID: string;

    type: Types = Types.List;
    listType: any = `Vertical`;
    itemType?: ItemTypes = ItemTypes.Item;

    items?: any;
    tasks?: any;

    image = ``;
    description = ``;
    color = `Default`;
    
    options = {
        private: true,
        details: false,
        archived: false,
        recurring: false,
    }

    data?: { [key: string]: string[] } = {
        users: [],
        itemIDs: [],
        taskIDs: [],
    }

    constructor(data: Partial<List>) {
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

export const createList = (
    rank: number, 
    name: string, 
    user: User | any, 
    number: number = 1,
    gridID = ``, 
    boardID = ``, 
    listType = `Vertical`,
    itemIDs = [], 
    color = `Default`,
    description = ``,
    image = ``,
    type = Types.List, 
) => {

    let list: List = new List({
        name,
        type,
        rank,
        number,
        gridID,
        boardID,
        listType,

        image,
        color,
        description,

        ...(user != null && {
            ownerID: user?.id,
            email: user?.email,
            owner: user?.email,
            ownerUID: user?.uid,
            creator: user?.email,
        }),
    }) as List;

    if (user != null) {
        let title = stringNoSpaces(list?.title);
        let idTitle = user?.email + `_` + title;
        let extensionIDs = `_` + list?.uuid + `_` + user?.uid;
        list.ID = idTitle + extensionIDs;
        list.uid = title + `_` + list?.uuid + `_` + user?.email;
        list.id = idTitle + `_` + stringNoSpaces(list?.meta?.created) + extensionIDs;
        list.data = {
            ...list?.data,
            itemIDs,
            ...(user != null && {
                users: [user?.email],
            }),
        }
    }

    return list;
}