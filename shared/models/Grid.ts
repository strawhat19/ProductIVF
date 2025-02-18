import { Data } from './Data';
import { genID } from '../ID';
import { GridTypes, Types } from '../types/types';
import { countPropertiesInObject, isValid } from '../constants';

export class Grid extends Data {
    ID: any;
    
    creator: string;

    owner: string;
    ownerID: string;
    ownerUID: string;
    
    type: Types = Types.Grid;
    gridType: GridTypes = GridTypes.Personal;

    items?: any;
    tasks?: any;
    lists?: any;
    boards?: any;
    focusedBoard?: any;

    image = ``;
    description = ``;
    color = `Default`;

    options = {
        private: true,
        archived: false,
        nameLabel: true,
        newestBoardsOnTop: true,
    }

    data?: { [key: string]: string[] } = {
        users: [],
        itemIDs: [],
        listIDs: [],
        taskIDs: [],
        boardIDs: [],
    }

    constructor(data: Partial<Grid>) {
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